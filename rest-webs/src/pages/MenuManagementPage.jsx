// src/pages/MenuManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { menuAPI } from '../services/api';
import { notify } from '../utils/notifications';
import './MenuManagementPage.css';

const MenuManagementPage = ({ t }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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
  });

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

  const loadMenu = async () => {
    try {
      const response = await menuAPI.getAll();
      if (response.success) {
        setMenuItems(response.menuItems);
      }
    } catch (error) {
      notify.error('Erreur lors du chargement du menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = notify.loading('Enregistrement...');

    try {
      if (editingItem) {
        await menuAPI.update(editingItem._id, formData);
        notify.dismiss(loadingToast);
        notify.success('Plat modifié avec succès!');
      } else {
        await menuAPI.create(formData);
        notify.dismiss(loadingToast);
        notify.success('Plat ajouté avec succès!');
      }
      
      loadMenu();
      closeModal();
    } catch (error) {
      notify.dismiss(loadingToast);
      notify.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce plat?')) return;

    const loadingToast = notify.loading('Suppression...');
    try {
      await menuAPI.delete(id);
      notify.dismiss(loadingToast);
      notify.success('Plat supprimé!');
      loadMenu();
    } catch (error) {
      notify.dismiss(loadingToast);
      notify.error('Erreur lors de la suppression');
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await menuAPI.updateAvailability(id, !currentStatus);
      notify.success(currentStatus ? 'Plat désactivé' : 'Plat activé');
      loadMenu();
    } catch (error) {
      notify.error('Erreur');
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
        price: item.price,
        preparationTime: item.preparationTime || 15,
        isAvailable: item.isAvailable,
        isPopular: item.isPopular || false,
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
              {categories.find(c => c.value === item.category)?.icon || '🍽️'}
            </div>
            <div className="item-info">
              <h3>{item.name}</h3>
              {item.nameAr && <p className="name-ar">{item.nameAr}</p>}
              <p className="description">{item.description}</p>
              <div className="item-meta">
                <span className="price">{item.price} DH</span>
                <span className={`status ${item.isAvailable ? 'available' : 'unavailable'}`}>
                  {item.isAvailable ? '✓ Disponible' : '✕ Indisponible'}
                </span>
              </div>
            </div>
            <div className="item-actions">
              <button
                className="action-btn edit"
                onClick={() => openModal(item)}
                title="Modifier"
              >
                <Edit2 size={16} />
              </button>
              <button
                className="action-btn toggle"
                onClick={() => toggleAvailability(item._id, item.isAvailable)}
                title={item.isAvailable ? 'Désactiver' : 'Activer'}
              >
                {item.isAvailable ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                className="action-btn delete"
                onClick={() => handleDelete(item._id)}
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
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
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom (AR)</label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description (FR)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Description (AR)</label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prix (DH) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Temps (min)</label>
                  <input
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({...formData, preparationTime: e.target.value})}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                  />
                  Disponible
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
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
    </div>
  );
};

export default MenuManagementPage;