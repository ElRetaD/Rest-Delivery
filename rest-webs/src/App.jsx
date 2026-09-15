// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import MapPage from './pages/MapPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import MenuManagementPage from './pages/MenuManagementPage';
import UsersManagementPage from './pages/UsersManagementPage';
import DeliverersCaissePage from './pages/DeliverersCaissePage';
import ExpensesPage from './pages/ExpensesPage';
import LoginPage from './pages/LoginPage';
import FloatingSupport from './components/layout/FloatingSupport';
import { translations } from './translations/translations';
import { ordersAPI, deliverersAPI, statsAPI, settingsAPI, authAPI } from './services/api';
import socketService from './services/socket';
import { notify } from './utils/notifications';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Erreur capturée par ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
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
          background: '#f5f7fa',
          color: '#1f2937'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ef4444' }}>⚠️ Une erreur s'est produite</h1>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
            {this.state.error?.message || 'Erreur inconnue'}
          </p>
          {this.state.errorInfo && (
            <details style={{ marginTop: '1rem', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', color: '#6b7280' }}>Détails de l'erreur</summary>
              <pre style={{
                background: '#1f2937',
                color: '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '0.5rem'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
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
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Swipe Gestures for Mobile Sidebar Drawer
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Check if swipe is primarily horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      const minSwipeDistance = 70; // minimum distance f px
      
      if (deltaX > minSwipeDistance) {
        // Swipe left-to-right: Open sidebar (trigger only if swipe starts f the left edge)
        if (touchStartX.current < 40) {
          setSidebarOpen(true);
        }
      } else if (deltaX < -minSwipeDistance) {
        // Swipe right-to-left: Close sidebar
        if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    }
  };
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [deliverers, setDeliverers] = useState([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    revenue: 0,
    pending: 0,
    delivered: 0,
  });
  const [weekStats, setWeekStats] = useState(null);
  const [topDishes, setTopDishes] = useState([]);
  const [settings, setSettings] = useState({
    restaurantName: 'La Canyada',
  });
  const [supportOpen, setSupportOpen] = useState(false);

  const t = translations.fr;

  // Appliquer le theme au chargement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Charger les données depuis l'API
  const loadData = async () => {
    try {
      // Charger les informations de l'utilisateur
      try {
        const userData = await authAPI.getMe();
        if (userData.success && userData.user) {
          setUser({
            id: userData.user._id || userData.user.id,
            name: userData.user.name,
            email: userData.user.email,
            role: userData.user.role,
          });
          console.log('✅ Utilisateur chargé:', userData.user);
        }
      } catch (error) {
        console.error('❌ Erreur chargement user:', error);
      }

      // Charger les paramètres
      try {
        const settingsData = await settingsAPI.get();
        if (settingsData.success && settingsData.settings) {
          setSettings(prev => ({ ...prev, ...settingsData.settings }));
        }
      } catch (error) {
        console.error('Erreur chargement settings:', error);
      }

      // Charger les commandes
      const ordersData = await ordersAPI.getAll();
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }

      // Charger les livreurs
      const deliverersData = await deliverersAPI.getAll();
      if (deliverersData.success) {
        setDeliverers(deliverersData.deliverers);
      }

      // Charger les statistiques
      const statsData = await statsAPI.getToday();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Charger les stats de la semaine
      const weekStatsData = await statsAPI.getWeek();
      if (weekStatsData.success) {
        setWeekStats(weekStatsData.stats);
      }

      // Charger les plats populaires
      const topDishesData = await statsAPI.getTopDishes();
      if (topDishesData.success) {
        setTopDishes(topDishesData.dishes);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  // Vérifier l'authentification et connecter le socket
  useEffect(() => {
    console.log('🔵 App.jsx: Vérification authentification...');
    const token = localStorage.getItem('adminToken');

    if (token) {
      setIsAuthenticated(true);
      loadData();
      socketService.connect();
    }
    setLoading(false);

    // Cleanup function for socket
    return () => {
      if (token) {
        socketService.disconnect();
      }
    };
  }, []);

  // Écouter l'événement d'expiration de session (401) pour réinitialiser l'état proprement
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('adminToken');
      socketService.disconnect();
      setIsAuthenticated(false);
      setUser(null);
      setOrders([]);
      setDeliverers([]);
    };

    window.addEventListener('admin:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('admin:unauthorized', handleUnauthorized);
    };
  }, []);

  // Gérer les écouteurs d'événements Socket
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleNewOrder = (order) => {
      console.log('📦 Nouvelle commande reçue:', order.orderNumber);
      notify.newOrder(order.orderNumber);
      setOrders(prev => {
        // Éviter les doublons
        if (prev.some(o => o._id === order._id)) return prev;
        return [order, ...prev];
      });
      loadStats();
    };

    const handleOrderUpdated = (updatedOrder) => {
      console.log('🔄 Commande mise à jour reçue:', updatedOrder._id);
      setOrders(prev =>
        prev.map(o => o._id === updatedOrder._id ? updatedOrder : o)
      );
      loadStats();
    };

    const handleDelivererPosition = (data) => {
      setDeliverers(prev => {
        const idMatches = (d) =>
          d._id === data.delivererId ||
          d._id === data.userId ||
          d.id === data.delivererId ||
          d.id === data.userId ||
          (d.user && (d.user === data.delivererId || d.user === data.userId || d.user._id === data.delivererId || d.user._id === data.userId));

        const exists = prev.some(idMatches);
        if (exists) {
          return prev.map(d =>
            idMatches(d)
              ? {
                  ...d,
                  currentLocation: data.position || data.location,
                  location: data.position || data.location,
                  ...(data.status ? { status: data.status } : {}),
                  ...(data.phone ? { phone: data.phone } : {}),
                  ...(data.name ? { name: data.name } : {}),
                }
              : d
          );
        } else {
          return [
            ...prev,
            {
              _id: data.delivererId,
              id: data.delivererId,
              name: data.name || 'Livreur',
              phone: data.phone,
              status: data.status || 'available',
              currentLocation: data.position || data.location,
              location: data.position || data.location,
            }
          ];
        }
      });
    };

    const handleDelivererStatus = (data) => {
      console.log('📦 Statut livreur mis à jour (socket):', data);
      setDeliverers(prev =>
        prev.map(d =>
          (d._id === data.delivererId ||
           d._id === data.userId ||
           d.id === data.delivererId ||
           (d.user && (d.user === data.delivererId || d.user === data.userId || d.user._id === data.delivererId || d.user._id === data.userId)))
            ? { ...d, status: data.status }
            : d
        )
      );
    };

    const handleReconnected = () => {
      console.log('🔄 [App.jsx] Reconnexion Socket détectée: Rattrapage automatique des données (loadData)');
      loadData();
    };

    // S'abonner aux événements
    socketService.on('newOrder', handleNewOrder);
    socketService.on('orderUpdated', handleOrderUpdated);
    socketService.on('delivererPositionUpdated', handleDelivererPosition);
    socketService.on('delivererStatusChanged', handleDelivererStatus);
    socketService.on('reconnected', handleReconnected);

    // Nettoyer les écouteurs lors du démontage
    return () => {
      socketService.off('newOrder', handleNewOrder);
      socketService.off('orderUpdated', handleOrderUpdated);
      socketService.off('delivererPositionUpdated', handleDelivererPosition);
      socketService.off('delivererStatusChanged', handleDelivererStatus);
      socketService.off('reconnected', handleReconnected);
    };
  }, [isAuthenticated]);

  // Charger uniquement les stats
  const loadStats = async () => {
    try {
      const statsData = await statsAPI.getToday();
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Gérer la connexion réussie
  const handleLoginSuccess = async (userData) => {
    setIsAuthenticated(true);
    // Charger les données utilisateur complètes depuis l'API
    try {
      const userResponse = await authAPI.getMe();
      if (userResponse.success && userResponse.user) {
        setUser({
          id: userResponse.user._id || userResponse.user.id,
          name: userResponse.user.name,
          email: userResponse.user.email,
          role: userResponse.user.role,
        });
      } else {
        // Fallback sur les données du login
        setUser({
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
      }
    } catch (error) {
      console.error('Erreur chargement user après login:', error);
      // Fallback sur les données du login
      setUser({
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
    }
    loadData();
    socketService.connect();
    notify.success(`Bienvenue ${userData.name || 'Admin'}!`);
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    socketService.disconnect();
    setIsAuthenticated(false);
    setUser(null);
    setOrders([]);
    setDeliverers([]);
    notify.info('Déconnexion réussie');
  };

  // Debug logs
  console.log('🔵 App render - loading:', loading, 'isAuthenticated:', isAuthenticated);

  // Afficher le loader
  if (loading) {
    console.log('⏳ Affichage loading screen');
    return (
      <div className="loading-screen" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#f5f7fa',
        color: '#1f2937'
      }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTopColor: '#1f2937',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', fontSize: '16px', color: '#6b7280' }}>Chargement...</p>
      </div>
    );
  }

  // Afficher la page de connexion
  if (!isAuthenticated) {
    console.log('🔐 Affichage LoginPage');
    return (
      <>
        <Toaster />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  console.log('📊 Affichage Dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage orders={orders} setOrders={setOrders} stats={stats} t={t} setCurrentPage={setCurrentPage} weekStats={weekStats} topDishes={topDishes} deliverers={deliverers} />;
      case 'orders':
        return <OrdersPage orders={orders} setOrders={setOrders} t={t} />;
      case 'map':
        return <MapPage deliverers={deliverers} t={t} />;
      case 'reports':
        return <ReportsPage t={t} orders={orders} />;
      case 'settings':
        return <SettingsPage t={t} user={user} />;
      case 'menu':
        return <MenuManagementPage t={t} />;
      case 'users':
        return <UsersManagementPage t={t} />;
      case 'deliverers-caisse':
        return <DeliverersCaissePage />;
      case 'expenses':
        return <ExpensesPage />;
      default:
        return <DashboardPage orders={orders} setOrders={setOrders} stats={stats} t={t} weekStats={weekStats} topDishes={topDishes} />;
    }
  };

  return (
    <ErrorBoundary>
      <div 
        className={`app ltr ${!sidebarOpen ? 'sidebar-closed' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontSize: '14px',
            },
          }}
        />
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          t={t}
          restaurantName={settings.restaurantName}
          onOpenSupport={() => setSupportOpen(true)}
        />
        {/* Mobile sidebar overlay */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className="main-content">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            theme={theme}
            setTheme={setTheme}
            user={user}
            orders={orders}
            setCurrentPage={setCurrentPage}
            onLogout={handleLogout}
            settings={settings}
            setSettings={setSettings}
          />
          <div className="content">
            {renderPage()}
          </div>
        </div>
        <FloatingSupport isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
