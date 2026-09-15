// src/pages/MapPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Map, MapPin, Users, Settings, RefreshCw, Maximize2 } from 'lucide-react';
import LeafletMapComponent from '../components/LeafletMapComponent';
import socketService from '../services/socket';
import './MapPage.css';

// Restaurant location (Casablanca par défaut)
const restaurantLocation = { lat: 33.5731, lng: -7.5898 };

const MapPage = ({ deliverers, t }) => {
  const [mapDeliverers, setMapDeliverers] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [showZones, setShowZones] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const mapRef = useRef(null);

  useEffect(() => {
    // Convertir les données des livreurs pour la carte
    const formattedDeliverers = deliverers.map(deliverer => ({
      id: deliverer._id || deliverer.id,
      name: deliverer.name || deliverer.user?.name || 'Livreur',
      phone: deliverer.phone || deliverer.user?.phone,
      status: deliverer.status || 'available',
      location: deliverer.location || deliverer.currentLocation || null,
      ordersCount: deliverer.activeOrders?.length || 0,
    })).filter(d => d.status !== 'offline');

    setMapDeliverers(formattedDeliverers);
    setLastUpdate(new Date());
  }, [deliverers]);

  // Connecter Socket.io et écouter les mises à jour de position en temps réel
  useEffect(() => {
    // S'assurer que Socket.io est connecté
    if (!socketService.socket?.connected) {
      socketService.connect();
    }

    if (!autoRefresh) return;

    const handleLocationUpdate = (data) => {
      console.log('📍 Mise à jour position livreur:', data);

      setMapDeliverers(prev => {
        const idMatches = (d) =>
          d.id === data.delivererId ||
          d.id === data.userId ||
          d._id === data.delivererId ||
          d._id === data.userId ||
          (d.user && (d.user === data.delivererId || d.user === data.userId || d.user._id === data.delivererId || d.user._id === data.userId));

        const existingIndex = prev.findIndex(idMatches);

        if (existingIndex >= 0) {
          // Mettre à jour la position du livreur existant
          return prev.map((d, index) =>
            index === existingIndex
              ? {
                ...d,
                location: data.position || data.location,
                ...(data.status ? { status: data.status } : {}),
                ...(data.phone ? { phone: data.phone } : {}),
                ...(data.name ? { name: data.name } : {}),
              }
              : d
          );
        } else if (data.status !== 'offline') {
          // Ajouter un nouveau livreur s'il n'existe pas et n'est pas offline
          return [
            ...prev,
            {
              id: data.delivererId,
              _id: data.delivererId,
              name: data.name || 'Livreur',
              phone: data.phone,
              status: data.status || 'available',
              location: data.position || data.location,
              ordersCount: data.ordersCount || 0,
            }
          ];
        }
        return prev;
      });

      setLastUpdate(new Date());
    };

    const handleStatusUpdate = (data) => {
      console.log('👤 Statut livreur mis à jour sur la carte:', data);
      setMapDeliverers(prev => {
        const idMatches = (d) =>
          d.id === data.delivererId ||
          d.id === data.userId ||
          d._id === data.delivererId ||
          d._id === data.userId ||
          (d.user && (d.user === data.delivererId || d.user === data.userId || d.user._id === data.delivererId || d.user._id === data.userId));

        const exists = prev.some(idMatches);
        if (exists) {
          if (data.status === 'offline') {
            return prev.filter(d => !idMatches(d));
          }
          return prev.map(d => idMatches(d) ? { ...d, status: data.status } : d);
        } else if (data.status !== 'offline') {
          return [
            ...prev,
            {
              id: data.delivererId,
              _id: data.delivererId,
              name: data.name || 'Livreur',
              phone: data.phone,
              status: data.status || 'available',
              location: data.position || data.location || null,
              ordersCount: 0,
            }
          ];
        }
        return prev;
      });
    };

    // Écouter les événements de position et de statut
    socketService.on('delivererPositionUpdated', handleLocationUpdate);
    socketService.on('delivererStatusChanged', handleStatusUpdate);

    return () => {
      socketService.off('delivererPositionUpdated', handleLocationUpdate);
      socketService.off('delivererStatusChanged', handleStatusUpdate);
    };
  }, [autoRefresh]);

  // Zones de livraison par défaut (peut être configuré depuis Settings)
  useEffect(() => {
    // Zone principale autour du restaurant (5km)
    setDeliveryZones([
      {
        center: restaurantLocation,
        radius: 5000, // 5km
        name: 'Zone principale',
      },
    ]);
  }, []);

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // Forcer le rechargement des positions
    window.location.reload();
  };

  const handleFitToBounds = () => {
    // Déclencher le fitBounds manuellement
    if (mapRef.current) {
      mapRef.current.fitToDeliverers();
    }
  };

  const activeDeliverers = mapDeliverers.filter(d => d.status === 'available');
  const busyDeliverers = mapDeliverers.filter(d => d.status === 'busy' || d.status === 'delivering');

  return (
    <div className="page">
      <div className="map-page-header">
        <h1>
          <Map size={28} />
          {t.deliveryMap || 'Carte des livreurs'}
        </h1>
        <div className="map-controls">
          <button
            className={`control-btn ${showZones ? 'active' : ''}`}
            onClick={() => setShowZones(!showZones)}
            title="Afficher/Masquer les zones"
          >
            <MapPin size={18} />
            Zones
          </button>
          <button
            className={`control-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Actualisation automatique"
          >
            <RefreshCw size={18} />
            Auto
          </button>
          <button
            className="control-btn refresh-btn"
            onClick={handleRefresh}
            title="Actualiser"
          >
            <RefreshCw size={18} />
          </button>
          <button
            className="control-btn"
            onClick={handleFitToBounds}
            title="Ajuster la vue sur tous les livreurs"
          >
            <Maximize2 size={18} />
            Vue
          </button>
        </div>
      </div>

      <div className="map-stats">
        <div className="stat-item">
          <Users size={20} />
          <div>
            <span className="stat-value">{mapDeliverers.length}</span>
            <span className="stat-label">Livreurs actifs</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-indicator available"></div>
          <div>
            <span className="stat-value">{activeDeliverers.length}</span>
            <span className="stat-label">Disponibles</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-indicator busy"></div>
          <div>
            <span className="stat-value">{busyDeliverers.length}</span>
            <span className="stat-label">Occupés</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-label">Dernière mise à jour:</span>
          <span className="stat-time">
            {lastUpdate.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      </div>

      <div className="map-container">
        <div className="map-wrapper">
          <LeafletMapComponent
            ref={mapRef}
            deliverers={mapDeliverers}
            restaurantLocation={restaurantLocation}
            deliveryZones={showZones ? deliveryZones : []}
            autoFit={false}
          />
        </div>

        <div className="deliverers-sidebar">
          <div className="deliverers-sidebar-header">
            <h3>
              <Users size={20} />
              {t.activeDeliverers || 'Livreurs actifs'}
            </h3>
            <span className="deliverers-count">{mapDeliverers.length}</span>
          </div>

          {mapDeliverers.length === 0 ? (
            <div className="no-deliverers">
              <MapPin size={48} color="#9ca3af" />
              <p>Aucun livreur actif sur la carte</p>
            </div>
          ) : (
            <div className="deliverers-list">
              {mapDeliverers.map(deliverer => (
                <div
                  key={deliverer.id}
                  className={`deliverer-item ${deliverer.status === 'available' ? 'available' : 'busy'}`}
                >
                  <div className="deliverer-header">
                    <div className="deliverer-info">
                      <span className={`deliverer-status ${deliverer.status === 'available' ? 'available' : 'busy'}`}></span>
                      <strong>{deliverer.name}</strong>
                    </div>
                    <span className="deliverer-orders">
                      {deliverer.ordersCount} {deliverer.ordersCount > 1 ? 'commandes' : 'commande'}
                    </span>
                  </div>
                  {deliverer.phone && (
                    <div className="deliverer-phone">
                      📞 {deliverer.phone}
                    </div>
                  )}
                  {deliverer.location && deliverer.location.lat !== 0 && deliverer.location.lng !== 0 ? (
                    <div className="deliverer-location">
                      📍 {deliverer.location.lat.toFixed(4)}, {deliverer.location.lng.toFixed(4)}
                    </div>
                  ) : (
                    <div className="deliverer-location" style={{ fontStyle: 'italic', color: '#9ca3af' }}>
                      📍 Position non disponible
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
