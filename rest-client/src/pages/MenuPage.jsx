// src/pages/MenuPage.jsx

import React, { useState, useEffect } from 'react';
import { Search, Plus, Star } from 'lucide-react';
import { menuAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import './MenuPage.css';

const MenuPage = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  const categories = [
    { id: 'all', label: 'Tout', icon: '🍽️' },
    { id: 'burger', label: 'Burgers', icon: '🍔' },
    { id: 'pizza', label: 'Pizzas', icon: '🍕' },
    { id: 'tacos', label: 'Tacos', icon: '🌮' },
    { id: 'pasta', label: 'Pâtes', icon: '🍝' },
    { id: 'sandwich', label: 'Sandwichs', icon: '🥪' },
    { id: 'salad', label: 'Salades', icon: '🥗' },
    { id: 'drink', label: 'Boissons', icon: '🥤' },
  ];

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await menuAPI.getAll();
      if (response.success) {
        setMenu(response.menuItems);
      }
    } catch (error) {
      console.error('Erreur chargement menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenu = menu.filter(item => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (item.nameAr && item.nameAr.includes(searchQuery));
    return matchCategory && matchSearch && item.isAvailable;
  });

  const handleAddToCart = (item) => {
    addToCart(item);
    // Animation ou notification
    const btn = document.querySelector(`[data-item="${item._id}"]`);
    if (btn) {
      btn.textContent = '✓ Ajouté';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.textContent = 'Ajouter';
        btn.style.background = '';
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="menu-loading">
        <div className="spinner"></div>
        <p>Chargement du menu...</p>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-container">
        {/* Header */}
        <div className="menu-header">
          <h1>Notre Menu</h1>
          <p>Découvrez nos délicieux plats</p>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher un plat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="categories">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {filteredMenu.length === 0 ? (
          <div className="no-items">
            <p>Aucun plat trouvé</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredMenu.map(item => (
              <div key={item._id} className="menu-card">
                <div className="menu-card-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="placeholder-image">
                      {categories.find(c => c.id === item.category)?.icon || '🍽️'}
                    </div>
                  )}
                  {item.isPopular && (
                    <div className="popular-badge">
                      <Star size={14} fill="currentColor" />
                      Populaire
                    </div>
                  )}
                </div>

                <div className="menu-card-content">
                  <h3 className="menu-card-title">{item.name}</h3>
                  {item.nameAr && (
                    <p className="menu-card-title-ar">{item.nameAr}</p>
                  )}
                  
                  <p className="menu-card-description">
                    {item.description || 'Délicieux plat'}
                  </p>

                  <div className="menu-card-footer">
                    <div className="menu-card-price">{item.price} DH</div>
                    <button
                      className="add-to-cart-btn"
                      data-item={item._id}
                      onClick={() => handleAddToCart(item)}
                    >
                      <Plus size={18} />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;