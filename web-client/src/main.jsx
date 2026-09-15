import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 main.jsx: Démarrage de l\'application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Élément #root non trouvé!');
  document.body.innerHTML = '<div style="padding: 2rem; text-align: center; background: #0F1724; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #FFFFFF;"><h1 style="color: #FFC107;">❌ Erreur</h1><p>Élément #root non trouvé dans index.html</p></div>';
} else {
  console.log('✅ Élément #root trouvé');
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ Application rendue');
  } catch (error) {
    console.error('❌ Erreur lors du rendu:', error);
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; background: #0F1724; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #FFFFFF;">
        <h1 style="color: #FFC107; margin-bottom: 1rem;">❌ Erreur de Rendu</h1>
        <p style="color: #E5E7EB; margin-bottom: 1rem;">${error.message}</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #FFC107; color: #0B0B0B; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; margin-top: 1rem;">
          Recharger la page
        </button>
      </div>
    `;
  }
}