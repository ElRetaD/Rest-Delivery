// src/context/CartContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    calculateTotal();
  }, [cart]);

  // Calculer le total
  const calculateTotal = () => {
    const sum = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(sum);
  };

  // Ajouter un article au panier
  const addToCart = (item) => {
    const existingItem = cart.find(i => i._id === item._id);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i._id === item._id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Retirer un article du panier
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  // Mettre à jour la quantité
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item =>
      item._id === itemId
        ? { ...item, quantity }
        : item
    ));
  };

  // Augmenter la quantité
  const incrementQuantity = (itemId) => {
    setCart(cart.map(item =>
      item._id === itemId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };

  // Diminuer la quantité
  const decrementQuantity = (itemId) => {
    const item = cart.find(i => i._id === itemId);
    if (item && item.quantity > 1) {
      setCart(cart.map(i =>
        i._id === itemId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ));
    } else {
      removeFromCart(itemId);
    }
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
    setTotal(0);
  };

  // Obtenir le nombre total d'articles
  const getItemsCount = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  const value = {
    cart,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getItemsCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};