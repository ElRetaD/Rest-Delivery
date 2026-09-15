// src/App.jsx

import React, { useState, Component, useEffect } from 'react';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CGVPage from './pages/CGVPage';
import ConfidentialitePage from './pages/ConfidentialitePage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import FloatingSupport from './components/Layout/FloatingSupport';
import './App.css';

// Error Boundary pour capturer les erreurs
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Erreur capturée:', error, errorInfo);
    this.setState({
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0F1724',
          color: '#FFFFFF'
        }}>
          <h1 style={{ color: '#FFC107', fontSize: '2rem', marginBottom: '1rem' }}>⚠️ Une erreur s'est produite</h1>
          <p style={{ color: '#E5E7EB', marginTop: '1rem', fontSize: '1.125rem' }}>
            {this.state.error?.message || 'Erreur inconnue'}
          </p>
          {(this.state.error?.stack || this.state.errorInfo) && (
            <details style={{ marginTop: '1rem', textAlign: 'left', maxWidth: '800px', background: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
              <summary style={{ cursor: 'pointer', color: '#FFC107', fontWeight: '600' }}>Détails de l'erreur</summary>
              {this.state.error?.stack && (
                <pre style={{ color: '#E5E7EB', fontSize: '0.85rem', overflow: 'auto', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.stack}
                </pre>
              )}
              {this.state.errorInfo?.componentStack && (
                <pre style={{ color: '#E5E7EB', fontSize: '0.85rem', overflow: 'auto', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '12px 24px',
              background: '#FFC107',
              color: '#0B0B0B',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)'
            }}
          >
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [currentPage, setCurrentPageState] = useState('home');
  
  // Initial cinematic splash screen (plays once on site launch)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showInitialText, setShowInitialText] = useState(false);
  const [isInitialFadingOut, setIsInitialFadingOut] = useState(false);

  // Fast page switches (plays during page navigation)
  const [isSwitchingPage, setIsSwitchingPage] = useState(false);
  const [isSwitchFadingOut, setIsSwitchFadingOut] = useState(false);

  console.log('✅ App component rendered, currentPage:', currentPage);

  // Run initial cinematic load once on mount
  useEffect(() => {
    // Start typing "La Canyada" at 500ms
    const timer1 = setTimeout(() => {
      setShowInitialText(true);
    }, 500);

    // Start fading out the initial black screen overlay at 2300ms
    const timer2 = setTimeout(() => {
      setIsInitialFadingOut(true);
    }, 2300);

    // Remove initial loading state entirely at 2700ms
    const timer3 = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Réinitialisation propre de la navigation lors d'un 401 Unauthorized
  useEffect(() => {
    const handleUnauthorizedNav = () => {
      setCurrentPageState((prev) => (prev === 'profile' || prev === 'checkout' ? 'home' : prev));
    };

    window.addEventListener('auth:unauthorized', handleUnauthorizedNav);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorizedNav);
    };
  }, []);

  // Snappy page switcher (300-450ms transition)
  const setCurrentPage = (newPage) => {
    if (newPage === currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSwitchingPage(true);
    setIsSwitchFadingOut(false);

    // Switch the page content under the hood at 200ms
    setTimeout(() => {
      setCurrentPageState(newPage);
      window.scrollTo(0, 0);
    }, 200);

    // Start fading out the switcher overlay at 250ms
    setTimeout(() => {
      setIsSwitchFadingOut(true);
    }, 250);

    // Finish the switcher state cleanup at 450ms (total blocking time: 450ms)
    setTimeout(() => {
      setIsSwitchingPage(false);
      setIsSwitchFadingOut(false);
    }, 450);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'menu':
        return <MenuPage />;
      case 'cart':
        return <CartPage setCurrentPage={setCurrentPage} />;
      case 'about':
        return <AboutPage setCurrentPage={setCurrentPage} />;
      case 'contact':
        return <ContactPage setCurrentPage={setCurrentPage} />;
      case 'checkout':
        return <CheckoutPage setCurrentPage={setCurrentPage} />;
      case 'profile':
        return <ProfilePage setCurrentPage={setCurrentPage} />;
      case 'tracking':
        return <OrderTrackingPage />;
      case 'cgv':
        return <CGVPage />;
      case 'confidentialite':
        return <ConfidentialitePage />;
      case 'mentions-legales':
        return <MentionsLegalesPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <div className="app">
              {isInitialLoading && (
                <div className={`page-transition-overlay ${isInitialFadingOut ? 'fade-out' : ''}`}>
                  {/* Floating ambient glow orbs */}
                  <div className="page-transition-bg-glow-1"></div>
                  <div className="page-transition-bg-glow-2"></div>
                  
                  {/* Floating golden dust particles */}
                  <div className="page-transition-particle p1"></div>
                  <div className="page-transition-particle p2"></div>
                  <div className="page-transition-particle p3"></div>
                  <div className="page-transition-particle p4"></div>
                  
                  <div className="page-transition-content">
                    <div className={`page-transition-text ${showInitialText ? 'show' : ''}`}>
                      {/* "La " */}
                      {"La ".split('').map((char, index) => (
                        <span 
                          key={`prefix-${index}`} 
                          style={{ animationDelay: `${index * 0.05}s` }}
                          className={`page-transition-letter ${char === ' ' ? 'space' : ''}`}
                        >
                          {char}
                        </span>
                      ))}

                      {/* Gold C Logo inline representing 'C' */}
                      <div className="page-transition-logo-inline">
                        <div className="logo-light-burst"></div>
                        <div className="logo-aura-ring-inline"></div>
                        <div className="logo-aura-ring-solid"></div>
                        <img 
                          src="/logo_c.png" 
                          alt="C" 
                          className="page-transition-logo-inline-img" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>

                      {/* "anyada" */}
                      {"anyada".split('').map((char, index) => {
                        const globalIndex = index + 3; // offset
                        return (
                          <span 
                            key={`suffix-${index}`} 
                            style={{ animationDelay: `${globalIndex * 0.05}s` }}
                            className="page-transition-letter"
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Snappy page switcher overlay */}
              {isSwitchingPage && (
                <div className={`page-switch-overlay ${isSwitchFadingOut ? 'fade-out' : ''}`}>
                  <div className="page-switch-spinner-c">C</div>
                </div>
              )}
              <Toaster position="top-center" reverseOrder={false} />
              <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
              <main className="main-content">
                {renderPage()}
              </main>
              <Footer setCurrentPage={setCurrentPage} />
              <FloatingSupport />
            </div>
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

// Placeholder components
import { useSettings } from './context/SettingsContext';

const Footer = ({ setCurrentPage }) => {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Top glow bar */}
      <div className="footer-glow-bar" />

      <div className="footer-inner">
        {/* Brand column */}
        <div className="footer-brand">
          <div className="footer-logo-row">
            <img 
              src="/favicon.ico" 
              alt="Logo" 
              style={{ width: '36px', height: '36px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.3))' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="footer-logo-name">{settings.restaurantName || 'La Canyada'}</span>
          </div>
          <p className="footer-tagline">Des saveurs authentiques livrées directement chez vous, chaque jour.</p>
          {settings.address && (
            <div className="footer-addresses-list">
              {settings.address.split('\n').map((line, idx) => (
                <div key={idx} className="footer-address-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          )}
          {/* Social links */}
          <div className="footer-socials">
            <a
              href="https://web.facebook.com/p/Lacanyada-100034346148482/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn footer-social-fb"
              title="Suivez-nous sur Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              Facebook
            </a>
            <a
              href="https://www.instagram.com/chicken__canyada/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn footer-social-ig"
              title="Suivez-nous sur Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              Instagram
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider-v" />

        {/* Quick links */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-links-list">
            {[
              { label: '🏠 Accueil', page: 'home' },
              { label: '🍽️ Menu', page: 'menu' },
              { label: '📍 À propos', page: 'about' },
              { label: '✉️ Contact', page: 'contact' },
            ].map(({ label, page }) => (
              <li key={page}>
                <button className="footer-link-btn" onClick={() => setCurrentPage(page)}>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="footer-divider-v" />

        {/* Contact */}
        <div className="footer-contact-col">
          <h4 className="footer-col-title">Contactez-nous</h4>
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="footer-contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {settings.phone}
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="footer-contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {settings.email}
            </a>
          )}
          <div className="footer-hours">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Ouvert 7j/7 — Livraison express</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom-bar">
        <span>© {currentYear} <strong>{settings.restaurantName || 'La Canyada'}</strong>. Tous droits réservés.</span>
        
        {/* Sub-footer legal links */}
        <div className="footer-legal-links">
          <button className="footer-legal-link" onClick={() => setCurrentPage('mentions-legales')}>
            Mentions Légales
          </button>
          <span className="footer-legal-separator">|</span>
          <button className="footer-legal-link" onClick={() => setCurrentPage('cgv')}>
            Conditions Générales de Vente (CGV)
          </button>
          <span className="footer-legal-separator">|</span>
          <button className="footer-legal-link" onClick={() => setCurrentPage('confidentialite')}>
            Politique de Confidentialité
          </button>
        </div>

        <span className="footer-dev-credit">
          Développé par <strong style={{ color: '#facc15', letterSpacing: '0.5px' }}>ZAI GO</strong>
        </span>
      </div>
    </footer>
  );
};

export default App;