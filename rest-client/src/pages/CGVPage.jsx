// src/pages/CGVPage.jsx

import React from 'react';
import { ShieldCheck, FileText, Landmark, Truck, Ban } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './CGVPage.css';

const CGVPage = () => {
  const { settings } = useSettings();
  const restaurantName = settings.restaurantName || 'La Canyada';

  return (
    <div className="legal-page cgv-page">
      <div className="legal-container">
        <div className="legal-header">
          <div className="legal-badge">
            <FileText size={18} />
            Conditions Générales de Vente
          </div>
          <h1 className="legal-title">Conditions Générales de Vente (CGV)</h1>
          <p className="legal-subtitle">En vigueur à compter du 1er Juillet 2026</p>
        </div>

        <div className="legal-card-grid">
          <div className="legal-card">
            <div className="legal-card-icon">
              <ShieldCheck size={28} />
            </div>
            <div className="legal-card-content">
              <h3>1. Objet</h3>
              <p>
                Les présentes Conditions Générales de Vente (CGV) régissent de manière exclusive l'ensemble des relations commerciales entre le restaurant <strong>{restaurantName}</strong> et ses clients pour tout achat de repas effectué en livraison ou à emporter via notre plateforme internet. Tout passage de commande implique l'acceptation entière et sans réserve des présentes CGV par le client.
              </p>
            </div>
          </div>

          <div className="legal-card">
            <div className="legal-card-icon">
              <Landmark size={28} />
            </div>
            <div className="legal-card-content">
              <h3>2. Prix et Tarification</h3>
              <p>
                Tous les prix des plats et boissons présentés sur notre plateforme sont exprimés en <strong>Dirhams marocains (DH)</strong>. Ils s'entendent toutes taxes comprises (TTC), incluant la taxe sur la valeur ajoutée (TVA) en vigueur au Maroc au jour de la commande. Les frais de livraison applicables (s'ils existent) sont indiqués de façon claire au moment du résumé final du panier d'achat avant la validation finale.
              </p>
            </div>
          </div>

          <div className="legal-card">
            <div className="legal-card-icon">
              <Ban size={28} />
            </div>
            <div className="legal-card-content">
              <h3>3. Modalités de Paiement (Paiement à la Livraison)</h3>
              <p>
                Afin de garantir une flexibilité maximale et la sécurité de nos clients au Maroc, le règlement des achats s'effectue <strong>exclusivement en espèces lors de la livraison physique (Cash on Delivery / COD)</strong>. Le paiement doit être remis directement au livreur en monnaie fiduciaire au moment exact de la réception du colis. 
              </p>
              <p className="legal-warning-text">
                ⚠️ Aucune transaction par carte bancaire ou chèque n'est acceptée en ligne ou à la livraison. Le client est prié de préparer l'appoint dans la mesure du possible afin de faciliter le bon déroulement de la livraison.
              </p>
            </div>
          </div>

          <div className="legal-card">
            <div className="legal-card-icon">
              <Truck size={28} />
            </div>
            <div className="legal-card-content">
              <h3>4. Zones et Délais de Livraison</h3>
              <p>
                Le service de livraison de <strong>{restaurantName}</strong> est restreint de manière stricte aux zones géographiques définies dans la ville de <strong>Casablanca</strong> (Maroc) telles que listées sur notre site web. 
              </p>
              <p>
                Les délais de livraison habituels sont indicatifs et se situent généralement entre <strong>30 et 45 minutes</strong> à compter de la confirmation téléphonique ou électronique de la commande. Bien que nous fassions tout notre possible pour respecter ces horaires, des retards indépendants de notre volonté (conditions de circulation, météo difficile) ne pourront donner lieu à des dommages-intérêts ou annulations.
              </p>
            </div>
          </div>

          <div className="legal-card">
            <div className="legal-card-icon">
              <FileText size={28} />
            </div>
            <div className="legal-card-content">
              <h3>5. Non-applicabilité du Droit de Rétractation</h3>
              <p>
                Conformément aux dispositions de l'article 36 de la <strong>Loi n° 31-08</strong> édictant des mesures de protection du consommateur au Maroc, le droit de rétractation légal ne peut être exercé pour les contrats de fourniture de biens qui, par leur nature, sont susceptibles de se détériorer ou de se périmer rapidement.
              </p>
              <p className="legal-warning-text">
                🚨 Les repas préparés, chauds et boissons fraîches vendus par {restaurantName} entrant dans cette catégorie de produits hautement périssables, <strong>aucun droit de rétractation, annulation tardive ou demande de remboursement</strong> ne sera accepté une fois la commande validée et sa préparation lancée en cuisine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGVPage;
