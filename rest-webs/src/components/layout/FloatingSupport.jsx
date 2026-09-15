// src/components/layout/FloatingSupport.jsx

import React, { useState } from 'react';
import { supportAPI } from '../../services/api';
import { notify } from '../../utils/notifications';
import './FloatingSupport.css';

const FloatingSupport = ({ isOpen, onClose }) => {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bug_technique');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setDescription('');
    setType('bug_technique');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      notify.error('Veuillez décrire le problème rencontré');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        description: description.trim(),
        source: 'admin_dashboard',
        type: type,
        pageUrl: window.location.pathname + window.location.search,
        userAgent: navigator.userAgent,
      };

      const response = await supportAPI.reportBug(payload);
      if (response.success) {
        notify.success('Bug signalé avec succès ! Notre équipe technique a été notifiée.');
        handleClose();
      }
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      notify.error('Impossible d\'envoyer le rapport. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="support-modal-overlay" onClick={handleClose}>
      <div className="support-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="support-modal-header">
          <h2>Signaler un problème ou un bug technique</h2>
          <button className="support-modal-close" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="support-modal-body">
            <p className="support-modal-description">
              Décrivez le problème le plus précisément possible. Nos développeurs recevront instantanément votre rapport ainsi que les informations de la page actuelle.
            </p>
            
            <div className="support-form-group" style={{ marginBottom: '1.25rem' }}>
              <label>Type de problème *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="support-select"
                disabled={submitting}
              >
                <option value="bug_technique">Bug technique</option>
                <option value="affichage">Problème d'affichage</option>
                <option value="performance">Lenteur ou performance</option>
                <option value="suggestion">Suggestion d'amélioration</option>
                <option value="autre">Autre problème</option>
              </select>
            </div>

            <div className="support-form-group">
              <label>Description du problème *</label>
              <textarea
                required
                placeholder="Que s'est-il passé ? Décrivez les étapes pour reproduire le bug..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="support-textarea"
                disabled={submitting}
              />
            </div>
          </div>
          
          <div className="support-modal-footer">
            <button 
              type="button" 
              className="support-btn-secondary" 
              onClick={handleClose}
              disabled={submitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="support-btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Envoi...' : 'Envoyer le rapport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloatingSupport;
