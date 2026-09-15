// src/components/LeafletMapComponent.jsx

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Composant pour ajuster la vue de la carte (une seule fois au chargement)
function MapBounds({ deliverers, restaurantLocation, autoFit }) {
  const map = useMap();
  const hasInitialized = React.useRef(false);

  useEffect(() => {
    // Ajuster seulement une fois au chargement initial si autoFit est activé
    if (!autoFit || hasInitialized.current) return;

    if (deliverers.length === 0) {
      map.setView([restaurantLocation.lat, restaurantLocation.lng], 12);
      hasInitialized.current = true;
      return;
    }

    const bounds = L.latLngBounds([
      [restaurantLocation.lat, restaurantLocation.lng],
    ]);

    deliverers.forEach(deliverer => {
      if (deliverer.location && deliverer.location.lat && deliverer.location.lng) {
        bounds.extend([deliverer.location.lat, deliverer.location.lng]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      hasInitialized.current = true;
    }
  }, [map, deliverers, restaurantLocation, autoFit]);

  return null;
}


// Icône personnalisée pour le restaurant
const restaurantIcon = L.divIcon({
  className: 'custom-restaurant-icon',
  html: '<div style="background: #f59e0b; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">🍽️</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Icône personnalisée pour les livreurs disponibles
const createDelivererIcon = (status) => {
  const color = status === 'available' ? '#10b981' : '#f59e0b';
  return L.divIcon({
    className: 'custom-deliverer-icon',
    html: `<div style="background: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🚴</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const LeafletMapComponent = React.forwardRef(({ 
  deliverers = [], 
  restaurantLocation = { lat: 33.5731, lng: -7.5898 }, 
  deliveryZones = [],
  autoFit = false
}, ref) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Exposer la méthode fitToDeliverers via ref
  React.useImperativeHandle(ref, () => ({
    fitToDeliverers: () => {
      if (mapInstanceRef.current) {
        const map = mapInstanceRef.current;
        const bounds = L.latLngBounds([
          [restaurantLocation.lat, restaurantLocation.lng],
        ]);

        deliverers.forEach(deliverer => {
          if (deliverer.location && deliverer.location.lat && deliverer.location.lng) {
            bounds.extend([deliverer.location.lat, deliverer.location.lng]);
          }
        });

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    }
  }));

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer
        ref={mapRef}
        center={[restaurantLocation.lat, restaurantLocation.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        zoomControl={true}
        attributionControl={true}
        whenReady={(map) => {
          // Sauvegarder l'instance de la carte
          mapInstanceRef.current = map.target;
          // Permettre le contrôle fluide de la carte
          map.target.dragging.enable();
          map.target.touchZoom.enable();
          map.target.doubleClickZoom.enable();
          map.target.scrollWheelZoom.enable();
        }}
      >
        {/* Carte OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ajuster la vue pour inclure tous les marqueurs (seulement si autoFit est activé) */}
        <MapBounds 
          deliverers={deliverers} 
          restaurantLocation={restaurantLocation}
          autoFit={autoFit}
        />

        {/* Marqueur du restaurant */}
        <Marker
          position={[restaurantLocation.lat, restaurantLocation.lng]}
          icon={restaurantIcon}
        >
          <Popup>
            <div style={{ padding: '4px', minWidth: '150px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
                🍽️ Restaurant
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                Point de départ
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Marqueurs des livreurs */}
        {deliverers.map((deliverer) => {
          const hasValidCoords = deliverer.location && 
            deliverer.location.lat !== null && deliverer.location.lat !== undefined && deliverer.location.lat !== 0 &&
            deliverer.location.lng !== null && deliverer.location.lng !== undefined && deliverer.location.lng !== 0;

          let position;
          if (hasValidCoords) {
            position = [deliverer.location.lat, deliverer.location.lng];
          } else {
            // Utiliser la position du restaurant avec un petit décalage stable basé sur l'id
            const hash = deliverer.id ? deliverer.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
            const latOffset = ((hash % 7) - 3) * 0.0006; // environ 50m max
            const lngOffset = (((hash >> 2) % 7) - 3) * 0.0006;
            position = [restaurantLocation.lat + latOffset, restaurantLocation.lng + lngOffset];
          }

          return (
            <Marker
              key={deliverer.id}
              position={position}
              icon={createDelivererIcon(deliverer.status)}
            >
              <Popup>
                <div style={{ padding: '8px', minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
                    🚴 {deliverer.name || 'Livreur'}
                  </h3>
                  <div style={{ marginBottom: '4px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: deliverer.status === 'available' ? '#10b981' : '#f59e0b',
                        marginRight: '6px',
                      }}
                    ></span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {deliverer.status === 'available' ? 'Disponible' : 'Occupé'}
                    </span>
                  </div>
                  {deliverer.phone && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                      📞 {deliverer.phone}
                    </p>
                  )}
                  {!hasValidCoords && (
                    <p style={{ margin: '4px 0', fontSize: '11px', color: '#ef4444', fontStyle: 'italic', fontWeight: '500' }}>
                      📍 Position non disponible (Près du restaurant)
                    </p>
                  )}
                  {deliverer.ordersCount !== undefined && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                      📦 {deliverer.ordersCount} commande{deliverer.ordersCount > 1 ? 's' : ''}
                    </p>
                  )}
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
                    Mis à jour: {new Date().toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Zones de livraison */}
        {deliveryZones.map((zone, index) => (
          <Circle
            key={index}
            center={[zone.center?.lat || restaurantLocation.lat, zone.center?.lng || restaurantLocation.lng]}
            radius={zone.radius || 5000}
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#f59e0b',
              fillOpacity: 0.15,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ padding: '4px' }}>
                <strong>{zone.name || 'Zone de livraison'}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                  Rayon: {(zone.radius || 5000) / 1000} km
                </p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
});

LeafletMapComponent.displayName = 'LeafletMapComponent';

export default LeafletMapComponent;

