// src/pages/CheckoutPage.jsx

import React, { useState } from 'react';
import { MapPin, CreditCard, Wallet, Phone, User as UserIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import './CheckoutPage.css';

const CheckoutPage = ({ setCurrentPage }) => {
  const { cart, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Casablanca',
    postalCode: '',
    paymentMethod: 'cash',
    notes: '',
  });

  const deliveryFee = 15;
  const finalTotal = total + deliveryFee;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        items: cart.map(item => ({
          menuItem: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        total: finalTotal,
        deliveryAddress: {
          street: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const response = await ordersAPI.create(orderData);

      if (response.success) {
        setOrderId(response.order.orderNumber);
        setOrderPlaced(true);
        clearCart();
      }
    } catch (error) {
      console.error('Erreur création commande:', error);
      alert('Erreur lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="order-success">
            <div className="success-icon">✓</div>
            <h1>Commande confirmée!</h1>
            <p className="order-number">Numéro de commande: <strong>#{orderId}</strong></p>
            <p>Votre commande a été passée avec succès.</p>
            <p>Vous recevrez votre commande dans environ 30 minutes.</p>
            
            <div className="success-actions">
              <button 
                className="track-btn"
                onClick={() => setCurrentPage('tracking')}
              >
                Suivre ma commande
              </button>
              <button 
                className="home-btn"
                onClick={() => setCurrentPage('home')}
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Finaliser la commande</h1>

        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Informations personnelles */}
          <div className="form-section">
            <h2><UserIcon size={20} /> Informations personnelles</h2>
            
            <div className="form-group">
              <label>Nom complet *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Votre nom"
                required
              />
            </div>

            <div className="form-group">
              <label>Téléphone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+212 6XX XXX XXX"
                required
              />
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="form-section">
            <h2><MapPin size={20} /> Adresse de livraison</h2>
            
            <div className="form-group">
              <label>Adresse complète *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="N° Rue, Quartier"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ville *</label>
                <select name="city" value={formData.city} onChange={handleChange} required>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Fes">Fès</option>
                  <option value="Tanger">Tanger</option>
                </select>
              </div>

              <div className="form-group">
                <label>Code postal</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="20000"
                />
              </div>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="form-section">
            <h2><CreditCard size={20} /> Mode de paiement</h2>
            
            <div className="payment-methods">
              <label className={`payment-option ${formData.paymentMethod === 'cash' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                />
                <div className="payment-content">
                  <Wallet size={24} />
                  <span>Paiement à la livraison</span>
                </div>
              </label>

              <label className={`payment-option ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                />
                <div className="payment-content">
                  <CreditCard size={24} />
                  <span>Carte bancaire</span>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="form-section">
            <h2>Notes (optionnel)</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Instructions de livraison, allergies, etc..."
              rows="3"
            />
          </div>

          {/* Résumé */}
          <div className="checkout-summary">
            <h2>Résumé de la commande</h2>
            
            <div className="summary-items">
              {cart.map(item => (
                <div key={item._id} className="summary-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{item.price * item.quantity} DH</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-line">
                <span>Sous-total</span>
                <span>{total} DH</span>
              </div>
              <div className="summary-line">
                <span>Frais de livraison</span>
                <span>{deliveryFee} DH</span>
              </div>
              <div className="summary-line total">
                <span>Total</span>
                <span>{finalTotal} DH</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Traitement...' : 'Confirmer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;