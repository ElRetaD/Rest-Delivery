// src/App.jsx

import React, { useState } from 'react';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProfilePage from './pages/ProfilePage';
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'menu':
        return <MenuPage />;
      case 'cart':
        return <CartPage setCurrentPage={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'checkout':
        return <CheckoutPage setCurrentPage={setCurrentPage} />;
      case 'profile':
        return <ProfilePage setCurrentPage={setCurrentPage} />;
      case 'tracking':
        return <OrderTrackingPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <CartProvider>
      <div className="app">
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="main-content">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}

// Placeholder components
const AboutPage = () => (
  <div className="page-container">
    <h1>À propos de nous</h1>
    <p>🍽️ Mon Restaurant - Votre destination pour des repas délicieux</p>
    <p>Fondé en 2020, nous nous engageons à offrir des plats de qualité supérieure avec un service de livraison rapide et efficace.</p>
    <div style={{ marginTop: '2rem' }}>
      <h2>Notre Histoire</h2>
      <p>Depuis notre ouverture, nous avons servi plus de 10 000 clients satisfaits avec des plats préparés avec passion et des ingrédients frais.</p>
    </div>
    <div style={{ marginTop: '2rem' }}>
      <h2>Notre Mission</h2>
      <p>Offrir une expérience culinaire exceptionnelle directement chez vous, en garantissant qualité, rapidité et satisfaction.</p>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="page-container">
    <h1>Contactez-nous</h1>
    <div style={{ marginTop: '2rem' }}>
      <h3>📞 Téléphone</h3>
      <p>+212 6XX XXX XXX</p>
    </div>
    <div style={{ marginTop: '1.5rem' }}>
      <h3>📧 Email</h3>
      <p>contact@monrestaurant.com</p>
    </div>
    <div style={{ marginTop: '1.5rem' }}>
      <h3>📍 Adresse</h3>
      <p>123 Rue Exemple, Casablanca, Maroc</p>
    </div>
    <div style={{ marginTop: '1.5rem' }}>
      <h3>🕐 Horaires d'ouverture</h3>
      <p>Lundi - Dimanche: 10h00 - 23h00</p>
    </div>
  </div>
);

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-section">
        <h3>🍽️ Mon Restaurant</h3>
        <p>Délicieux repas livrés chez vous</p>
      </div>
      <div className="footer-section">
        <h4>Liens rapides</h4>
        <ul>
          <li>Menu</li>
          <li>À propos</li>
          <li>Contact</li>
        </ul>
      </div>
      <div className="footer-section">
        <h4>Contact</h4>
        <p>📞 +212 6XX XXX XXX</p>
        <p>📧 contact@monrestaurant.com</p>
      </div>
      <div className="footer-section">
        <h4>Suivez-nous</h4>
        <div className="social-icons">
          📱 💬 📷
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© 2025 Mon Restaurant. Tous droits réservés.</p>
    </div>
  </footer>
);

export default App;