// src/pages/MenuPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { menuAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import './MenuPage.css';

const MenuPage = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const categoriesRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState('petite');
  const [quantity, setQuantity] = useState(1);
  const [customIngredients, setCustomIngredients] = useState({
    tomates: true,
    oignons: true,
    salade: true
  });
  const [selectedSauce, setSelectedSauce] = useState('Sauce Algérienne');
  const [customSupplements, setCustomSupplements] = useState([]);

  const categories = [
    { id: 'all', label: 'Tout', icon: '🍽️' },
    { id: 'burger', label: 'Burgers', icon: '🍔' },
    { id: 'pizza', label: 'Pizzas', icon: '🍕' },
    { id: 'tacos', label: 'Tacos', icon: '🌮' },
    { id: 'pasta', label: 'Pâtes', icon: '🍝' },
    { id: 'sandwich', label: 'Sandwichs', icon: '🥪' },
    { id: 'salad', label: 'Salades', icon: '🥗' },
    { id: 'grillade', label: 'Grillades', icon: '🔥' },
    { id: 'poulet', label: 'Poulet', icon: '🍗' },
    { id: 'menu-enfant', label: 'Menu Enfant', icon: '👶' },
    { id: 'drink', label: 'Boissons', icon: '🥤' },
  ];

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (categoriesRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    // Check on mount and resize
    checkScroll();
    window.addEventListener('resize', checkScroll);

    // Check on scroll
    const categoriesElement = categoriesRef.current;
    if (categoriesElement) {
      categoriesElement.addEventListener('scroll', checkScroll);
    }

    return () => {
      window.removeEventListener('resize', checkScroll);
      if (categoriesElement) {
        categoriesElement.removeEventListener('scroll', checkScroll);
      }
    };
  }, [menu]);

  const loadMenu = async () => {
    try {
      const response = await menuAPI.getAll();
      if (response.success) {
        console.log('📦 Menu items loaded:', response.menuItems.length);
        console.log('🖼️  First item image:', response.menuItems[0]?.image);
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

  const openProductModal = (item) => {
    setSelectedItem(item);
    setSelectedSize(item.sizes ? 'petite' : (item.tacoOptions ? 'seul' : null));
    setQuantity(1);
    setCustomIngredients({
      tomates: true,
      oignons: true,
      salade: true
    });
    setSelectedSauce('Sauce Algérienne');
    setCustomSupplements([]);
    setShowSizeModal(true);
  };

  const closeProductModal = () => {
    setShowSizeModal(false);
    setSelectedItem(null);
    setSelectedSize('petite');
    setQuantity(1);
  };

  const handleAddToCart = (item) => {
    openProductModal(item);
  };

  const handleCustomSupplementToggle = (supp) => {
    if (customSupplements.some(s => s.name === supp.name)) {
      setCustomSupplements(customSupplements.filter(s => s.name !== supp.name));
    } else {
      setCustomSupplements([...customSupplements, supp]);
    }
  };

  const getCurrentPrice = () => {
    if (!selectedItem) return 0;
    let basePrice = selectedItem.price || 0;
    if (selectedItem.sizes) {
      basePrice = selectedItem.sizes[selectedSize] || selectedItem.sizes.petite;
    } else if (selectedItem.tacoOptions) {
      basePrice = selectedItem.tacoOptions[selectedSize] || selectedItem.tacoOptions.seul;
    }

    const extraPrice = customSupplements.reduce((sum, s) => sum + (s.price || 0), 0);

    return basePrice + extraPrice;
  };

  const handleConfirmAdd = () => {
    if (!selectedItem) return;

    const finalItemPrice = getCurrentPrice();

    // Build unique compound key
    const ingredientsKey = Object.keys(customIngredients).filter(k => !customIngredients[k]).join('-');
    const supplementsKey = customSupplements.map(s => s.name).join('-');
    const sauceKey = selectedSauce.replace(/\s+/g, '');
    const uniqueCartId = `${selectedItem._id}-${selectedSize || 'default'}-${sauceKey}-${ingredientsKey || 'all'}-${supplementsKey || 'noextras'}`;

    // Format selection text
    const removedIngredients = Object.keys(customIngredients).filter(k => !customIngredients[k]);
    const optionsArray = [];
    if (selectedSize && selectedSize !== 'default') {
      optionsArray.push(selectedSize === 'petite' ? 'Petite' : (selectedSize === 'moyenne' ? 'Moyenne' : (selectedSize === 'seul' ? 'Seul' : 'Menu')));
    }
    optionsArray.push(selectedSauce);
    if (removedIngredients.length > 0) {
      optionsArray.push(`Sans ${removedIngredients.join(', ')}`);
    }
    if (customSupplements.length > 0) {
      optionsArray.push(`+ ${customSupplements.map(s => s.name).join(', ')}`);
    }
    const selectedOptionStr = optionsArray.join(', ');

    const itemToAdd = {
      ...selectedItem,
      cartItemId: uniqueCartId,
      productId: selectedItem._id, // original product ID (for backend references)
      _id: uniqueCartId, // unique key inside the cart array
      price: finalItemPrice, // final calculated price for this specific item (Base Price + Selected Supplements Prices)
      selectedPrice: finalItemPrice,
      selectedOption: selectedOptionStr,
      selectedSupplements: customSupplements,
      customIngredients,
      selectedSauce
    };

    // Add to real global cart context
    addToCart(itemToAdd, quantity);

    closeProductModal();

    // Feedback
    const btn = document.querySelector(`[data-item="${selectedItem._id}"]`);
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✓ Ajouté';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 1000);
    }
  };

  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = 200;
      categoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });

      // Check scroll position after a delay
      setTimeout(() => {
        const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }, 300);
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
        <div className="categories-wrapper">
          {showLeftArrow && (
            <button
              className="category-nav-btn category-nav-left"
              onClick={() => scrollCategories('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div className="categories" ref={categoriesRef}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <div className="category-icon-wrapper">
                  <span className="category-icon">{cat.icon}</span>
                </div>
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>

          {showRightArrow && (
            <button
              className="category-nav-btn category-nav-right"
              onClick={() => scrollCategories('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}
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
                  <img
                    src={item.image || ''}
                    alt={item.name}
                    onLoad={(e) => {
                      console.log('✅ Image loaded:', item.name);
                      e.target.style.display = 'block';
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder) {
                        placeholder.style.display = 'none';
                      }
                    }}
                    onError={(e) => {
                      console.error('❌ Image failed to load:', item.name, item.image);
                      e.target.style.display = 'none';
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                    loading="lazy"
                    style={{ display: item.image ? 'block' : 'none' }}
                  />
                  <div
                    className="placeholder-image"
                    style={{ display: item.image ? 'none' : 'flex' }}
                  >
                    {categories.find(c => c.id === item.category)?.icon || '🍽️'}
                  </div>
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

                  {/* Rating Display */}
                  {item.averageRating && item.averageRating > 0 ? (
                    <div className="menu-card-rating">
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={star <= Math.round(item.averageRating) ? '#FFC107' : 'none'}
                            color={star <= Math.round(item.averageRating) ? '#FFC107' : '#E5E7EB'}
                          />
                        ))}
                      </div>
                      <span className="rating-value">
                        {item.averageRating.toFixed(1)}
                      </span>
                      {item.reviewsCount > 0 && (
                        <span className="rating-count">
                          ({item.reviewsCount})
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="menu-card-rating no-rating">
                      <Star size={16} color="#E5E7EB" />
                      <span className="no-rating-text">Pas encore noté</span>
                    </div>
                  )}

                  <div className="menu-card-footer">
                    <div className="menu-card-price">
                      {item.sizes ? (
                        <div className="price-sizes">
                          <span className="size-label">P: {item.sizes.petite} DH</span>
                          <span className="size-label">M: {item.sizes.moyenne} DH</span>
                        </div>
                      ) : item.tacoOptions ? (
                        <div className="price-sizes">
                          <span className="size-label">Seul: {item.tacoOptions.seul} DH</span>
                          <span className="size-label">Menu: {item.tacoOptions.menu} DH</span>
                        </div>
                      ) : (
                        `${item.price} DH`
                      )}
                    </div>
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

      {/* Modal de sélection de taille/option */}
      {showSizeModal && selectedItem && (
        <div className="product-modal-overlay" onClick={closeProductModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            {/* Image du produit */}
            <div className="product-modal-image">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="product-modal-placeholder" style={{ display: selectedItem.image ? 'none' : 'flex' }}>
                {categories.find(c => c.id === selectedItem.category)?.icon || '🍽️'}
              </div>
              <button className="product-modal-close" onClick={closeProductModal}>×</button>
            </div>

            {/* Contenu */}
            <div className="product-modal-content">
              <h3 className="product-modal-title">{selectedItem.name}</h3>
              <p className="product-modal-price">{getCurrentPrice()} DH</p>
              <p className="product-modal-description">{selectedItem.description}</p>

              {/* Sélection de taille - Pizza */}
              {selectedItem.sizes && (
                <div className="product-modal-options">
                  <label className="product-modal-label">Taille</label>
                  <div className="size-radio-group">
                    <label className={`size-radio ${selectedSize === 'petite' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="size"
                        value="petite"
                        checked={selectedSize === 'petite'}
                        onChange={(e) => setSelectedSize(e.target.value)}
                      />
                      <span className="size-radio-label">Petite</span>
                      <span className="size-radio-price">{selectedItem.sizes.petite} DH</span>
                    </label>
                    <label className={`size-radio ${selectedSize === 'moyenne' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="size"
                        value="moyenne"
                        checked={selectedSize === 'moyenne'}
                        onChange={(e) => setSelectedSize(e.target.value)}
                      />
                      <span className="size-radio-label">Grande</span>
                      <span className="size-radio-price">{selectedItem.sizes.moyenne} DH</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Sélection d'option - Tacos */}
              {selectedItem.tacoOptions && (
                <div className="product-modal-options">
                  <label className="product-modal-label">Option</label>
                  <div className="size-radio-group">
                    <label className={`size-radio ${selectedSize === 'seul' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="option"
                        value="seul"
                        checked={selectedSize === 'seul'}
                        onChange={(e) => setSelectedSize(e.target.value)}
                      />
                      <span className="size-radio-label">Seul</span>
                      <span className="size-radio-price">{selectedItem.tacoOptions.seul} DH</span>
                    </label>
                    <label className={`size-radio ${selectedSize === 'menu' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="option"
                        value="menu"
                        checked={selectedSize === 'menu'}
                        onChange={(e) => setSelectedSize(e.target.value)}
                      />
                      <span className="size-radio-label">Menu</span>
                      <span className="size-radio-price">{selectedItem.tacoOptions.menu} DH</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Section 1: Ingrédients */}
              <div className="product-modal-options">
                <label className="product-modal-label">Personnaliser vos ingrédients</label>
                <div className="custom-options-grid">
                  <label className={`custom-checkbox-item ${customIngredients.tomates ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={customIngredients.tomates}
                      onChange={(e) => setCustomIngredients({ ...customIngredients, tomates: e.target.checked })}
                    />
                    <span className="custom-option-name">Tomates</span>
                  </label>
                  <label className={`custom-checkbox-item ${customIngredients.oignons ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={customIngredients.oignons}
                      onChange={(e) => setCustomIngredients({ ...customIngredients, oignons: e.target.checked })}
                    />
                    <span className="custom-option-name">Oignons</span>
                  </label>
                  <label className={`custom-checkbox-item ${customIngredients.salade ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={customIngredients.salade}
                      onChange={(e) => setCustomIngredients({ ...customIngredients, salade: e.target.checked })}
                    />
                    <span className="custom-option-name">Salade</span>
                  </label>
                </div>
              </div>

              {/* Section 2: Sauce */}
              <div className="product-modal-options">
                <label className="product-modal-label">Choisir une sauce</label>
                <div className="custom-options-grid">
                  <label className={`custom-radio-item ${selectedSauce === 'Sauce Algérienne' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="sauce"
                      value="Sauce Algérienne"
                      checked={selectedSauce === 'Sauce Algérienne'}
                      onChange={(e) => setSelectedSauce(e.target.value)}
                    />
                    <span className="custom-option-name">Sauce Algérienne</span>
                  </label>
                  <label className={`custom-radio-item ${selectedSauce === 'Sauce Mayonnaise' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="sauce"
                      value="Sauce Mayonnaise"
                      checked={selectedSauce === 'Sauce Mayonnaise'}
                      onChange={(e) => setSelectedSauce(e.target.value)}
                    />
                    <span className="custom-option-name">Sauce Mayonnaise</span>
                  </label>
                  <label className={`custom-radio-item ${selectedSauce === 'Sauce Ketchup' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="sauce"
                      value="Sauce Ketchup"
                      checked={selectedSauce === 'Sauce Ketchup'}
                      onChange={(e) => setSelectedSauce(e.target.value)}
                    />
                    <span className="custom-option-name">Sauce Ketchup</span>
                  </label>
                </div>
              </div>

              {/* Section 3: Suppléments (Payant et DYNAMIQUE de la database) */}
              {selectedItem.supplements && selectedItem.supplements.length > 0 && (
                <div className="product-modal-options">
                  <label className="product-modal-label">Ajouter des extras (Optionnel)</label>
                  <div className="custom-options-grid">
                    {selectedItem.supplements.map((supp, index) => {
                      const isChecked = customSupplements.some(s => s.name === supp.name);
                      return (
                        <label key={index} className={`custom-checkbox-item ${isChecked ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCustomSupplementToggle(supp)}
                          />
                          <span className="custom-option-name">{supp.name}</span>
                          <span className="custom-option-price">+{supp.price} DH</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div className="product-modal-quantity">
                <button
                  className="quantity-btn minus"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-btn plus"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </button>
              </div>

              {/* Bouton Ajouter */}
              <button className="product-modal-add" onClick={handleConfirmAdd}>
                <Plus size={18} />
                Confirmer et Ajouter ({getCurrentPrice() * quantity} DH)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;