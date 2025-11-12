// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { authAPI } from '../services/api';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Tentative de connexion...', { email, password });

    try {
      const data = await authAPI.login(email, password);
      
      console.log('✅ Réponse API:', data);
      
      if (data.success) {
        console.log('✅ Connexion réussie!');
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      console.error('❌ Réponse:', err.response);
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Erreur de connexion au serveur';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🍽️ Mon Restaurant</h1>
          <h2>Dashboard Admin</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@restaurant.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="login-footer">
          <p>📧 Email: admin@restaurant.com</p>
          <p>🔑 Password: admin123456</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;