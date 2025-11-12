// src/pages/SettingsPage.jsx

import React from 'react';
import './SettingsPage.css';

const SettingsPage = ({ t }) => {
  return (
    <div className="page">
      <h1>{t.settings}</h1>
      <div className="settings-sections">
        <div className="settings-card">
          <h3>⚙️ {t.generalSettings}</h3>
          <div className="setting-item">
            <label>{t.restaurantName}</label>
            <input type="text" defaultValue="Mon Restaurant" />
          </div>
          <div className="setting-item">
            <label>{t.phone}</label>
            <input type="text" defaultValue="+212 6XX XXX XXX" />
          </div>
        </div>
        <div className="settings-card">
          <h3>💳 {t.paymentSettings}</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked /> {t.enableCard}
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked /> {t.enableCash}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;