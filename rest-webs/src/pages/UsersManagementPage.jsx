// src/pages/UsersManagementPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Trash2, 
  Eye,
  Edit2,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Coins,
  Calendar,
  Ban,
  CheckCircle
} from 'lucide-react';
import { usersAPI } from '../services/api';
import { notify } from '../utils/notifications';
import './UsersManagementPage.css';

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all, client, deliverer
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, blocked
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'deliverer',
    vehicleType: 'scooter',
    vehicleNumber: ''
  });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'deliverer',
    vehicleType: 'scooter',
    vehicleNumber: ''
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active';
      if (searchTerm) params.search = searchTerm;

      const response = await usersAPI.getAll(params);
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Erreur chargement users:', error);
      notify.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        phone: newUser.phone,
        role: newUser.role,
      };

      if (newUser.role === 'deliverer') {
        payload.vehicleType = newUser.vehicleType;
        payload.vehicleNumber = newUser.vehicleNumber;
      }

      const response = await usersAPI.create(payload);
      if (response.success) {
        notify.success(response.message || 'Utilisateur créé avec succès');
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: 'deliverer',
          vehicleType: 'scooter',
          vehicleNumber: ''
        });
        loadUsers();
      }
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      notify.error(error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleOpenEditModal = async (user) => {
    try {
      const response = await usersAPI.getById(user._id);
      if (response.success) {
        const u = response.user;
        setEditUserData({
          id: u._id,
          name: u.name || '',
          email: u.email || '',
          password: '',
          phone: u.phone || '',
          role: u.role || 'deliverer',
          vehicleType: u.delivererProfile?.vehicleType || 'scooter',
          vehicleNumber: u.delivererProfile?.vehicleNumber || '',
        });
        setShowEditUserModal(true);
      }
    } catch (error) {
      console.error('Erreur chargement détails pour modification:', error);
      notify.error('Erreur lors du chargement des détails de l\'utilisateur');
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editUserData.name,
        email: editUserData.email,
        phone: editUserData.phone,
        role: editUserData.role,
      };

      if (editUserData.password) {
        payload.password = editUserData.password;
      }

      if (editUserData.role === 'deliverer') {
        payload.vehicleType = editUserData.vehicleType;
        payload.vehicleNumber = editUserData.vehicleNumber;
      }

      const response = await usersAPI.update(editUserData.id, payload);
      if (response.success) {
        notify.success(response.message || 'Utilisateur mis à jour avec succès');
        setShowEditUserModal(false);
        loadUsers();
      }
    } catch (error) {
      console.error('Erreur lors de la modification de l\'utilisateur:', error);
      notify.error(error.response?.data?.message || 'Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await usersAPI.updateStatus(userId, newStatus);
      
      if (response.success) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isActive: newStatus } : u
        ));
        notify.success(
          newStatus 
            ? 'Utilisateur activé avec succès' 
            : 'Utilisateur bloqué avec succès'
        );
      }
    } catch (error) {
      console.error('Erreur toggle status:', error);
      notify.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?`)) {
      return;
    }

    try {
      const response = await usersAPI.delete(userId);
      if (response.success) {
        setUsers(users.filter(u => u._id !== userId));
        notify.success('Utilisateur supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      notify.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const response = await usersAPI.getById(userId);
      if (response.success) {
        setSelectedUser(response.user);
        setShowUserDetails(true);
      }
    } catch (error) {
      console.error('Erreur chargement détails:', error);
      notify.error('Erreur lors du chargement des détails');
    }
  };

  const filteredUsers = users.filter(user => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    total: users.length,
    clients: users.filter(u => u.role === 'client').length,
    deliverers: users.filter(u => u.role === 'deliverer').length,
    active: users.filter(u => u.isActive).length,
    blocked: users.filter(u => !u.isActive).length,
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'client': return 'Client';
      case 'deliverer': return 'Livreur';
      case 'admin': return 'Administrateur';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'client': return '#3b82f6';
      case 'deliverer': return '#10b981';
      case 'admin': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="page">
        <h1>Gestion des Utilisateurs</h1>
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="users-page-header">
        <h1>
          <Users size={28} />
          Gestion des Utilisateurs
        </h1>
        <button 
          className="add-user-btn"
          onClick={() => setShowAddUserModal(true)}
        >
          + Ajouter un utilisateur
        </button>
      </div>

      {/* Statistiques */}
      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e5e7eb' }}>
            <Users size={24} color="#374151" />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <UserCheck size={24} color="#3b82f6" />
          </div>
          <div className="stat-content">
            <h3>{stats.clients}</h3>
            <p>Clients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <ShoppingBag size={24} color="#10b981" />
          </div>
          <div className="stat-content">
            <h3>{stats.deliverers}</h3>
            <p>Livreurs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Actifs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            <Ban size={24} color="#ef4444" />
          </div>
          <div className="stat-content">
            <h3>{stats.blocked}</h3>
            <p>Bloqués</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="users-filters">
        <div className="search-box">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
          </div>
          <button className="search-btn" onClick={handleSearch}>
            Rechercher
          </button>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Rôle</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les rôles</option>
              <option value="client">Clients</option>
              <option value="deliverer">Livreurs</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="blocked">Bloqués</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      {filteredUsers.length === 0 ? (
        <div className="no-users">
          <Users size={48} color="#9ca3af" />
          <p>Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="users-list">
          {filteredUsers.map(user => (
            <div key={user._id} className="user-card">
              <div className="u-card-header">
                <div className="u-card-avatar" style={{ 
                  background: `linear-gradient(135deg, ${getRoleColor(user.role)} 0%, ${getRoleColor(user.role)}80 100%)` 
                }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="u-card-info">
                  <h3>{user.name || 'Sans nom'}</h3>
                  <div className="u-card-meta">
                    <span 
                      className="role-badge"
                      style={{ 
                        background: `${getRoleColor(user.role)}20`,
                        color: getRoleColor(user.role)
                      }}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                    <span className={`status-badge ${user.isActive ? 'active' : 'blocked'}`}>
                      {user.isActive ? 'Actif' : 'Bloqué'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="u-card-details">
                <div className="detail-item">
                  <Mail size={16} />
                  <span>{user.email || 'N/A'}</span>
                </div>
                {user.phone && (
                  <div className="detail-item">
                    <Phone size={16} />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address?.street && (
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{user.address.street}, {user.address.city}</span>
                  </div>
                )}
              </div>

              {user.stats && (
                <div className="u-card-stats">
                  <div className="stat-item">
                    <ShoppingBag size={16} />
                    <span>
                      {user.stats.ordersCount || 0} {user.role === 'deliverer' ? 'livraisons' : 'commandes'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <Coins size={16} />
                    <span>{user.stats.totalSpent?.toFixed(2) || 0} DH</span>
                  </div>
                </div>
              )}

              <div className="u-card-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() => handleViewDetails(user._id)}
                  title="Voir détails"
                >
                  <Eye size={18} />
                </button>
                {(user.role === 'admin' || user.role === 'deliverer') && (
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleOpenEditModal(user)}
                    title="Modifier"
                    style={{ backgroundColor: '#eab308', color: '#111827' }}
                  >
                    <Edit2 size={18} />
                  </button>
                )}
                <button
                  className={`action-btn ${user.isActive ? 'block-btn' : 'unblock-btn'}`}
                  onClick={() => handleToggleStatus(user._id, user.isActive)}
                  title={user.isActive ? 'Bloquer' : 'Débloquer'}
                >
                  {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                </button>
                {user.role !== 'admin' && (
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Détails Utilisateur */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'utilisateur</h2>
              <button 
                className="modal-close"
                onClick={() => setShowUserDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="user-detail-section">
                <h3>Informations personnelles</h3>
                <div className="detail-grid">
                  <div>
                    <label>Nom</label>
                    <p>{selectedUser.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label>Email</label>
                    <p>{selectedUser.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label>Téléphone</label>
                    <p>{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label>Rôle</label>
                    <p>{getRoleLabel(selectedUser.role)}</p>
                  </div>
                  <div>
                    <label>Statut</label>
                    <p className={selectedUser.isActive ? 'active' : 'blocked'}>
                      {selectedUser.isActive ? 'Actif' : 'Bloqué'}
                    </p>
                  </div>
                  <div>
                    <label>Date d'inscription</label>
                    <p>
                      {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {selectedUser.role === 'deliverer' && selectedUser.delivererProfile && (
                    <>
                      <div>
                        <label>Type de véhicule</label>
                        <p style={{ textTransform: 'capitalize' }}>{selectedUser.delivererProfile.vehicleType || 'N/A'}</p>
                      </div>
                      <div>
                        <label>Numéro de véhicule</label>
                        <p>{selectedUser.delivererProfile.vehicleNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <label>Disponibilité</label>
                        <p className={selectedUser.delivererProfile.isAvailable ? 'active' : 'blocked'}>
                          {selectedUser.delivererProfile.isAvailable ? 'Disponible' : 'Indisponible'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {selectedUser.stats && (
                <div className="user-detail-section">
                  <h3>{selectedUser.role === 'deliverer' ? 'Statistiques de livraison' : 'Statistiques'}</h3>
                  <div className="stats-grid">
                    {selectedUser.role === 'deliverer' ? (
                      <>
                        <div className="stat-box">
                          <ShoppingBag size={24} />
                          <div>
                            <h4>{selectedUser.stats.completedOrders || 0}</h4>
                            <p>Livraisons effectuées</p>
                          </div>
                        </div>
                        <div className="stat-box">
                          <Coins size={24} />
                          <div>
                            <h4>{selectedUser.stats.totalSpent?.toFixed(2) || 0} DH</h4>
                            <p>Volume total livré</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="stat-box">
                          <ShoppingBag size={24} />
                          <div>
                            <h4>{selectedUser.stats.totalOrders || 0}</h4>
                            <p>Commandes totales</p>
                          </div>
                        </div>
                        <div className="stat-box">
                          <CheckCircle size={24} />
                          <div>
                            <h4>{selectedUser.stats.completedOrders || 0}</h4>
                            <p>Commandes complétées</p>
                          </div>
                        </div>
                        <div className="stat-box">
                          <Coins size={24} />
                          <div>
                            <h4>{selectedUser.stats.totalSpent?.toFixed(2) || 0} DH</h4>
                            <p>Total dépensé</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedUser.orders && selectedUser.orders.length > 0 && (
                <div className="user-detail-section">
                  <h3>{selectedUser.role === 'deliverer' ? 'Historique des livraisons' : 'Historique des commandes'}</h3>
                  <div className="orders-history">
                    {selectedUser.orders.map(order => (
                      <div key={order._id} className="history-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <div>
                            <strong>#{order.orderNumber}</strong>
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </div>
                          <div>
                            <span>{order.total} DH</span>
                            <span className="date" style={{ marginLeft: '10px' }}>
                              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        {selectedUser.role === 'deliverer' && order.customer && (
                          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px', borderTop: '1px dashed var(--border-color)', paddingTop: '4px' }}>
                            <strong>Client :</strong> {order.customer.name} ({order.customer.phone || 'N/A'})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowUserDetails(false)}
              >
                Fermer
              </button>
              <button
                className={`btn-primary ${selectedUser.isActive ? 'btn-danger' : 'btn-success'}`}
                onClick={() => {
                  handleToggleStatus(selectedUser._id, selectedUser.isActive);
                  setShowUserDetails(false);
                }}
              >
                {selectedUser.isActive ? 'Bloquer' : 'Débloquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter Utilisateur */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un nouvel utilisateur</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddUserModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nom complet *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ahmed Alaoui"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: ahmed@restaurant.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Mot de passe *</label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 caractères"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Téléphone *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 0612345678"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Rôle *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="form-select"
                    >
                      <option value="deliverer">Livreur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                </div>

                {newUser.role === 'deliverer' && (
                  <div className="vehicle-info-section">
                    <h3>Informations du véhicule</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Type de véhicule *</label>
                        <select
                          value={newUser.vehicleType}
                          onChange={(e) => setNewUser({ ...newUser, vehicleType: e.target.value })}
                          className="form-select"
                        >
                          <option value="scooter">Scooter</option>
                          <option value="bike">Vélo</option>
                          <option value="motorcycle">Moto</option>
                          <option value="car">Voiture</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Numéro de plaque / Immatriculation</label>
                        <input
                          type="text"
                          placeholder="Ex: 12345-A-15"
                          value={newUser.vehicleNumber}
                          onChange={(e) => setNewUser({ ...newUser, vehicleNumber: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-success"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier Utilisateur */}
      {showEditUserModal && (
        <div className="modal-overlay" onClick={() => setShowEditUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier l'utilisateur</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditUserModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nom complet *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ahmed Alaoui"
                      value={editUserData.name}
                      onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: ahmed@restaurant.com"
                      value={editUserData.email}
                      onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Mot de passe</label>
                    <input
                      type="password"
                      placeholder="Laisser vide pour ne pas changer"
                      value={editUserData.password}
                      onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Téléphone *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 0612345678"
                      value={editUserData.phone}
                      onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Rôle *</label>
                    <select
                      value={editUserData.role}
                      onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                      className="form-select"
                    >
                      <option value="deliverer">Livreur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                </div>

                {editUserData.role === 'deliverer' && (
                  <div className="vehicle-info-section">
                    <h3>Informations du véhicule</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Type de véhicule *</label>
                        <select
                          value={editUserData.vehicleType}
                          onChange={(e) => setEditUserData({ ...editUserData, vehicleType: e.target.value })}
                          className="form-select"
                        >
                          <option value="scooter">Scooter</option>
                          <option value="bike">Vélo</option>
                          <option value="motorcycle">Moto</option>
                          <option value="car">Voiture</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Numéro de plaque / Immatriculation</label>
                        <input
                          type="text"
                          placeholder="Ex: 12345-A-15"
                          value={editUserData.vehicleNumber}
                          onChange={(e) => setEditUserData({ ...editUserData, vehicleNumber: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditUserModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-success"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;

