// src/pages/MentionsLegalesPage.jsx

import React from 'react';
import { Landmark, FileText, Server, Scale, ShieldAlert } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './MentionsLegalesPage.css';

const MentionsLegalesPage = () => {
  const { settings } = useSettings();
  const restaurantName = settings.restaurantName || 'La Canyada';

  return (
    <div className="legal-page mentions-legales-page">
      <div className="legal-container">
        <div className="legal-header">
          <div className="legal-badge">
            <Scale size={18} />
            Mentions Légales
          </div>
          <h1 className="legal-title">Mentions Légales</h1>
          <p className="legal-subtitle">Informations juridiques concernant l'éditeur et l'hébergeur de la plateforme</p>
        </div>

        <div className="legal-card-grid">
          <div className="legal-card">
            <div className="legal-card-icon">
              <Landmark size={28} />
            </div>
            <div className="legal-card-content">
              <h3>1. Éditeur de la Plateforme</h3>
              <p>
                Le présent site internet est édité et exploité par la société :
              </p>
              <ul className="legal-details-list">
                <li><strong>Dénomination sociale :</strong> SARL {restaurantName}</li>
                <li><strong>Forme juridique :</strong> Société à Responsabilité Limitée (SARL)</li>
                <li><strong>Capital social :</strong> 100 000,00 Dirhams (DH)</li>
                <li><strong>Siège social :</strong> Boulevard Zerktouni, Résidence El-Fath, Casablanca, Maroc</li>
                <li><strong>Registre du Commerce (RC) :</strong> RC Casablanca n° 548972</li>
                <li><strong>Identifiant Commun de l'Entreprise (ICE) :</strong> ICE n° 002879412000085</li>
                <li><strong>Directeur de la publication :</strong> Service de Communication {restaurantName}</li>
              </ul>
            </div>
          </div>

          <div className="legal-card">
            <div className="legal-card-icon">
              <Server size={28} />
            </div>
            <div className="legal-card-content">
              <h3>2. Hébergement du Site</h3>
              <p>
                La technique, la maintenance applicative et l'hébergement sécurisé des données de la plateforme sont assurés de manière exclusive sur les serveurs de la société :
              </p>
              <ul className="legal-details-list">
                <li><strong>Hébergeur :</strong> Hostinger International Ltd.</li>
                <li><strong>Siège social :</strong> 61 Lordou Vironos Street, 6023 Larnaca, Chypre</li>
                <li><strong>Contact technique :</strong> support@hostinger.com | https://www.hostinger.com</li>
              </ul>
            </div>
          </div>

          <div className="legal-card">
            <div className="legal-card-icon">
              <ShieldAlert size={28} />
            </div>
            <div className="legal-card-content">
              <h3>3. Propriété Intellectuelle</h3>
              <p>
                L'ensemble du contenu présent sur cette plateforme (structure générale, arborescence, textes, images animées ou non, chartes graphiques, photographies, logos, et icônes) est la propriété intellectuelle exclusive de <strong>SARL {restaurantName}</strong>. 
              </p>
              <p>
                Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est strictement interdite sans l'autorisation écrite préalable de l'éditeur, conformément à la législation sur le droit d'auteur en vigueur au Maroc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegalesPage;
