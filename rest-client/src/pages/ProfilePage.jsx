// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Lock, Package, History } from 'lucide-react';
import { authAPI, ordersAPI } from '../services/api';
import './ProfilePage.css';

const ProfilePage = ({ setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('clientToken');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        if (response.success) {
          setUser(response.user);
          setIsLoggedIn(true);
          loadOrders();
        }
      } catch (error) {
        console.error('Erreur auth:', error);
        localStorage.removeItem('clientToken');
      }
    }
    setLoading(false);
  };

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      if (response.success) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.login(loginForm.email, loginForm.password);
      if (response.success) {
        setUser(response.user);
        setIsLoggedIn(true);
        loadOrders();
      }
    } catch (error) {
      alert('Email ou mot de passe incorrect');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.register({
        ...registerForm,
        role: 'client',
      });
      if (response.success) {
        setUser(response.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      alert('Erreur lors de l\'inscription');
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setIsLoggedIn(false);
    setOrders([]);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // Login/Register Form
  if (!isLoggedIn) {
    return (
      <div className="profile-page">
        <div className="auth-container">
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
            <form onSubmit={handleLogin} className="auth-form">
              <h2>Connexion</h2>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                Se connecter
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <h2>Inscription</h2>
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  placeholder="+212 6XX XXX XXX"
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                S'inscrire
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Profile Page (Logged In)
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            Profil
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={20} />
            Mes commandes
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="profile-content">
            <div className="info-card">
              <h3><User size={20} /> Informations personnelles</h3>
              <div className="info-item">
                <Mail size={18} />
                <div>
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="info-item">
                <Phone size={18} />
                <div>
                  <label>Téléphone</label>
                  <p>{user.phone || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="info-item">
                <MapPin size={18} />
                <div>
                  <label>Adresse</label>
                  <p>{user.address?.street || 'Non renseignée'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-content">
            <h3><History size={20} /> Historique des commandes</h3>
            {orders.length === 0 ? (
              <div className="no-orders">
                <Package size={48} />
                <p>Aucune commande pour le moment</p>
                <button onClick={() => setCurrentPage('menu')}>
                  Commander maintenant
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order._id} className="order-item">
                    <div className="order-header">
                      <span className="order-number">#{order.orderNumber}</span>
                      <span className={`order-status ${order.status}`}>
                        {order.status === 'delivered' ? 'Livrée' : 
                         order.status === 'inProgress' ? 'En cours' : 
                         order.status === 'new' ? 'Nouvelle' : order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="order-items">
                        {order.items.map(item => `${item.name} × ${item.quantity}`).join(', ')}
                      </p>
                      <p className="order-total">{order.total} DH</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;