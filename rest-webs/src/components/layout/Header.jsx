// src/components/Layout/Header.jsx

import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, User, Sun, Moon, Settings, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Header.css';

const Header = ({
  sidebarOpen,
  setSidebarOpen,
  theme,
  setTheme,
  orders = [],
  setCurrentPage,
  user,
  onLogout,
  settings = {},
  setSettings,
}) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [pauseReasonInput, setPauseReasonInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isAcceptingOrders = settings?.isAcceptingOrders !== false;

  // Gérer l'activation / désactivation du Panic Mode (Busy Mode)
  const handleToggleOrders = async (accepting, reason = '') => {
    setIsUpdatingStatus(true);
    try {
      const payload = {
        isAcceptingOrders: accepting,
        pauseReason: accepting ? '' : (reason.trim() || 'Cuisine saturée, pause temporaire des commandes'),
      };
      const res = await settingsAPI.update(payload);
      if (res.success && res.settings) {
        if (setSettings) {
          setSettings(prev => ({ ...prev, ...res.settings }));
        }
        if (accepting) {
          toast.success('🟢 Prise de commandes réactivée avec succès !');
        } else {
          toast.error('🔴 Mode Pause activé : Les commandes sont suspendues.');
        }
      }
      setShowPanicModal(false);
    } catch (err) {
      console.error('Erreur toggle orders:', err);
      toast.error('Erreur lors du changement de statut du restaurant');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Calculer le nombre de nouvelles commandes
  useEffect(() => {
    const newOrders = orders.filter(order => 
      order.status === 'new' || order.status === 'accepted'
    ).length;
    setNotificationCount(newOrders);
  }, [orders]);

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showUserMenu]);

  const handleNotificationClick = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const handleUserMenuClick = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowUserMenu(false);
  };

  const newOrders = orders.filter(order => 
    order.status === 'new' || order.status === 'accepted'
  ).slice(0, 5);

  return (
    <header className="header">
      <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className="header-right">
        {/* Bouton d'urgence Panic Mode / Busy Mode */}
        <button 
          className={`panic-mode-btn ${isAcceptingOrders ? 'is-open' : 'is-paused'}`}
          onClick={() => {
            if (isAcceptingOrders) {
              setPauseReasonInput(settings?.pauseReason || 'Cuisine saturée, pause temporaire des commandes');
              setShowPanicModal(true);
            } else {
              handleToggleOrders(true);
            }
          }}
          disabled={isUpdatingStatus}
          title={isAcceptingOrders ? "Commandes ouvertes. Cliquez pour activer le Mode Pause (Busy Mode) si la cuisine est débordée" : "Commandes suspendues. Cliquez pour rouvrir immédiatement"}
        >
          {isAcceptingOrders ? (
            <>
              <span className="status-dot green-dot"></span>
              <span className="btn-text">Commandes : Ouvert</span>
            </>
          ) : (
            <>
              <span className="status-dot red-dot pulsing"></span>
              <span className="btn-text">🔴 Pause Commandes</span>
            </>
          )}
        </button>

        <button 
          className="theme-toggle-btn" 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="notification-container">
          <button 
            className="icon-btn notification-btn" 
            onClick={handleNotificationClick}
            title="Notifications"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="badge">{notificationCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                <span className="notifications-count">{notificationCount} nouvelle{notificationCount > 1 ? 's' : ''}</span>
              </div>
              
              <div className="notifications-list">
                {newOrders.length === 0 ? (
                  <div className="no-notifications">
                    <Bell size={24} />
                    <p>Il n'y a pas de nouvelles commandes</p>
                  </div>
                ) : (
                  newOrders.map(order => (
                    <div 
                      key={order._id} 
                      className="notification-item"
                      onClick={() => {
                        setCurrentPage('orders');
                        setShowNotifications(false);
                      }}
                    >
                      <div className="notification-icon">📦</div>
                      <div className="notification-content">
                        <p className="notification-title">Nouvelle commande #{order.orderNumber}</p>
                        <p className="notification-details">
                          {order.customerName} • {order.total} DH
                        </p>
                        <p className="notification-time">
                          {new Date(order.createdAt).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {newOrders.length > 0 && (
                <div className="notifications-footer">
                  <button 
                    onClick={() => {
                      setCurrentPage('orders');
                      setShowNotifications(false);
                    }}
                  >
                    Voir toutes les commandes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="user-menu-container">
          <button 
            className="icon-btn user-btn" 
            onClick={handleUserMenuClick}
            title="Menu utilisateur"
          >
            <User size={20} />
          </button>

          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-details">
                  <p className="user-name">{user?.name || 'Utilisateur'}</p>
                  <p className="user-email">{user?.email || 'admin@restaurant.com'}</p>
                  <p className="user-role">{user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
                </div>
              </div>
              <div className="user-menu-divider"></div>
              <div className="user-menu-actions">
                <button 
                  className="user-menu-item"
                  onClick={() => {
                    setCurrentPage('settings');
                    setShowUserMenu(false);
                  }}
                >
                  <Settings size={16} />
                  <span>Paramètres</span>
                </button>
                <button 
                  className="user-menu-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Confirmation Panic Mode */}
      {showPanicModal && (
        <div className="modal-overlay" onClick={() => setShowPanicModal(false)}>
          <div className="modal-content panic-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                <AlertTriangle size={22} />
                <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 700 }}>Mode Pause / Cuisine Saturée</h2>
              </div>
              <button className="modal-close" onClick={() => setShowPanicModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                Voulez-vous suspendre temporairement la réception des commandes ? Les clients verront immédiatement que le restaurant est en pause et toute commande en cours sera bloquée.
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Motif affiché aux clients :
                </label>
                <input
                  type="text"
                  value={pauseReasonInput}
                  onChange={(e) => setPauseReasonInput(e.target.value)}
                  placeholder="Ex: Cuisine saturée, Rupture de pain, Pause temporaire..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowPanicModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleOrders(false, pauseReasonInput)}
                  disabled={isUpdatingStatus}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {isUpdatingStatus ? 'Suspension...' : 'Activer la pause'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;