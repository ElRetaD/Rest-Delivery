// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Lock, Package, History, LogOut, Star } from 'lucide-react';
import { ordersAPI, authAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = ({ setCurrentPage }) => {
  const { user, isLoggedIn, loading, login, register, logout, googleLogin, updateUserProfile, addAddress, removeAddress, setDefaultAddress, updateAddress } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Review state
  const [reviewModal, setReviewModal] = useState(null); // { orderId, items }
  const [reviewRatings, setReviewRatings] = useState({}); // { menuItemId: { rating, comment } }
  const [reviewedOrders, setReviewedOrders] = useState({}); // { orderId: { menuItemId: {...} } }
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState({}); // { menuItemId: starIndex }
  const [addressForm, setAddressForm] = useState({
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: 'Casablanca',
    postalCode: '',
    isDefault: false
  });

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  // State pour le formulaire de profil
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
  });

  // State pour le changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      loadOrders();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      if (response.success) {
        setOrders(response.orders);
        // Charger le statut des avis pour les commandes livrées
        const deliveredOrders = response.orders.filter(o => o.status === 'delivered');
        const statusMap = {};
        await Promise.all(
          deliveredOrders.map(async (order) => {
            try {
              const statusRes = await reviewsAPI.getOrderReviewStatus(order._id);
              if (statusRes.success) {
                statusMap[order._id] = statusRes.reviewedItems;
              }
            } catch (_) {
              // silently ignore
            }
          })
        );
        setReviewedOrders(statusMap);
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  // Ouvrir le modal d'avis pour une commande
  const openReviewModal = (order) => {
    setReviewModal({ orderId: order._id, items: order.items });
    // Pré-remplir avec les avis déjà soumis
    const alreadyReviewed = reviewedOrders[order._id] || {};
    const initialRatings = {};
    order.items.forEach(item => {
      if (item.menuItem && alreadyReviewed[item.menuItem]) {
        initialRatings[item.menuItem] = {
          rating: alreadyReviewed[item.menuItem].rating,
          comment: alreadyReviewed[item.menuItem].comment || '',
        };
      } else if (item.menuItem) {
        initialRatings[item.menuItem] = { rating: 0, comment: '' };
      }
    });
    setReviewRatings(initialRatings);
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    const { orderId, items } = reviewModal;

    // Vérifier qu'au moins un plat a une note
    const toSubmit = items.filter(
      item => item.menuItem && reviewRatings[item.menuItem]?.rating > 0
    );

    if (toSubmit.length === 0) {
      toast.error('Veuillez noter au moins un plat');
      return;
    }

    setReviewSubmitting(true);
    let successCount = 0;
    let skipCount = 0;

    for (const item of toSubmit) {
      const { rating, comment } = reviewRatings[item.menuItem] || {};
      if (!rating) continue;

      // Skip already reviewed items
      if (reviewedOrders[orderId]?.[item.menuItem]) {
        skipCount++;
        continue;
      }

      try {
        await reviewsAPI.submit(orderId, item.menuItem, rating, comment);
        successCount++;
      } catch (err) {
        if (err.response?.status === 409) {
          skipCount++; // already reviewed
        } else {
          toast.error(`Erreur pour ${item.name}`);
        }
      }
    }

    setReviewSubmitting(false);
    setReviewModal(null);

    if (successCount > 0) {
      toast.success(`${successCount} avis soumis avec succès ! Merci 🙏`);
      // Refresh review status
      try {
        const statusRes = await reviewsAPI.getOrderReviewStatus(orderId);
        if (statusRes.success) {
          setReviewedOrders(prev => ({ ...prev, [orderId]: statusRes.reviewedItems }));
        }
      } catch (_) {}
    } else if (skipCount > 0) {
      toast.error('Vous avez déjà soumis des avis pour ces plats');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(loginForm.email, loginForm.password);
    if (result.success) {
      setActiveTab('profile');
    } else {
      toast.error(result.message || 'Email ou mot de passe incorrect');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await register({
      ...registerForm,
      role: 'client',
    });
    if (result.success) {
      toast.success('Inscription réussie ! Bienvenue 🎉');
      setActiveTab('profile');
      setCurrentPage('home');
    } else {
      toast.error(result.message || 'Erreur lors de l\'inscription');
    }
  };

  const handleLogout = () => {
    logout();
    setOrders([]);
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      setActiveTab('profile');
    } catch (error) {
      console.error('Erreur Google Auth:', error);
      toast.error(error.message || 'Erreur lors de la connexion Google');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const result = await updateUserProfile({
      name: profileForm.name,
      phone: profileForm.phone,
    });

    if (result.success) {
      toast.success('Profil mis à jour !');
    } else {
      toast.error(result.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setPasswordLoading(true);
    try {
      const result = await authAPI.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      if (result.success) {
        toast.success('Mot de passe mis à jour avec succès !');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur password change:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      name: '',
      firstName: '',
      lastName: '',
      phone: '',
      street: '',
      city: 'Casablanca',
      postalCode: '',
      isDefault: false
    });
    setShowAddAddressForm(true);
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name || '',
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      phone: address.phone || '',
      street: address.street || '',
      city: address.city || 'Casablanca',
      postalCode: address.postalCode || '',
      isDefault: address.isDefault || false
    });
    setShowAddAddressForm(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (editingAddress) {
      result = await updateAddress(editingAddress._id, addressForm);
    } else {
      result = await addAddress(addressForm);
    }

    if (result.success) {
      toast.success(editingAddress ? 'Adresse mise à jour !' : 'Adresse ajoutée !');
      setShowAddAddressForm(false);
      setEditingAddress(null);
      setAddressForm({ name: '', firstName: '', lastName: '', phone: '', street: '', city: 'Casablanca', postalCode: '', isDefault: false });
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveAddress = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette adresse ?')) return;
    const result = await removeAddress(id);
    if (result.success) {
      toast.success('Adresse supprimée !');
    } else {
      toast.error(result.message);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    const result = await setDefaultAddress(id);
    if (result.success) {
      toast.success('Adresse par défaut mise à jour !');
    } else {
      toast.error(result.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    try {
      const response = await ordersAPI.cancel(orderId);
      if (response.success) {
        setOrders(orders.map(o =>
          o._id === orderId ? { ...o, status: 'cancelled' } : o
        ));
        toast.success('Commande annulée avec succès');
      }
    } catch (error) {
      console.error('Erreur annulation:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="profile-page auth-container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <h1>Bienvenue</h1>
            <p>Connectez-vous pour accéder à votre compte</p>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Connexion
            </button>
            <button
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Inscription
            </button>
          </div>

          {activeTab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn">
                Se connecter
              </button>

              <div className="auth-divider">
                <span>Ou continuer avec</span>
              </div>

              <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                Google
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label>Nom complet</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Téléphone</label>
                <div className="input-wrapper">
                  <Phone size={18} />
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="06..."
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn">
                S'inscrire
              </button>

              <div className="auth-divider">
                <span>Ou continuer avec</span>
              </div>

              <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                Google
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Mon Compte</h1>
        <p>Gérez vos informations et vos commandes</p>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="user-info-card">
            <div className="user-avatar">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} />
              ) : (
                <User size={32} />
              )}
            </div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>

          <nav className="profile-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              Mon Profil
            </button>
            <button
              className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={20} />
              Mes Adresses
            </button>
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={20} />
              Mes Commandes
            </button>
            <button className="nav-item logout" onClick={handleLogout}>
              <LogOut size={20} />
              Déconnexion
            </button>
          </nav>
        </div>

        <div className="profile-main">
          {activeTab === 'profile' && (
            <div className="tab-content fade-in">
              <h2>Informations Personnelles</h2>
              <form className="profile-form" onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Nom complet</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-disabled"
                    />
                  </div>

                </div>

                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </form>

              <hr className="profile-divider" />

              <h2>Modifier le mot de passe</h2>
              <form className="profile-form" onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Mot de passe actuel</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Nouveau mot de passe</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirmer le nouveau mot de passe</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="save-btn" disabled={passwordLoading}>
                  {passwordLoading ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="tab-content fade-in">
              <h2>Mes Adresses de Livraison</h2>

              <div className="addresses-list">
                {user?.addresses?.map((addr) => (
                  <div key={addr._id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                    <div className="address-info">
                      <div className="address-main">
                        <h4>
                          {addr.firstName} {addr.lastName}
                          {addr.isDefault && <span className="badge">Par défaut</span>}
                        </h4>
                        <p className="address-street">{addr.street}</p>
                        <p className="address-city">{addr.postalCode} {addr.city}</p>
                        {addr.phone && <p className="address-phone">📞 {addr.phone}</p>}
                      </div>
                    </div>
                    <div className="address-actions">
                      <button onClick={() => openEditAddress(addr)} className="modify-btn">
                        Modifier
                      </button>
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefaultAddress(addr._id)} className="default-btn">
                          Définir par défaut
                        </button>
                      )}
                      <button onClick={() => handleRemoveAddress(addr._id)} className="delete-btn">
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showAddAddressForm && (
                <div className="address-modal-overlay">
                  <form className="address-form fade-in" onSubmit={handleAddressSubmit}>
                    <h3>{editingAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</h3>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Prénom</label>
                        <input
                          type="text"
                          value={addressForm.firstName}
                          onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                          placeholder="Prénom"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Nom</label>
                        <input
                          type="text"
                          value={addressForm.lastName}
                          onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                          placeholder="Nom"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Téléphone</label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="06 XX XX XX XX"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Adresse</label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        placeholder="Rue, numéro, quartier..."
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Ville</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label>Code Postal</label>
                        <input
                          type="text"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                          placeholder="20000"
                        />
                      </div>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        />
                        Définir comme adresse par défaut
                      </label>
                    </div>

                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => setShowAddAddressForm(false)}>
                        Annuler
                      </button>
                      <button type="submit" className="save-btn">
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {(!user?.addresses || user.addresses.length === 0) && !showAddAddressForm && (
                <p className="no-data">Aucune adresse enregistrée.</p>
              )}

              {!showAddAddressForm && (
                <button className="add-address-btn" onClick={openAddAddress}>
                  + Ajouter une nouvelle adresse
                </button>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="tab-content fade-in">
              <h2>Historique des commandes</h2>
              {orders.length === 0 ? (
                <div className="empty-orders">
                  <Package size={48} />
                  <p>Aucune commande pour le moment</p>
                  <button onClick={() => setCurrentPage('menu')} className="order-now-btn">
                    Commander maintenant
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <span className="order-id">#{order.orderNumber}</span>
                        <span className={`order-status ${order.status}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{item.price} DH</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-footer">
                        <div className="order-date">
                          <History size={16} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="order-total">
                          Total: <span>{order.total} DH</span>
                        </div>
                      </div>
                      {(order.status === 'new' || order.status === 'accepted') && (
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Annuler la commande
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button
                          className="review-btn"
                          onClick={() => openReviewModal(order)}
                        >
                          <Star size={15} />
                          {Object.keys(reviewedOrders[order._id] || {}).length > 0
                            ? 'Modifier mon avis'
                            : 'Laisser un avis'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'avis */}
      {reviewModal && (
        <div className="review-modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="review-modal" onClick={e => e.stopPropagation()}>
            <div className="review-modal-header">
              <h2>⭐ Laisser un avis</h2>
              <button className="review-modal-close" onClick={() => setReviewModal(null)}>×</button>
            </div>
            <p className="review-modal-subtitle">Notez les plats de votre commande</p>
            <div className="review-items-list">
              {reviewModal.items.filter(item => item.menuItem).map((item) => {
                const alreadyDone = reviewedOrders[reviewModal.orderId]?.[item.menuItem];
                const currentRating = reviewRatings[item.menuItem]?.rating || 0;
                const currentComment = reviewRatings[item.menuItem]?.comment || '';
                return (
                  <div key={item.menuItem} className={`review-item ${alreadyDone ? 'already-reviewed' : ''}`}>
                    <div className="review-item-name">
                      <span>{item.name}</span>
                      {alreadyDone && <span className="reviewed-badge">✓ Noté</span>}
                    </div>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          disabled={!!alreadyDone}
                          className={`star-btn ${
                            star <= (hoveredStar[item.menuItem] || currentRating) ? 'active' : ''
                          }`}
                          onMouseEnter={() => !alreadyDone && setHoveredStar(prev => ({ ...prev, [item.menuItem]: star }))}
                          onMouseLeave={() => setHoveredStar(prev => ({ ...prev, [item.menuItem]: 0 }))}
                          onClick={() => !alreadyDone && setReviewRatings(prev => ({
                            ...prev,
                            [item.menuItem]: { ...prev[item.menuItem], rating: star }
                          }))}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {!alreadyDone && (
                      <textarea
                        className="review-comment"
                        placeholder="Commentaire (optionnel)..."
                        value={currentComment}
                        maxLength={500}
                        onChange={e => setReviewRatings(prev => ({
                          ...prev,
                          [item.menuItem]: { ...prev[item.menuItem], comment: e.target.value }
                        }))}
                      />
                    )}
                    {alreadyDone && alreadyDone.comment && (
                      <p className="existing-comment">"{alreadyDone.comment}"</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="review-modal-footer">
              <button className="review-cancel-btn" onClick={() => setReviewModal(null)}>Annuler</button>
              <button
                className="review-submit-btn"
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? 'Envoi...' : 'Soumettre les avis'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusLabel = (status) => {
  const labels = {
    new: 'Nouvelle',
    accepted: 'Acceptée',
    preparing: 'En préparation',
    ready: 'Prête',
    inProgress: 'En cours de livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };
  return labels[status] || status;
};

export default ProfilePage;