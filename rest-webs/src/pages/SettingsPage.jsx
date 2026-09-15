// src/pages/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { Save, Bell, Lock, Globe, Eye, EyeOff, Clock, AlertOctagon } from 'lucide-react';
import { settingsAPI, authAPI } from '../services/api';
import { notify } from '../utils/notifications';
import './SettingsPage.css';

const SettingsPage = ({ t, user }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [settings, setSettings] = useState({
    restaurantName: 'La Canyada',
    phone: '',
    email: '',
    address: '',
    
    // Paramètres de livraison
    minimumOrder: 50,
    deliveryFee: 15,
    deliveryTime: 30,
    freeDeliveryThreshold: 100,
    
    // Paiement par carte (uniquement ce toggle est utile)
    enableCardPayment: true,
    // Paiement à la livraison toujours activé
    enableCashPayment: true,
    
    // Paramètres de notifications
    emailNotifications: true,

    // Contrôle opérationnel des commandes (Panic Mode & Horaires)
    isAcceptingOrders: true,
    pauseReason: '',
    openingHours: {
      open: '11:00',
      close: '23:30',
      isOpen24h: false,
    },
    
    // Devise fixe — DH (Dirham marocain)
    currency: 'DH',
    // Fuseau horaire fixe — Casablanca, Maroc
    timezone: 'Africa/Casablanca',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsAPI.get();
      if (response.success && response.settings) {
        setSettings(prev => ({ ...prev, ...response.settings }));
      }
    } catch (error) {
      console.error('Erreur chargement settings:', error);
      // Utiliser les valeurs par défaut
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpeningHoursChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...(prev.openingHours || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const loadingToast = notify.loading('Enregistrement des paramètres...');
    
    try {
      const response = await settingsAPI.update(settings);
      if (response.success) {
        notify.dismiss(loadingToast);
        notify.success('Paramètres enregistrés avec succès!');
      } else {
        throw new Error(response.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur sauvegarde settings:', error);
      notify.dismiss(loadingToast);
      notify.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      notify.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Vérifier que le token existe
    const token = localStorage.getItem('adminToken');
    if (!token) {
      notify.error('Vous devez être connecté pour changer le mot de passe');
      return;
    }

    const loadingToast = notify.loading('Changement du mot de passe...');
    
    try {
      console.log('🔐 Tentative changement mot de passe...');
      console.log('🔑 Token présent:', !!token);
      
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      console.log('✅ Réponse changePassword:', response);

      if (response.success) {
        notify.dismiss(loadingToast);
        notify.success('Mot de passe changé avec succès!');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        throw new Error(response.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('❌ Erreur changement password:', error);
      console.error('❌ Détails:', error.response?.data);
      notify.dismiss(loadingToast);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erreur lors du changement de mot de passe';
      
      if (error.response?.status === 401) {
        notify.error('Token invalide ou expiré. Veuillez vous reconnecter.');
      } else {
        notify.error(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1>{t.settings}</h1>
        <div className="loading">Chargement des paramètres...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="settings-header">
        <h1>{t.settings}</h1>
        <button 
          className="save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={18} />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <div className="settings-grid">
        {/* Profil du restaurant */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Globe size={20} />
            <h3>Profil du restaurant</h3>
          </div>
          <div className="settings-card-body">
            <div className="setting-item">
              <label>Nom du restaurant</label>
              <input
                type="text"
                value={settings.restaurantName || 'La Canyada'}
                disabled
                className="disabled-input"
              />
            </div>
            <div className="setting-item">
              <label>Téléphone du restaurant</label>
              <input
                type="tel"
                value={settings.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+212 6XX XXX XXX"
              />
            </div>
            <div className="setting-item">
              <label>E-mail de contact</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@restaurant.com"
              />
            </div>
            <div className="setting-item">
              <label>Adresse physique</label>
              <textarea
                value={settings.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Ex: 123 Boulevard d'Anfa, Casablanca"
              />
            </div>
          </div>
        </div>



        {/* Paiements & Notifications */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Bell size={20} />
            <h3>Paiements & Notifications</h3>
          </div>
          <div className="settings-card-body">
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Modes de paiement</h4>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Le paiement à la livraison (espèces) est toujours disponible.</p>
            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableCardPayment}
                  onChange={(e) => handleChange('enableCardPayment', e.target.checked)}
                />
                <span>Activer le paiement en ligne par carte</span>
              </label>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
            
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Notifications clients</h4>
            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                />
                <span>Notifications e-mail (en cours de livraison)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Horaires & Contrôle des commandes (Panic Mode) */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Clock size={20} />
            <h3>Horaires & Prise de commandes (Panic Mode)</h3>
          </div>
          <div className="settings-card-body">
            {/* Panic Mode Switch */}
            <div className="setting-item" style={{ background: settings.isAcceptingOrders === false ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', padding: '12px', borderRadius: '10px', border: `1px solid ${settings.isAcceptingOrders === false ? '#ef4444' : '#10b981'}` }}>
              <label className="checkbox-label" style={{ fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={settings.isAcceptingOrders !== false}
                  onChange={(e) => handleChange('isAcceptingOrders', e.target.checked)}
                />
                <span>
                  {settings.isAcceptingOrders !== false ? '🟢 Prise de commandes ACTIVE' : '🔴 Mode Pause ACTIF (Commandes bloquées)'}
                </span>
              </label>
              <p style={{ margin: '6px 0 0 28px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Désactivez cette option pour stopper immédiatement la prise de commandes si la cuisine est débordée.
              </p>
            </div>

            {settings.isAcceptingOrders === false && (
              <div className="setting-item" style={{ marginTop: '10px' }}>
                <label>Motif affiché aux clients</label>
                <input
                  type="text"
                  value={settings.pauseReason || ''}
                  onChange={(e) => handleChange('pauseReason', e.target.value)}
                  placeholder="Ex: Cuisine saturée, Rupture de stock..."
                />
              </div>
            )}

            <h4 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Horaires habituels ({settings.timezone || 'Africa/Casablanca'})</h4>
            
            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.openingHours?.isOpen24h || false}
                  onChange={(e) => handleOpeningHoursChange('isOpen24h', e.target.checked)}
                />
                <span>Ouvert 24h / 24</span>
              </label>
            </div>

            {!settings.openingHours?.isOpen24h && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="setting-item">
                  <label>Heure d'ouverture</label>
                  <input
                    type="time"
                    value={settings.openingHours?.open || '11:00'}
                    onChange={(e) => handleOpeningHoursChange('open', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>Heure de fermeture</label>
                  <input
                    type="time"
                    value={settings.openingHours?.close || '23:30'}
                    onChange={(e) => handleOpeningHoursChange('close', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compte utilisateur */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Lock size={20} />
            <h3>Compte utilisateur</h3>
          </div>
          <div className="settings-card-body">
            <div className="setting-item">
              <label>Nom</label>
              <input
                type="text"
                value={user?.name || 'Non disponible'}
                disabled
                className="disabled-input"
              />
            </div>
            <div className="setting-item">
              <label>Email</label>
              <input
                type="email"
                value={user?.email || 'Non disponible'}
                disabled
                className="disabled-input"
              />
            </div>
            <div className="setting-item">
              <label>Rôle</label>
              <input
                type="text"
                value={user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                disabled
                className="disabled-input"
              />
            </div>
            <button 
              className="change-password-btn"
              onClick={() => setShowPasswordModal(true)}
              style={{ marginTop: '1.25rem' }}
            >
              <Lock size={16} />
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>

      {/* Modal changement de mot de passe */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Changer le mot de passe</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="setting-item">
                <label>
                  <Lock size={16} />
                  Mot de passe actuel
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Entrez votre mot de passe actuel"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="setting-item">
                <label>
                  <Lock size={16} />
                  Nouveau mot de passe
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Au moins 6 caractères"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="setting-item">
                <label>
                  <Lock size={16} />
                  Confirmer le nouveau mot de passe
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Confirmez le nouveau mot de passe"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  Changer le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
