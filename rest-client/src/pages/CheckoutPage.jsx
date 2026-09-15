// src/pages/CheckoutPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CreditCard, Wallet, LogIn, Edit3, Check, X, AlertTriangle, Navigation } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CheckoutPage = ({ setCurrentPage }) => {
  const { cart, total, clearCart } = useCart();
  const { settings } = useSettings();
  const { user, isLoggedIn, loading: authLoading, updateAddress, addAddress } = useAuth();
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Trouver l'adresse par défaut
  const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  // Coordonnées GPS client précises pour la livraison
  const [coordinates, setCoordinates] = useState(
    defaultAddress?.coordinates?.lat && defaultAddress?.coordinates?.lng
      ? { lat: Number(defaultAddress.coordinates.lat), lng: Number(defaultAddress.coordinates.lng) }
      : null
  );
  const [isLocating, setIsLocating] = useState(false);

  // État du formulaire d'adresse pour modification
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: 'Casablanca',
    postalCode: '',
  });
  const [phoneError, setPhoneError] = useState('');

  // Mode de paiement
  const defaultPaymentMethod = settings.enableCashPayment ? 'cash' : (settings.enableCardPayment ? 'card' : 'cash');
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod);

  // Statut d'ouverture du restaurant et Panic Mode
  const isRestaurantOpen = settings?.isOpenNow !== false && settings?.isAcceptingOrders !== false;
  const closedOrPausedMessage = settings?.isAcceptingOrders === false
    ? (settings?.pauseReason?.trim() || 'Le restaurant est temporairement en pause suite à une forte affluence en cuisine. Veuillez réessayer dans quelques instants.')
    : (settings?.openStatusMessage || 'Le restaurant est actuellement fermé.');

  // Calculer les frais de livraison
  const deliveryFee = total >= (settings.freeDeliveryThreshold || 100) ? 0 : (settings.deliveryFee || 15);
  const finalTotal = total + deliveryFee;

  // Initialiser le formulaire d'adresse
  useEffect(() => {
    if (defaultAddress) {
      setAddressForm({
        firstName: defaultAddress.firstName || '',
        lastName: defaultAddress.lastName || '',
        phone: defaultAddress.phone || '',
        street: defaultAddress.street || '',
        city: defaultAddress.city || 'Casablanca',
        postalCode: defaultAddress.postalCode || '',
      });
      if (defaultAddress.coordinates?.lat && defaultAddress.coordinates?.lng) {
        setCoordinates({
          lat: Number(defaultAddress.coordinates.lat),
          lng: Number(defaultAddress.coordinates.lng),
        });
      }
    }
  }, [defaultAddress]);

  // Capturer la position GPS précise de l'utilisateur avec haute précision et timeout de 10s
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoordinates(newCoords);

        // Si le champ adresse est encore vide, pré-remplir avec un repère GPS tout en gardant la saisie modifiable
        setAddressForm((prev) => ({
          ...prev,
          street: prev.street && prev.street.trim() !== '' ? prev.street : `Position GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        }));

        toast.success('Position GPS capturée avec succès !');
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Accès à la position refusé. Veuillez autoriser la localisation ou saisir votre adresse manuellement.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Signal GPS indisponible. Veuillez renseigner votre adresse manuellement.');
            break;
          case error.TIMEOUT:
            toast.error("Délai d'attente dépassé (10s) pour obtenir votre position GPS.");
            break;
          default:
            toast.error('Impossible de récupérer votre position actuelle.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSaveAddress = async () => {
    if (!addressForm.firstName || !addressForm.lastName || !addressForm.phone || !addressForm.street) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const cleanPhone = String(addressForm.phone || '').replace(/[\s-.]/g, '');
    const phoneRegex = /^(0[67]\d{8}|\+212[67]\d{8})$/;
    if (!phoneRegex.test(cleanPhone)) {
      const errorMsg = 'Numéro de téléphone invalide (10 chiffres requis, ex: 0612345678 ou +212612345678).';
      setPhoneError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    setPhoneError('');

    try {
      setLoading(true);
      let result;

      const addressPayload = {
        ...addressForm,
        ...(coordinates ? { coordinates } : {}),
      };

      if (defaultAddress?._id) {
        // Mettre à jour l'adresse existante
        result = await updateAddress(defaultAddress._id, {
          ...addressPayload,
          isDefault: true
        });
      } else {
        // Ajouter une nouvelle adresse
        result = await addAddress({
          ...addressPayload,
          name: 'Domicile',
          isDefault: true
        });
      }

      if (result.success) {
        toast.success('Adresse mise à jour !');
        setIsEditingAddress(false);
      } else {
        toast.error(result.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strict synchronous lock: prevents rapid double-clicks from firing concurrent POST requests
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;

    if (!isRestaurantOpen) {
      toast.error(closedOrPausedMessage, { duration: 5000 });
      isSubmittingRef.current = false;
      return;
    }

    if (!cart || cart.length === 0) {
      toast.error('Votre panier est vide');
      isSubmittingRef.current = false;
      return;
    }

    if (!defaultAddress && !addressForm.street) {
      toast.error('Veuillez ajouter une adresse de livraison');
      setIsEditingAddress(true);
      isSubmittingRef.current = false;
      return;
    }

    const address = defaultAddress || addressForm;

    // Strict Phone Validation (Zero-Trust)
    const rawPhone = address.phone || user?.phone || '';
    const cleanPhone = String(rawPhone).replace(/[\s-.]/g, '');
    const phoneRegex = /^(0[67]\d{8}|\+212[67]\d{8})$/;
    if (!phoneRegex.test(cleanPhone)) {
      const errorMsg = 'Numéro de téléphone invalide (10 chiffres requis, ex: 0612345678 ou +212612345678).';
      setPhoneError(errorMsg);
      toast.error(errorMsg);
      if (!defaultAddress) {
        setIsEditingAddress(true);
      }
      isSubmittingRef.current = false;
      return;
    }
    setPhoneError('');

    if (paymentMethod === 'card') {
      toast.error('Le paiement par carte est bientôt disponible sur le web. Veuillez sélectionner le paiement à la livraison.');
      setPaymentMethod('cash');
      isSubmittingRef.current = false;
      return;
    }

    setLoading(true);

    const idempotencyKey = `web_${user?._id || 'user'}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const orderData = {
      idempotencyKey,
      customerName: `${address.firstName} ${address.lastName}`.trim() || user?.name,
      customerPhone: cleanPhone,
      items: cart.map(item => {
        const itemPrice = item.selectedPrice || item.price;
        const itemVariant = item.selectedSize || item.selectedOption ? ` (${item.selectedSize || item.selectedOption})` : '';
        return {
          menuItem: item.productId || item._id,
          name: `${item.name}${itemVariant}`,
          quantity: item.quantity,
          price: parseFloat(itemPrice),
          total: parseFloat(itemPrice) * parseInt(item.quantity),
          selectedSupplements: item.selectedSupplements || [],
          selectedOption: item.selectedOption || '',
          selectedSize: item.selectedSize || '',
        };
      }),
      total: parseFloat(finalTotal),
      deliveryAddress: {
        street: address.street,
        city: address.city,
        postalCode: address.postalCode || '',
        coordinates: coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : undefined,
      },
      deliveryLocation: {
        lat: coordinates?.lat ?? null,
        lng: coordinates?.lng ?? null,
        address: address.street,
        arrivalNotified: false,
      },
      paymentMethod: paymentMethod,
      status: 'new',
    };

    try {
      const response = await ordersAPI.create(orderData);
      if (response.success) {
        localStorage.setItem('lastOrderId', response.order._id);
        setOrderId(response.order.orderNumber);
        setOrderPlaced(true);
        clearCart();
        toast.success('Commande passée avec succès !');
      }
    } catch (error) {
      console.error('Erreur commande:', error);
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 409) {
        // Conflit : Le prix ou la disponibilité du plat a changé en base de données
        toast.error(data?.message || 'Le menu a été mis à jour, veuillez vérifier votre panier', { duration: 6000 });
      } else if (status === 403) {
        // Restaurant fermé ou en pause
        toast.error(data?.message || 'Le restaurant est actuellement fermé ou les commandes sont suspendues.', { duration: 6000 });
      } else {
        toast.error(data?.message || 'Erreur lors de la commande');
      }
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="auth-required">
            <div className="auth-icon">
              <LogIn size={48} />
            </div>
            <h1>Connexion requise</h1>
            <p>Vous devez être connecté pour passer une commande.</p>

            <div className="auth-actions">
              <button className="login-btn" onClick={() => setCurrentPage('profile')}>
                Se connecter / S'inscrire
              </button>
              <button className="back-btn" onClick={() => setCurrentPage('menu')}>
                Retour au menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <button className="track-btn" onClick={() => setCurrentPage('profile')}>
                Voir mes commandes
              </button>
              <button className="home-btn" onClick={() => setCurrentPage('home')}>
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

        {/* Alerte si le restaurant est fermé ou en pause */}
        {!isRestaurantOpen && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#991b1b',
          }}>
            <AlertTriangle size={26} style={{ flexShrink: 0, color: '#dc2626' }} />
            <div>
              <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>
                Prise de commandes temporairement suspendue
              </strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d' }}>
                {closedOrPausedMessage}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Adresse de livraison */}
          <div className="form-section">
            <h2><MapPin size={20} /> Adresse de livraison</h2>

            {!isEditingAddress ? (
              <div className="address-display">
                {defaultAddress ? (
                  <>
                    <div className="address-content">
                      <p className="address-name">{defaultAddress.firstName} {defaultAddress.lastName}</p>
                      <p className="address-street">{defaultAddress.street}</p>
                      <p className="address-city">{defaultAddress.postalCode} {defaultAddress.city}</p>
                      <p className="address-phone">📞 {defaultAddress.phone}</p>
                      {coordinates && (
                        <div className="gps-badge-indicator">
                          <Navigation size={13} />
                          <span>GPS capturé ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})</span>
                        </div>
                      )}
                    </div>
                    <div className="address-actions-group">
                      <button
                        type="button"
                        className={`gps-location-btn ${coordinates ? 'gps-active' : ''}`}
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        title="Utiliser ma position actuelle"
                      >
                        <Navigation size={16} className={isLocating ? 'gps-spinning' : ''} />
                        {isLocating ? 'Localisation...' : coordinates ? 'Position GPS active' : 'Utiliser ma position actuelle'}
                      </button>
                      <button type="button" className="edit-address-btn" onClick={() => setIsEditingAddress(true)}>
                        <Edit3 size={16} /> Modifier
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="no-address">
                    <p>Aucune adresse enregistrée</p>
                    <div className="no-address-actions">
                      <button
                        type="button"
                        className={`gps-location-btn ${coordinates ? 'gps-active' : ''}`}
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        title="Utiliser ma position actuelle"
                      >
                        <Navigation size={16} className={isLocating ? 'gps-spinning' : ''} />
                        {isLocating ? 'Localisation...' : 'Utiliser ma position actuelle'}
                      </button>
                      <button type="button" className="add-address-btn" onClick={() => setIsEditingAddress(true)}>
                        + Ajouter une adresse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="address-edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      value={addressForm.firstName}
                      onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nom *</label>
                    <input
                      type="text"
                      value={addressForm.lastName}
                      onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, phone: e.target.value });
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="0612345678 ou +212612345678"
                    required
                    style={phoneError ? { borderColor: '#ef4444' } : {}}
                  />
                  {phoneError && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {phoneError}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <div className="label-with-action">
                    <label>Adresse *</label>
                    <button
                      type="button"
                      className={`gps-inline-btn ${coordinates ? 'active' : ''}`}
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating}
                      title="Utiliser ma position actuelle via GPS"
                    >
                      <Navigation size={14} className={isLocating ? 'gps-spinning' : ''} />
                      {isLocating ? 'Localisation...' : coordinates ? 'GPS Détecté ✓' : 'Utiliser ma position actuelle'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="Rue, numéro, quartier..."
                    required
                  />
                  {coordinates && (
                    <div className="gps-coordinates-hint">
                      📍 Coordonnées GPS : {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ville</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Code Postal</label>
                    <input
                      type="text"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      placeholder="20000"
                    />
                  </div>
                </div>

                <div className="edit-actions">
                  <button type="button" className="cancel-edit-btn" onClick={() => setIsEditingAddress(false)}>
                    <X size={16} /> Annuler
                  </button>
                  <button type="button" className="save-edit-btn" onClick={handleSaveAddress} disabled={loading}>
                    <Check size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mode de paiement */}
          <div className="form-section">
            <h2><CreditCard size={20} /> Mode de paiement</h2>

            <div className="payment-methods">
              {settings.enableCashPayment && (
                <label className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-content">
                    <Wallet size={24} />
                    <span>Paiement à la livraison</span>
                  </div>
                </label>
              )}

              <label
                className={`payment-option ${paymentMethod === 'card' ? 'active' : ''} ${!settings.enableStripe ? 'payment-disabled' : ''}`}
                style={!settings.enableStripe ? { cursor: 'not-allowed', opacity: 0.55, filter: 'grayscale(50%)' } : {}}
                title={!settings.enableStripe ? 'Paiement par carte bientôt disponible sur le web' : ''}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => { if (settings.enableStripe) setPaymentMethod(e.target.value); }}
                  disabled={!settings.enableStripe}
                  style={!settings.enableStripe ? { cursor: 'not-allowed', pointerEvents: 'none' } : {}}
                />
                <div className="payment-content" style={!settings.enableStripe ? { pointerEvents: 'none' } : {}}>
                  <CreditCard size={24} />
                  <span>Carte bancaire</span>
                  {!settings.enableStripe && (
                    <span style={{ fontSize: '0.72rem', marginLeft: '0.4rem', color: '#f59e0b', fontWeight: 600 }}>(Bientôt disponible)</span>
                  )}
                </div>
              </label>

              {!settings.enableCashPayment && !settings.enableCardPayment && (
                <p style={{ color: '#ef4444', padding: '1rem' }}>
                  ⚠️ Aucun mode de paiement n'est actuellement disponible.
                </p>
              )}
            </div>
          </div>

          {/* Résumé */}
          <div className="checkout-summary">
            <h2>Résumé de la commande</h2>

            <div className="summary-items">
              {cart.map((item, index) => {
                const itemPrice = item.selectedPrice || item.price;
                const itemVariant = item.selectedSize || item.selectedOption ? ` (${item.selectedSize || item.selectedOption})` : '';
                const itemKey = item.selectedSize || item.selectedOption ? `${item._id}_${item.selectedSize || item.selectedOption}` : `${item._id}_${index}`;

                return (
                  <div key={itemKey} className="summary-item">
                    <span>{item.name}{itemVariant} × {item.quantity}</span>
                    <span>{itemPrice * item.quantity} DH</span>
                  </div>
                );
              })}
            </div>

            <div className="summary-totals">
              <div className="summary-line">
                <span>Sous-total</span>
                <span>{total} DH</span>
              </div>
              <div className="summary-line">
                <span>Frais de livraison</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span style={{ color: '#10b981' }}>Gratuit</span>
                  ) : (
                    `${deliveryFee} ${settings.currency || 'DH'}`
                  )}
                </span>
              </div>
              {total < (settings.freeDeliveryThreshold || 100) && (
                <div className="summary-line" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <span>Livraison gratuite à partir de {settings.freeDeliveryThreshold || 100} {settings.currency || 'DH'}</span>
                </div>
              )}
              <div className="summary-line total">
                <span>Total</span>
                <span>{finalTotal} DH</span>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || isSubmittingRef.current || !cart || cart.length === 0 || (!defaultAddress && !addressForm.street) || isEditingAddress || !isRestaurantOpen}
              style={!isRestaurantOpen ? { opacity: 0.6, cursor: 'not-allowed', background: '#9ca3af' } : {}}
            >
              {loading || isSubmittingRef.current ? 'Traitement...' : (!isRestaurantOpen ? 'Commandes suspendues' : 'Confirmer la commande')}
            </button>

            {(!cart || cart.length === 0) && (
              <p style={{ color: '#ef4444', marginTop: '10px', fontSize: '14px' }}>
                ⚠️ Votre panier est vide
              </p>
            )}

            {isEditingAddress && (
              <p style={{ color: '#fbbf24', marginTop: '10px', fontSize: '14px' }}>
                ⚠️ Veuillez enregistrer votre adresse avant de confirmer
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
