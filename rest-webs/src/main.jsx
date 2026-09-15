// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

console.log('🚀 main.jsx: Démarrage de l\'application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Élément #root non trouvé!');
  document.body.innerHTML = '<div style="padding: 2rem; text-align: center; background: #f5f7fa; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column;"><h1 style="color: #ef4444;">❌ Erreur</h1><p>Élément #root non trouvé dans index.html</p></div>';
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
      <div style="padding: 2rem; text-align: center; background: #f5f7fa; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column;">
        <h1 style="color: #ef4444; margin-bottom: 1rem;">❌ Erreur de rendu</h1>
        <p style="color: #6b7280; margin-bottom: 1rem;">${error.message}</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Recharger
        </button>
      </div>
    `;
  }
}