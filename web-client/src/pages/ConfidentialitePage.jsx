// src/pages/ConfidentialitePage.jsx

import React from 'react';
import { EyeOff, User, PhoneCall, MapPin, Database, Send } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './ConfidentialitePage.css';

const ConfidentialitePage = () => {
  const { settings } = useSettings();
  const restaurantName = settings.restaurantName || 'La Canyada';

  return (
    <div className="legal-page confidentialite-page">
      <div className="legal-container">
        <div className="legal-header">
          <div className="legal-badge">
            <EyeOff size={18} />
            Vie Privée
          </div>
          <h1 className="legal-title">Politique de Confidentialité</h1>
          <p className="legal-subtitle">Conformité à la Loi n° 09-08 relative à la protection des données au Maroc</p>
        </div>

        <div className="legal-card-grid">
          <div className="legal-card">
            <div className="legal-card-icon">
              <Database size={28} />
            </div>
            <div className="legal-card-content">
              <h3>1. Collecte des Données Personnelles</h3>
              <p>
                Afin de pouvoir traiter et acheminer efficacement vos repas chauds, nous collectons de manière stricte uniquement les informations personnelles strictement nécessaires. Il s'agit des données suivantes :
              </p>
              <ul className="data-collect-list">
                <li>
                  <User size={16} className="list-icon" />
                  <strong>Votre Nom complet :</strong> Pour l'identification de la commande et le contact de livraison.
                </li>
                <li>
                  <PhoneCall size={16} className="list-icon" />
                  <strong>Votre Numéro de téléphone :</strong> Indispensable pour la confirmation téléphonique, le suivi de livraison par nos agents et pour permettre au livreur de vous contacter à son arrivée.
                </li>
                <li>
                  <MapPin size={16} className="list-icon" />
                  <strong>Votre Adresse exacte de livraison :</strong> Coordonnées géographiques et détails de l'adresse pour guider nos livreurs à Casablanca.
                </li>
              </ul>
            </div>
          </div>

          <div className="legal-card">
            <div className="legal-card-icon">
              <Send size={28} />
            </div>
            <div className="legal-card-content">
              <h3>2. Finalité du Traitement des Données</h3>
              <p>
                Conformément aux dispositions de la <strong>Loi n° 09-08</strong> relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel au Maroc (régie par la CNDP), vos informations font l'objet d'un traitement automatisé ayant pour uniques finalités :
              </p>
              <p>
                • La prise de commande et la préparation en cuisine.<br />
                • Le suivi téléphonique pour la validation et l'organisation logistique.<br />
                • La livraison physique à domicile par nos coursiers attitrés.
              </p>
            </div>
          </div>

          <div className="legal-card">
            <div className="legal-card-icon">
              <EyeOff size={28} />
            </div>
            <div className="legal-card-content">
              <h3>3. Confidentialité et Non-Partage</h3>
              <p>
                Vos informations personnelles sont considérées comme <strong>strictement confidentielles</strong> par les équipes de <strong>{restaurantName}</strong>. 
              </p>
              <p className="legal-warning-text">
                🔒 Nous nous engageons formellement à ne jamais divulguer, prêter, échanger, louer ou vendre vos données à caractère personnel à des entités tierces, partenaires commerciaux ou réseaux de publicité. L'accès à vos données est strictement limité aux employés de cuisine, aux agents du service client et aux livreurs en cours de mission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidentialitePage;
