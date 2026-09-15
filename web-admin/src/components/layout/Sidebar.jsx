// src/components/Layout/Sidebar.jsx

import React from 'react';
import { Home, ShoppingBag, Map, FileText, Settings, Utensils, Users, Wallet, Coins, HelpCircle } from 'lucide-react';
import './Sidebar.css';
import './FloatingSupport.css';

const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, t, restaurantName, onOpenSupport }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: t.dashboard },
    { id: 'orders', icon: ShoppingBag, label: t.orders },
    { id: 'menu', icon: Utensils, label: 'Menu' },
    { id: 'users', icon: Users, label: 'Utilisateurs' },
    { id: 'map', icon: Map, label: t.map },
    { id: 'deliverers-caisse', icon: Wallet, label: 'Caisse Livreurs' },
    { id: 'expenses', icon: Coins, label: 'Dépenses' },
    { id: 'reports', icon: FileText, label: t.reports },
    { id: 'settings', icon: Settings, label: t.settings }
  ];

  const handleItemClick = (id) => {
    setCurrentPage(id);
    if (window.innerWidth <= 768 && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header" onClick={() => handleItemClick('dashboard')}>
        <div className="logo-container">
          <div className="logo-wrapper">
            <img 
              src="/logo.png" 
              alt="Chicken Canyada Logo" 
              className="sidebar-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="logo-glow"></div>
          </div>
          <div className="logo-text-container">
            <h2 className="logo-title">{restaurantName || t.appName}</h2>
            <p className="logo-subtitle">Dashboard</p>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer-support">
        <button 
          className="floating-support-btn" 
          onClick={() => {
            onOpenSupport();
            if (window.innerWidth <= 768 && setSidebarOpen) {
              setSidebarOpen(false);
            }
          }}
          title="Signaler un bug technique"
        >
          <HelpCircle size={20} />
          <span>Support</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;