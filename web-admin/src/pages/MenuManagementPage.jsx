// src/pages/MenuManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, MoreVertical, Star, X } from 'lucide-react';
import { menuAPI, reviewsAPI } from '../services/api';
import { notify } from '../utils/notifications';
import './MenuManagementPage.css';

const MenuManagementPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  // Reviews modal state
  const [reviewsModal, setReviewsModal] = useState(null); // { item, reviews, loading }
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    category: 'burger',
    price: '',
    preparationTime: 15,
    isAvailable: true,
    isPopular: false,
    image: '',
    supplements: [],
    sizes: {
      petite: '',
      moyenne: '',
    },
    tacoOptions: {
      seul: '',
      menu: '',
    },
  });

  const getItemPriceDisplay = (item) => {
    if (item.price) {
      return `${item.price} DH`;
    }
    if (item.sizes) {
      const prices = Object.values(item.sizes).filter(Boolean);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice ? `${minPrice} DH` : `${minPrice} - ${maxPrice} DH`;
      }
    }
    if (item.tacoOptions) {
      const prices = Object.values(item.tacoOptions).filter(Boolean);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice ? `${minPrice} DH` : `${minPrice} - ${maxPrice} DH`;
      }
    }
    return '0 DH';
  };

  const categories = [
    { value: 'burger', label: 'Burgers', icon: '🍔' },
    { value: 'pizza', label: 'Pizzas', icon: '🍕' },
    { value: 'tacos', label: 'Tacos', icon: '🌮' },
    { value: 'pasta', label: 'Pâtes', icon: '🍝' },
    { value: 'sandwich', label: 'Sandwichs', icon: '🥪' },
    { value: 'salad', label: 'Salades', icon: '🥗' },
    { value: 'dessert', label: 'Desserts', icon: '🍰' },
    { value: 'drink', label: 'Boissons', icon: '🥤' },
  ];

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.menu-action-trigger-btn') && !e.target.closest('.actions-dropdown-menu')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const loadMenu = async () => {
    try {
      const response = await menuAPI.getAll();
      if (response.success) {
        setMenuItems(response.menuItems);
      }
    } catch (_error) {
      notify.error('Erreur lors du chargement du menu');
    } finally {
      setLoading(false);
    }
  };

  const openReviewsModal = async (item) => {
    setReviewsModal({ item, reviews: [], loading: true });
    try {
      const res = await reviewsAPI.getForMenuItem(item._id);
      setReviewsModal({ item, reviews: res.reviews || [], loading: false });
    } catch (_err) {
      setReviewsModal({ item, reviews: [], loading: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data based on category
    const submitData = {
      ...formData,
      preparationTime: parseInt(formData.preparationTime) || 15,
    };

    if (formData.category === 'pizza') {
      submitData.price = undefined;
      submitData.sizes = {
        petite: formData.sizes.petite !== '' ? parseFloat(formData.sizes.petite) : undefined,
        moyenne: formData.sizes.moyenne !== '' ? parseFloat(formData.sizes.moyenne) : undefined,
      };
      submitData.tacoOptions = undefined;
    } else if (formData.category === 'tacos') {
      submitData.price = undefined;
      submitData.tacoOptions = {
        seul: formData.tacoOptions.seul !== '' ? parseFloat(formData.tacoOptions.seul) : undefined,
        menu: formData.tacoOptions.menu !== '' ? parseFloat(formData.tacoOptions.menu) : undefined,
      };
      submitData.sizes = undefined;
    } else {
      submitData.price = parseFloat(formData.price) || 0;
      submitData.sizes = undefined;
      submitData.tacoOptions = undefined;
    }

    const loadingToast = notify.loading('Enregistrement...');

    try {
      console.log('📝 Soumission:', editingItem ? 'Modification' : 'Création', submitData);

      if (editingItem) {
        const response = await menuAPI.update(editingItem._id, submitData);
        console.log('✅ Réponse update:', response);
        notify.dismiss(loadingToast);
        notify.success('Plat modifié avec succès!');
      } else {
        const response = await menuAPI.create(submitData);
        console.log('✅ Réponse create:', response);
        notify.dismiss(loadingToast);
        notify.success('Plat ajouté avec succès!');
      }

      loadMenu();
      closeModal();
    } catch (error) {
      console.error('❌ Erreur handleSubmit:', error);
      console.error('❌ Détails erreur:', error.response?.data || error.message);
      notify.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
      notify.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce plat?')) return;

    const loadingToast = notify.loading('Suppression...');
    try {
      console.log('🗑️ Suppression plat:', id);
      const response = await menuAPI.delete(id);
      console.log('✅ Réponse delete:', response);
      notify.dismiss(loadingToast);
      notify.success('Plat supprimé!');
      loadMenu();
    } catch (error) {
      console.error('❌ Erreur delete:', error);
      notify.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
      notify.error(errorMessage);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      console.log('🔄 Toggle availability:', id, !currentStatus);
      const response = await menuAPI.updateAvailability(id, !currentStatus);
      console.log('✅ Réponse toggle:', response);
      notify.success(currentStatus ? 'Plat désactivé' : 'Plat activé');
      loadMenu();
    } catch (error) {
      console.error('❌ Erreur toggle:', error);
      const errorMessage = error.response?.data?.message || 'Erreur';
      notify.error(errorMessage);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        nameAr: item.nameAr || '',
        description: item.description || '',
        descriptionAr: item.descriptionAr || '',
        category: item.category,
        price: item.price !== undefined && item.price !== null ? item.price : '',
        preparationTime: item.preparationTime || 15,
        isAvailable: item.isAvailable,
        isPopular: item.isPopular || false,
        image: item.image || '',
        supplements: item.supplements || [],
        sizes: item.sizes ? {
          petite: item.sizes.petite !== undefined && item.sizes.petite !== null ? item.sizes.petite : '',
          moyenne: item.sizes.moyenne !== undefined && item.sizes.moyenne !== null ? item.sizes.moyenne : '',
        } : { petite: '', moyenne: '' },
        tacoOptions: item.tacoOptions ? {
          seul: item.tacoOptions.seul !== undefined && item.tacoOptions.seul !== null ? item.tacoOptions.seul : '',
          menu: item.tacoOptions.menu !== undefined && item.tacoOptions.menu !== null ? item.tacoOptions.menu : '',
        } : { seul: '', menu: '' }
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        category: 'burger',
        price: '',
        preparationTime: 15,
        isAvailable: true,
        isPopular: false,
        image: '',
        supplements: [],
        sizes: {
          petite: '',
          moyenne: '',
        },
        tacoOptions: {
          seul: '',
          menu: '',
        },
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="menu-management-page">
      <div className="page-header">
        <h1>🍕 Gestion du Menu</h1>
        <button className="add-btn" onClick={() => openModal()}>
          <Plus size={20} />
          Ajouter un plat
        </button>
      </div>

      <div className="menu-grid">
        {menuItems.map(item => (
          <div key={item._id} className="menu-item-card">
            <div className="item-image">
              {item.image ? (
                <img src={item.image} alt={item.name} className="menu-mgmt-img" />
              ) : (
                categories.find(c => c.value === item.category)?.icon || '🍽️'
              )}
            </div>
            <div className="item-info">
              <h3>{item.name}</h3>
              {item.nameAr && <p className="name-ar">{item.nameAr}</p>}
              <p className="description">{item.description}</p>
              <div className="item-meta-price">
                <span className="price">{getItemPriceDisplay(item)}</span>
              </div>
              {/* Rating display */}
              <div className="item-rating-row" onClick={() => openReviewsModal(item)} title="Voir les avis">
                <span className="rating-stars">
                  {[1,2,3,4,5].map(s => (
                    <Star
                      key={s}
                      size={13}
                      fill={s <= Math.round(item.averageRating || 0) ? '#facc15' : 'none'}
                      color={s <= Math.round(item.averageRating || 0) ? '#facc15' : '#6b7280'}
                    />
                  ))}
                </span>
                <span className="rating-score">
                  {item.averageRating > 0 ? item.averageRating.toFixed(1) : '—'}
                </span>
                <span className="rating-count">({item.reviewsCount || 0} avis)</span>
              </div>
              <div className="item-status-row">
                <span className={`status ${item.isAvailable ? 'available' : 'unavailable'}`}>
                  {item.isAvailable ? '✓ Disponible' : '✕ Indisponible'}
                </span>
                {item.isPopular && <span className="status popular">★ Populaire</span>}
              </div>
            </div>
            <div className="item-actions">
              <div className="dropdown-container">
                <button
                  className="menu-action-trigger-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdownId(activeDropdownId === item._id ? null : item._id);
                  }}
                  title="Actions"
                >
                  <MoreVertical size={18} />
                </button>
                {activeDropdownId === item._id && (
                  <div className="actions-dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(item);
                        setActiveDropdownId(null);
                      }}
                    >
                      <Edit2 size={14} />
                      Modifier
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAvailability(item._id, item.isAvailable);
                        setActiveDropdownId(null);
                      }}
                    >
                      {item.isAvailable ? <EyeOff size={14} /> : <Eye size={14} />}
                      {item.isAvailable ? 'Cacher' : 'Afficher'}
                    </button>
                    <button
                      className="dropdown-item delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                        setActiveDropdownId(null);
                      }}
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Modifier le plat' : 'Ajouter un plat'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom (FR) *</label>
                  <input
                    type="text"
                    placeholder="Ex: Tacos Poulet Grillé"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom (AR)</label>
                  <input
                    type="text"
                    placeholder="Ex: Nom en Arabe"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description (FR)</label>
                <textarea
                  placeholder="Ex: Escalope de poulet, sauce fromagère, frites..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Description (AR)</label>
                <textarea
                  placeholder="Ex: Description en Arabe"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Lien de l'image (URL)</label>
                <input
                  type="text"
                  placeholder="Ex: https://images.pexels.com/photos/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
                {formData.image && (
                  <div className="image-preview-container">
                    <img
                      src={formData.image}
                      alt="Prévisualisation"
                      className="form-image-preview"
                      onError={(e) => { e.target.style.display = 'none'; }}
                      onLoad={(e) => { e.target.style.display = 'block'; }}
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.category === 'pizza' ? (
                  <>
                    <div className="form-group">
                      <label>Prix Petite (DH) *</label>
                      <input
                        type="number"
                        placeholder="Ex: 25"
                        value={formData.sizes.petite}
                        onChange={(e) => setFormData({
                          ...formData,
                          sizes: { ...formData.sizes, petite: e.target.value }
                        })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Prix Grande (DH) *</label>
                      <input
                        type="number"
                        placeholder="Ex: 35"
                        value={formData.sizes.moyenne}
                        onChange={(e) => setFormData({
                          ...formData,
                          sizes: { ...formData.sizes, moyenne: e.target.value }
                        })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </>
                ) : formData.category === 'tacos' ? (
                  <>
                    <div className="form-group">
                      <label>Prix Seul (DH) *</label>
                      <input
                        type="number"
                        placeholder="Ex: 30"
                        value={formData.tacoOptions.seul}
                        onChange={(e) => setFormData({
                          ...formData,
                          tacoOptions: { ...formData.tacoOptions, seul: e.target.value }
                        })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Prix Menu (DH) *</label>
                      <input
                        type="number"
                        placeholder="Ex: 45"
                        value={formData.tacoOptions.menu}
                        onChange={(e) => setFormData({
                          ...formData,
                          tacoOptions: { ...formData.tacoOptions, menu: e.target.value }
                        })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label>Prix (DH) *</label>
                    <input
                      type="number"
                      placeholder="Ex: 45"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Temps (min)</label>
                  <input
                    type="number"
                    placeholder="Ex: 15"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    min="1"
                  />
                </div>
              </div>

              {/* Gestion des Suppléments */}
              <div className="form-group supplements-management-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '15px' }}>
                <label style={{ fontWeight: '700', fontSize: '1.05rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Option Suppléments & Extras</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                    Ajouter des extras sélectionnables
                  </span>
                </label>

                {/* Choix rapides prédéfinis */}
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Ajout rapide :</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { name: 'Boisson (Coca/Fanta)', price: 10 },
                      { name: 'Portion de Frites', price: 12 },
                      { name: 'Supplément Fromage', price: 5 },
                      { name: 'Extra Sauce', price: 2 }
                    ].map((defaultSupp, idx) => {
                      const exists = formData.supplements?.some(s => s.name === defaultSupp.name);
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={exists}
                          onClick={() => {
                            const currentSups = formData.supplements || [];
                            setFormData({
                              ...formData,
                              supplements: [...currentSups, { name: defaultSupp.name, price: defaultSupp.price }]
                            });
                          }}
                          style={{
                            padding: '6px 12px',
                            background: exists ? 'var(--bg-tertiary)' : 'rgba(250, 204, 21, 0.1)',
                            border: exists ? '1px solid var(--border-color)' : '1px solid var(--primary-color)',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            color: exists ? 'var(--text-secondary)' : 'var(--primary-color)',
                            cursor: exists ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                        >
                          + {defaultSupp.name} (+{defaultSupp.price} DH)
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ajouter un supplément personnalisé */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nom de l'extra</span>
                    <input
                      type="text"
                      id="custom-supp-name"
                      placeholder="Ex: Supplément Viande"
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ width: '100px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prix (DH)</span>
                    <input
                      type="number"
                      id="custom-supp-price"
                      placeholder="0"
                      min="0"
                      step="0.5"
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById('custom-supp-name');
                      const priceInput = document.getElementById('custom-supp-price');
                      const name = nameInput?.value?.trim();
                      const price = parseFloat(priceInput?.value) || 0;

                      if (!name) {
                        notify.error('Le nom du supplément est obligatoire');
                        return;
                      }

                      const currentSups = formData.supplements || [];
                      setFormData({
                        ...formData,
                        supplements: [...currentSups, { name, price }]
                      });

                      if (nameInput) nameInput.value = '';
                      if (priceInput) priceInput.value = '';
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                      color: '#1f2937',
                      border: '2px solid transparent',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    Ajouter
                  </button>
                </div>

                {/* Liste des suppléments configurés */}
                {formData.supplements && formData.supplements.length > 0 && (
                  <div style={{ marginTop: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Suppléments activés :</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {formData.supplements.map((supp, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{supp.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#10b981' }}>+{supp.price} DH</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  supplements: formData.supplements.filter((_, i) => i !== idx)
                                });
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '700',
                                padding: '2px'
                              }}
                              title="Supprimer"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  Disponible
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  />
                  Populaire
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  {editingItem ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {reviewsModal && (
        <div className="modal-overlay" onClick={() => setReviewsModal(null)}>
          <div className="modal-content reviews-modal-content" onClick={e => e.stopPropagation()}>
            <div className="reviews-modal-header">
              <div>
                <h2>⭐ Avis clients — {reviewsModal.item.name}</h2>
                <p className="reviews-modal-meta">
                  Note: <strong>{reviewsModal.item.averageRating?.toFixed(1) || '—'}/5</strong>
                  &nbsp;·&nbsp; {reviewsModal.item.reviewsCount || 0} avis
                </p>
              </div>
              <button className="reviews-modal-close" onClick={() => setReviewsModal(null)}>
                <X size={20} />
              </button>
            </div>

            {reviewsModal.loading ? (
              <div className="reviews-loading">Chargement...</div>
            ) : reviewsModal.reviews.length === 0 ? (
              <div className="reviews-empty">Aucun avis pour ce plat pour l'instant.</div>
            ) : (
              <div className="reviews-list">
                {reviewsModal.reviews.map((rev) => (
                  <div key={rev._id} className="review-entry">
                    <div className="review-entry-header">
                      <span className="reviewer-name">{rev.user?.name || 'Client'}</span>
                      <div className="review-entry-stars">
                        {[1,2,3,4,5].map(s => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= rev.rating ? '#facc15' : 'none'}
                            color={s <= rev.rating ? '#facc15' : '#6b7280'}
                          />
                        ))}
                      </div>
                      <span className="review-date">{new Date(rev.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {rev.comment && <p className="review-comment">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagementPage;