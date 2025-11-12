// src/pages/HomePage.jsx

import React from 'react';
import { Clock, MapPin, Star } from 'lucide-react';
import './HomePage.css';

const HomePage = ({ setCurrentPage }) => {
  const features = [
    {
      icon: '🍕',
      title: 'Menu Varié',
      description: 'Large choix de plats délicieux',
    },
    {
      icon: '🚀',
      title: 'Livraison Rapide',
      description: 'En moins de 30 minutes',
    },
    {
      icon: '💳',
      title: 'Paiement Facile',
      description: 'Cash ou carte bancaire',
    },
    {
      icon: '⭐',
      title: 'Qualité Premium',
      description: 'Ingrédients frais et de qualité',
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
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
          <div className="hero-image-placeholder">
            🍔 🍕 🌮 🍝
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">500+</div>
          <div className="stat-label">Clients Satisfaits</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">1000+</div>
          <div className="stat-label">Commandes Livrées</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">4.9★</div>
          <div className="stat-label">Note Moyenne</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">30min</div>
          <div className="stat-label">Temps de Livraison</div>
        </div>
      </section>

      {/* CTA Section */}
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
    </div>
  );
};

export default HomePage;