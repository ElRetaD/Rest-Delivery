// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, TrendingUp, Heart, Plus } from 'lucide-react';
import { menuAPI, reviewsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import './HomePage.css';

// Fallback testimonials (static data — declared at module level)
const fallbackTestimonials = [
  {
    name: 'Hicham Soubhi',
    rating: 5,
    comment: 'Nice couscous on Fridays, i like it a lot it was just perfect. The manager was great and friendly same as the waiter',
    avatar: '👨‍💼',
  },
  {
    name: 'Ibtissam Falah',
    rating: 5,
    comment: 'La Canyada is my place to eat pasta dishes with all kinds of sauces.',
    avatar: '👩‍💼',
  },
  {
    name: 'Imad Abouz',
    rating: 5,
    comment: 'Very nice place and very good Moroccan food',
    avatar: '👨‍🎓',
  },
];

const HomePage = ({ setCurrentPage }) => {
  const [popularItems, setPopularItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const { addToCart } = useCart();
  const { settings } = useSettings();

  // État pour le modal de quantité
  const [showModal, setShowModal] = useState(false);
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

  const features = [
    {
      icon: '🍕',
      title: 'Menu Varié',
      description: 'Large choix de plats délicieux',
    },
    {
      icon: '🚀',
      title: 'Livraison Rapide',
      description: `En moins de ${settings.deliveryTime || 30} minutes`,
    },
    {
      icon: '💵',
      title: 'Paiement Facile',
      description: 'Paiement à la livraison',
    },
    {
      icon: '⭐',
      title: 'Qualité Premium',
      description: 'Ingrédients frais et de qualité',
    },
  ];

  const openingHours = {
    days: 'Lundi - Dimanche',
    hours: '10:00 - 23:00',
  };

  useEffect(() => {
    loadPopularItems();
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const response = await reviewsAPI.getLatest(15);
      if (response.success && response.reviews && response.reviews.length > 0) {
        // Filter reviews that have 4 or 5 stars, map them, and slice to max 3
        const highRatedReviews = response.reviews
          .filter(rev => rev.rating >= 4)
          .map(rev => ({
            name: rev.user?.name || 'Client',
            rating: rev.rating,
            comment: rev.comment,
            avatar: rev.user?.picture || '👤',
            time: rev.menuItem ? `Plat: ${rev.menuItem.name}` : new Date(rev.createdAt).toLocaleDateString('fr-FR'),
          }));
        
        if (highRatedReviews.length > 0) {
          setTestimonials(highRatedReviews.slice(0, 3));
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } else {
        setTestimonials(fallbackTestimonials);
      }
    } catch (error) {
      console.error('Erreur chargement témoignages:', error);
      setTestimonials(fallbackTestimonials);
    }
  };

  const loadPopularItems = async () => {
    try {
      const response = await menuAPI.getAll();
      if (response.success) {
        // Filtrer les plats disponibles et marqués comme populaires
        const popular = response.menuItems.filter(item => item.isAvailable && item.isPopular);
        setPopularItems(popular.slice(0, 4));
      }
    } catch (error) {
      console.error('Erreur chargement menu:', error);
    }
  };

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
    setShowModal(true);
  };

  const closeProductModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setSelectedSize('petite');
    setQuantity(1);
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

    addToCart(itemToAdd, quantity);
    closeProductModal();

    // Feedback on adding
    const btn = document.querySelector(`[data-popular-item="${selectedItem._id}"]`);
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✓ Ajouté';
      btn.style.background = '#10b981';
      btn.style.color = '#ffffff';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 1000);
    }
  };

  const handleAddToCart = (item) => {
    openProductModal(item);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      pizza: '🍕',
      burger: '🍔',
      tacos: '🌮',
      pasta: '🍝',
      sandwich: '🥪',
      salad: '🥗',
      drink: '🥤',
    };
    return icons[category] || '🍽️';
  };

  return (
    <div className="home-page">
      {/* Hero Section - الأهم */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-logo">
            <img
              src="/logo.png"
              alt="Chicken Canyada Logo"
              className="hero-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="hero-title">
            Savourez nos délices
            <br />
            <span className="gradient-text">livrés chez vous</span>
          </h1>
          <p className="hero-subtitle">
            Commandez vos plats préférés et profitez d'une livraison rapide et de qualité
          </p>
          <button
            className="hero-btn"
            onClick={() => setCurrentPage('menu')}
          >
            Voir le Menu
          </button>
        </div>
        <div className="hero-image">
          <div className="hero-image-container">
            <img
              src="/restaurant-image.jpg"
              alt="Chicken la Canyada Restaurant"
              className="hero-restaurant-image"
              onError={(e) => {
                // Fallback to placeholder if image not found
                e.target.style.display = 'none';
                if (!e.target.nextElementSibling) {
                  const fallback = document.createElement('div');
                  fallback.className = 'hero-image-placeholder';
                  fallback.textContent = '🍔 🍕 🌮 🍝';
                  e.target.parentNode.appendChild(fallback);
                }
              }}
            />
          </div>
        </div>
      </section>

      {/* Popular Items Section - مهم جداً */}
      {popularItems.length > 0 && (
        <section className="popular-section">
          <div className="popular-header">
            <h2 className="section-title">
              <TrendingUp size={32} />
              Plats Populaires
            </h2>
            <p className="section-subtitle">Découvrez nos plats les plus appréciés</p>
          </div>
          <div className="popular-grid">
            {popularItems.map(item => (
              <div key={item._id} className="popular-card">
                <div className="popular-card-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="popular-placeholder">
                      {getCategoryIcon(item.category)}
                    </div>
                  )}
                  <div className="popular-badge">
                    <Star size={16} fill="currentColor" />
                    Populaire
                  </div>
                </div>
                <div className="popular-card-content">
                  <h3>{item.name}</h3>
                  {item.nameAr && <p className="popular-name-ar">{item.nameAr}</p>}
                  <p className="popular-description">
                    {item.description || 'Délicieux plat préparé avec soin'}
                  </p>
                  <div className="popular-card-footer">
                    <span className="popular-price">{item.price} DH</span>
                    <button
                      className="popular-add-btn"
                      data-popular-item={item._id}
                      onClick={() => handleAddToCart(item)}
                    >
                      <Plus size={16} />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="popular-cta">
            <button
              className="view-all-btn"
              onClick={() => setCurrentPage('menu')}
            >
              Voir Tout le Menu →
            </button>
          </div>
        </section>
      )}




      {/* Features Section - Pourquoi nous choisir - بعد الأقسام المهمة */}
      <section className="features-section">
        <h2 className="section-title">Pourquoi nous choisir ?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">
          <Heart size={32} />
          Ce que disent nos clients
        </h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                {testimonial.avatar && testimonial.avatar.startsWith('http') ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="testimonial-avatar-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="testimonial-avatar" style={{ display: testimonial.avatar && testimonial.avatar.startsWith('http') ? 'none' : 'flex' }}>
                  {testimonial.avatar || '👤'}
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <div className="testimonial-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < testimonial.rating ? "#fbbf24" : "#e5e7eb"}
                        color={i < testimonial.rating ? "#fbbf24" : "#e5e7eb"}
                      />
                    ))}
                  </div>
                  {testimonial.time && (
                    <span className="testimonial-time">{testimonial.time}</span>
                  )}
                </div>
              </div>
              <p className="testimonial-comment">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Opening Hours Section */}
      <section className="hours-section">
        <div className="hours-container">
          <h2 className="section-title">
            <Clock size={32} />
            Horaires d'Ouverture
          </h2>
          <div className="hours-single-card">
            <div className="hours-day">{openingHours.days}</div>
            <div className="hours-time">{openingHours.hours}</div>
          </div>
        </div>
      </section>

      {/* CTA Section - في النهاية */}
      <section className="cta-section">
        <h2>Prêt à commander ?</h2>
        <p>Découvrez notre menu et passez votre commande maintenant</p>
        <button
          className="cta-btn"
          onClick={() => setCurrentPage('menu')}
        >
          Commander Maintenant
        </button>
      </section>

      {/* Modal de quantité */}
      {showModal && selectedItem && (
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
                {getCategoryIcon(selectedItem.category)}
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

export default HomePage;