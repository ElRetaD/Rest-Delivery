// src/components/Layout/Header.jsx

import React from 'react';
import { Menu, X, Bell, User, Globe } from 'lucide-react';
import { notify } from '../../utils/notifications';
import './Header.css';

const Header = ({ sidebarOpen, setSidebarOpen, language, setLanguage }) => {
  return (
    <header className="header">
      <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className="header-right">
        <button 
          className="lang-btn" 
          onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
          title={language === 'fr' ? 'العربية' : 'Français'}
        >
          <Globe size={20} />
          <span>{language === 'fr' ? 'FR' : 'AR'}</span>
        </button>
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        <button className="icon-btn">
          <User size={20} />
        </button>
      </div>
    </header>
  );

  <button 
  className="icon-btn"
  onClick={() => notify.success('Test notification!')}
  title="Test notification"
>
  🔔
</button>
};

export default Header;