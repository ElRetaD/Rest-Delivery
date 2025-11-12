// src/pages/MapPage.jsx

import React from 'react';
import { Map } from 'lucide-react';
import './MapPage.css';

const MapPage = ({ deliverers, t }) => {
  return (
    <div className="page">
      <h1>{t.deliveryMap}</h1>
      <div className="map-container">
        <div className="map-placeholder">
          <Map size={48} />
          <p>Google Maps API</p>
          <p className="map-note">{t.mapNote}</p>
        </div>
        <div className="deliverers-list">
          <h3>{t.activeDeliverers}</h3>
          {deliverers.map(d => (
            <div key={d.id} className="deliverer-item">
              <div className="deliverer-info">
                <span className={`deliverer-status ${d.status === 'available' ? 'available' : 'busy'}`}></span>
                <strong>{d.name}</strong>
              </div>
              <span className="deliverer-orders">
                {d.orders} {d.orders > 1 ? t.orders_plural : t.order}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPage;