// src/components/Layout/Navbar.jsx

import React, { useState } from 'react';
import { ShoppingCart, User, Menu as MenuIcon, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import './Navbar.css';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const { getItemsCount } = useCart();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'menu', label: 'Menu' },
    { id: 'about', label: 'À propos' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-backdrop" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => {
            setCurrentPage('home');
            setMobileMenuOpen(false);
          }}>
          <img 
            src="/logo.png" 
            alt="Chicken Canyada Logo" 
            className="logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span className="logo-text">{settings.restaurantName}</span>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu desktop-menu">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Side */}
        <div className="navbar-actions">
          <button 
            className="nav-icon-btn"
            onClick={() => setCurrentPage('cart')}
          >
            <ShoppingCart size={24} />
            {getItemsCount() > 0 && (
              <span className="cart-badge">{getItemsCount()}</span>
            )}
          </button>
          
          <button 
            className="nav-icon-btn"
            onClick={() => setCurrentPage('profile')}
          >
            <User size={24} />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-links">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <span className="mobile-nav-bullet"></span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;