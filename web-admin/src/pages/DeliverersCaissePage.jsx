// src/pages/DeliverersCaissePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, RefreshCw } from 'lucide-react';
import { deliverersAPI } from '../services/api';
import { notify } from '../utils/notifications';
import './DeliverersCaissePage.css';

const STATUS_LABELS = {
  available: 'En ligne',
  busy: 'Occupé',
  offline: 'Hors ligne',
};

const formatCash = (amount) => `${Number(amount || 0).toFixed(2)} DH`;

const DeliverersCaissePage = () => {
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  const loadDeliverers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await deliverersAPI.getCaisse();
      if (response.success) {
        setDeliverers(response.deliverers || []);
      }
    } catch (error) {
      console.error('Erreur chargement caisse livreurs:', error);
      notify.error('Impossible de charger la caisse des livreurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliverers();
  }, [loadDeliverers]);

  const handleOpenSettleModal = (deliverer) => {
    setConfirmModal(deliverer);
  };

  const handleCloseModal = () => {
    if (!settling) {
      setConfirmModal(null);
    }
  };

  const handleConfirmSettle = async () => {
    if (!confirmModal) return;

    setSettling(true);
    try {
      const response = await deliverersAPI.settleCash(confirmModal._id);
      if (response.success) {
        setDeliverers((prev) =>
          prev.map((d) =>
            d._id === confirmModal._id ? { ...d, cashInHand: 0 } : d
          )
        );
        notify.success(
          `Caisse de ${confirmModal.name} clôturée — ${formatCash(response.settlement?.amount ?? confirmModal.cashInHand)} récupérés`
        );
        setConfirmModal(null);
      }
    } catch (error) {
      console.error('Erreur clôture caisse:', error);
      notify.error(
        error.response?.data?.message || 'Erreur lors de la clôture de caisse'
      );
    } finally {
      setSettling(false);
    }
  };

  const totalCashInHand = deliverers.reduce(
    (sum, d) => sum + (d.cashInHand || 0),
    0
  );
  const totalDeliveriesToday = deliverers.reduce(
    (sum, d) => sum + (d.deliveriesToday || 0),
    0
  );

  return (
    <div className="page deliverers-caisse-page">
      <div className="caisse-page-header">
        <h1>
          <Wallet size={28} />
          Gestion de la Caisse des Livreurs
        </h1>
        <button
          type="button"
          className="btn-refresh-caisse"
          onClick={loadDeliverers}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          Actualiser
        </button>
      </div>

      <div className="caisse-stats">
        <div className="stat-card">
          <div className="stat-content">
            <h3>{deliverers.length}</h3>
            <p>Livreurs actifs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{totalDeliveriesToday}</h3>
            <p>Livraisons aujourd&apos;hui</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-content">
            <h3>{formatCash(totalCashInHand)}</h3>
            <p>Total en poche</p>
          </div>
        </div>
      </div>

      <div className="caisse-table-container">
        {loading ? (
          <div className="caisse-loading">
            <div className="spinner" />
            <p>Chargement des livreurs...</p>
          </div>
        ) : deliverers.length === 0 ? (
          <div className="caisse-empty">
            <p>Aucun livreur actif trouvé.</p>
          </div>
        ) : (
          <table className="caisse-table">
            <thead>
              <tr>
                <th>Nom du Livreur</th>
                <th>Statut</th>
                <th>Livraisons Aujourd&apos;hui</th>
                <th>Argent en Poche</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliverers.map((deliverer) => (
                <tr key={deliverer._id}>
                  <td className="deliverer-name">{deliverer.name}</td>
                  <td>
                    <span className={`status-badge status-${deliverer.status}`}>
                      {STATUS_LABELS[deliverer.status] || deliverer.status}
                    </span>
                  </td>
                  <td>{deliverer.deliveriesToday || 0}</td>
                  <td className="cash-amount">{formatCash(deliverer.cashInHand)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-settle-cash"
                      onClick={() => handleOpenSettleModal(deliverer)}
                      disabled={(deliverer.cashInHand || 0) <= 0}
                    >
                      Clôturer la caisse
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content caisse-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Clôture de caisse</h2>
              <button
                type="button"
                className="modal-close"
                onClick={handleCloseModal}
                disabled={settling}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="caisse-confirm-text">
                Êtes-vous sûr de vouloir clôturer la caisse de{' '}
                <strong>{confirmModal.name}</strong> ? Montant à récupérer :{' '}
                <strong>{formatCash(confirmModal.cashInHand)}</strong>.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCloseModal}
                disabled={settling}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn-primary btn-confirm-settle"
                onClick={handleConfirmSettle}
                disabled={settling}
              >
                {settling ? 'Traitement...' : 'Confirmer le règlement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverersCaissePage;
