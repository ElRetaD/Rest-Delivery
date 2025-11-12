// src/components/Layout/Sidebar.jsx

import React from 'react';
import { Home, ShoppingBag, Map, FileText, Settings, Utensils } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, t }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: t.dashboard },
    { id: 'orders', icon: ShoppingBag, label: t.orders },
    { id: 'menu', icon: Utensils, label: 'Menu' },
    { id: 'map', icon: Map, label: t.map },
    { id: 'reports', icon: FileText, label: t.reports },
    { id: 'settings', icon: Settings, label: t.settings }
  ];

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>🍽️ {t.appName}</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;