// src/pages/ContactPage.jsx

import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Facebook, Instagram, MessageCircle, Twitter, Store, Navigation } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './ContactPage.css';

const ContactPage = () => {
  const { settings } = useSettings();


  const socialLinks = [
    { icon: <Facebook size={20} />, name: 'Facebook', color: '#1877F2', link: 'https://web.facebook.com/p/Lacanyada-100034346148482/?_rdc=1&_rdr#' },
    { icon: <Instagram size={20} />, name: 'Instagram', color: '#E4405F', link: 'https://www.instagram.com/chicken__canyada/?hl=en' },
  ];

  // Informations des restaurants/snacks
  const restaurantLocations = [
    {
      id: 1,
      name: 'Bournazel',
      nameAr: 'بورنازيل',
      address: 'Bournazel, Casablanca, Maroc',
      addressAr: 'بورنازيل، الدار البيضاء، المغرب',
      phone: '0522709807',
      email: settings.email || 'contact@restaurant.com',
      openingHours: {
        weekdays: '10:00 - 23:00',
        weekend: '10:00 - 00:00',
        days: 'Lundi - Dimanche'
      },
      googleMapsLink: 'https://maps.app.goo.gl/L4CB8iMdJn1VHamu5',
      coordinates: {
        lat: 33.5731,
        lng: -7.5898
      },
      features: [
        'Service sur place',
        'Livraison à domicile',
        'Parking disponible',
        'WiFi gratuit'
      ]
    },
    {
      id: 2,
      name: 'Hay Drissia',
      nameAr: 'حي الدريسة',
      address: 'Hay Drissia, Casablanca, Maroc',
      addressAr: 'حي الدريسة، الدار البيضاء، المغرب',
      phone: '0602484043',
      email: settings.email || 'contact@restaurant.com',
      openingHours: {
        weekdays: '10:00 - 23:00',
        weekend: '10:00 - 00:00',
        days: 'Lundi - Dimanche'
      },
      googleMapsLink: 'https://maps.app.goo.gl/zSjR42cg1qQWysUGA',
      coordinates: {
        lat: 33.5731,
        lng: -7.5898
      },
      features: [
        'Service sur place',
        'Livraison à domicile',
        'Parking disponible',
        'WiFi gratuit'
      ]
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <div className="contact-hero-badge">
            <MessageSquare size={20} />
            Contactez-nous
          </div>
          <h1 className="contact-hero-title">
            Nous sommes là pour <span className="gradient-text">vous aider</span>
          </h1>
          <p className="contact-hero-description">
            Une question ? Une suggestion ? N'hésitez pas à nous contacter. Notre équipe est à votre disposition.
          </p>
        </div>
      </section>


      {/* Restaurant Locations Section */}
      <section className="restaurant-locations-section">
        <div className="contact-container">
          <div className="locations-header">
            <div className="section-badge">
              <Store size={20} />
              Nos Restaurants
            </div>
            <h2 className="locations-title">Nos Points de Vente</h2>
            <p className="locations-subtitle">
              Retrouvez-nous dans nos deux emplacements à Casablanca
            </p>
          </div>

          <div className="locations-grid">
            {restaurantLocations.map((location) => (
              <div key={location.id} className="location-card-detailed">
                <div className="location-card-header">
                  <div className="location-number">{location.id}</div>
                  <div className="location-name-wrapper">
                    <h3 className="location-name">{location.name}</h3>
                    {location.nameAr && (
                      <p className="location-name-ar">{location.nameAr}</p>
                    )}
                  </div>
                </div>

                <div className="location-details">
                  <div className="location-detail-item">
                    <MapPin size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Adresse</p>
                      <p className="detail-value">{location.address}</p>
                      {location.addressAr && (
                        <p className="detail-value-ar">{location.addressAr}</p>
                      )}
                      <a
                        href={location.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="location-map-link"
                      >
                        <Navigation size={16} />
                        Voir sur Google Maps
                      </a>
                    </div>
                  </div>

                  <div className="location-detail-item">
                    <Phone size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Téléphone</p>
                      <a href={`tel:${location.phone}`} className="detail-value-link">
                        {location.phone}
                      </a>
                    </div>
                  </div>

                  <div className="location-detail-item">
                    <Mail size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Email</p>
                      <a href={`mailto:${location.email}`} className="detail-value-link">
                        {location.email}
                      </a>
                    </div>
                  </div>

                  <div className="location-detail-item">
                    <Clock size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Horaires d'ouverture</p>
                      <p className="detail-value">{location.openingHours.days}</p>
                      <p className="detail-value-time">
                        Semaine: {location.openingHours.weekdays}
                      </p>
                      <p className="detail-value-time">
                        Weekend: {location.openingHours.weekend}
                      </p>
                    </div>
                  </div>

                  <div className="location-features">
                    <p className="features-label">Services disponibles:</p>
                    <div className="features-list">
                      {location.features.map((feature, idx) => (
                        <span key={idx} className="feature-badge">
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suivez-nous Section */}
      <section className="contact-info-sidebar-section">
        <div className="contact-container">
          <div className="contact-sidebar-wrapper">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Suivez-nous</h3>
              <div className="social-links-grid">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    className="social-link"
                    style={{ '--social-color': social.color }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

