// src/pages/CartPage.jsx

import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartPage.css';

const CartPage = ({ setCurrentPage }) => {
  const {
    cart,
    total,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const deliveryFee = 15;
  const finalTotal = total + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <ShoppingBag size={80} />
            <h2>Votre panier est vide</h2>
            <p>Ajoutez des plats délicieux à votre panier</p>
            <button 
              className="browse-menu-btn"
              onClick={() => setCurrentPage('menu')}
            >
              Parcourir le menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Mon Panier</h1>
          <button className="clear-cart-btn" onClick={clearCart}>
            Vider le panier
          </button>
        </div>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
            {cart.map(item => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="cart-placeholder">🍽️</div>
                  )}
                </div>

                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  {item.nameAr && <p className="item-name-ar">{item.nameAr}</p>}
                  <p className="item-price">{item.price} DH</p>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => decrementQuantity(item._id)}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => incrementQuantity(item._id)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="item-total">
                    {item.price * item.quantity} DH
                  </div>

                  <button 
                    className="remove-btn"
                    onClick={() => removeFromCart(item._id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Résumé de la commande</h2>
            
            <div className="summary-line">
              <span>Sous-total</span>
              <span>{total} DH</span>
            </div>

            <div className="summary-line">
              <span>Frais de livraison</span>
              <span>{deliveryFee} DH</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-line total-line">
              <span>Total</span>
              <span>{finalTotal} DH</span>
            </div>

            <button 
              className="checkout-btn"
              onClick={() => setCurrentPage('checkout')}
            >
              Passer la commande
            </button>

            <button 
              className="continue-shopping-btn"
              onClick={() => setCurrentPage('menu')}
            >
              Continuer mes achats
            </button>

            <div className="payment-methods">
              <p>Moyens de paiement acceptés:</p>
              <div className="payment-icons">
                💳 💵 📱
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;