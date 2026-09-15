// src/components/OrderTrackingMap.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const OrderTrackingMap = ({ 
  delivererPosition, 
  deliveryAddress, 
  restaurantLocation = { lat: 33.5731, lng: -7.5898 } // Casablanca par défaut
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [delivererMarker, setDelivererMarker] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  useEffect(() => {
    // Vérifier si Google Maps API Key est disponible
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google Maps API Key non configurée');
      return;
    }

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry'],
        });

        const { Map } = await loader.importLibrary('maps');
        const { AdvancedMarkerElement } = await loader.importLibrary('marker');
        const { DirectionsRenderer, DirectionsService, TravelMode, DirectionsStatus } = await loader.importLibrary('routes');

        // Créer la carte
        const mapInstance = new Map(mapRef.current, {
          center: delivererPosition || deliveryAddress?.coordinates || restaurantLocation,
          zoom: 13,
          mapId: 'ORDER_TRACKING_MAP',
        });

        setMap(mapInstance);

        // Marqueur du restaurant
        if (restaurantLocation) {
          new AdvancedMarkerElement({
            map: mapInstance,
            position: restaurantLocation,
            title: 'Restaurant',
          });
        }

        // Marqueur de l'adresse de livraison
        if (deliveryAddress?.coordinates) {
          new AdvancedMarkerElement({
            map: mapInstance,
            position: deliveryAddress.coordinates,
            title: 'Adresse de livraison',
          });
        }

        // Marqueur du livreur
        if (delivererPosition) {
          const deliverer = new AdvancedMarkerElement({
            map: mapInstance,
            position: delivererPosition,
            title: 'Livreur',
          });
          setDelivererMarker(deliverer);

          // Calculer l'itinéraire si on a les deux positions
          if (deliveryAddress?.coordinates) {
            const directionsService = new DirectionsService();
            const directionsRendererInstance = new DirectionsRenderer({
              map: mapInstance,
              suppressMarkers: true,
            });
            setDirectionsRenderer(directionsRendererInstance);

            directionsService.route(
              {
                origin: delivererPosition,
                destination: deliveryAddress.coordinates,
                travelMode: TravelMode.DRIVING,
              },
              (result, status) => {
                if (status === DirectionsStatus.OK) {
                  directionsRendererInstance.setDirections(result);
                }
              }
            );
          }
        }
      } catch (error) {
        console.error('Erreur chargement Google Maps:', error);
      }
    };

    if (mapRef.current) {
      initMap();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- Map init runs once on mount

  // Mettre à jour la position du livreur en temps réel
  useEffect(() => {
    if (map && delivererMarker && delivererPosition) {
      delivererMarker.position = delivererPosition;
      
      // Recalculer l'itinéraire si nécessaire
      // Note: Cette partie nécessite une refactorisation pour utiliser les libraries importées
      // Pour l'instant, on laisse la carte se mettre à jour avec la position

      // Centrer la carte sur le livreur
      map.setCenter(delivererPosition);
    }
  }, [delivererPosition, map, delivererMarker, deliveryAddress, directionsRenderer]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '400px', 
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid #e5e7eb'
      }} 
    />
  );
};

export default OrderTrackingMap;

