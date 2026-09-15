// src/pages/AboutPage.jsx

import React from 'react';
import { Heart, Award, Clock, MapPin, Users, Target, ChefHat, Star } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './AboutPage.css';

const AboutPage = ({ setCurrentPage }) => {
  const { settings } = useSettings();

  const values = [
    {
      icon: <ChefHat size={32} />,
      title: 'Qualité Premium',
      description: 'Des ingrédients frais et de première qualité dans chaque plat',
    },
    {
      icon: <Clock size={32} />,
      title: 'Livraison Rapide',
      description: `Livraison en moins de ${settings.deliveryTime || 30} minutes`,
    },
    {
      icon: <Heart size={32} />,
      title: 'Passion Culinaire',
      description: 'Chaque plat est préparé avec amour et attention aux détails',
    },
    {
      icon: <Award size={32} />,
      title: 'Excellence',
      description: 'Un service client exceptionnel et une satisfaction garantie',
    },
  ];


  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-hero-badge">
            <ChefHat size={20} />
            Depuis 2020
          </div>
          <h1 className="about-hero-title">
            À propos de <span className="gradient-text">{settings.restaurantName}</span>
          </h1>
          {settings.restaurantNameAr && (
            <p className="about-hero-subtitle">{settings.restaurantNameAr}</p>
          )}
          <p className="about-hero-description">
            Votre destination pour des repas délicieux, préparés avec passion et livrés rapidement à votre porte.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="about-container">
          <div className="story-content">
            <div className="story-text">
              <div className="section-badge">
                <Heart size={16} />
                Notre Histoire
              </div>
              <h2 className="section-title">Une Passion pour l'Excellence</h2>
              <p className="story-paragraph">
                Fondé en 2020, <strong>{settings.restaurantName}</strong> est né d'une passion simple :
                offrir des plats délicieux et de qualité supérieure à nos clients, directement chez eux.
              </p>
              <p className="story-paragraph">
                Depuis notre ouverture, nous avons servi plus de <strong>10,000 clients satisfaits</strong> avec
                des plats préparés avec soin, en utilisant uniquement les meilleurs ingrédients frais et locaux.
              </p>
              <p className="story-paragraph">
                Notre engagement envers la qualité et le service client nous a permis de devenir l'un des
                restaurants de livraison les plus appréciés de la région.
              </p>
            </div>
            <div className="story-image">
              <div className="story-image-placeholder">
                <img src="/logo.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="about-container">
          <div className="mission-header">
            <div className="section-badge">
              <Target size={16} />
              Notre Mission
            </div>
            <h2 className="section-title">Ce qui Nous Anime</h2>
            <p className="section-subtitle">
              Offrir une expérience culinaire exceptionnelle à chaque commande
            </p>
          </div>
          <div className="mission-grid">
            {values.map((value, index) => (
              <div key={index} className="mission-card">
                <div className="mission-icon">{value.icon}</div>
                <h3 className="mission-title">{value.title}</h3>
                <p className="mission-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Location Section */}
      {settings.address && (
        <section className="about-location">
          <div className="about-container">
            <div className="location-card">
              <div className="location-icon">
                <MapPin size={32} />
              </div>
              <div className="location-content">
                <h3 className="location-title">📍 Notre Adresse</h3>
                <p className="location-address" style={{ whiteSpace: 'pre-line' }}>{settings.address}</p>
                {settings.addressAr && (
                  <p className="location-address-ar" style={{ whiteSpace: 'pre-line' }}>{settings.addressAr}</p>
                )}
                {settings.phone && (
                  <p className="location-phone">📞 {settings.phone}</p>
                )}
                {settings.email && (
                  <p className="location-email">📧 {settings.email}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-container">
          <div className="cta-content">
            <h2 className="cta-title">Prêt à Commander ?</h2>
            <p className="cta-description">
              Découvrez notre menu varié et savourez des plats délicieux livrés chez vous
            </p>
            <button
              className="cta-button"
              onClick={() => setCurrentPage && setCurrentPage('menu')}
            >
              Voir le Menu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

