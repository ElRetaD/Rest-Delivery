// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import MapPage from './pages/MapPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import MenuManagementPage from './pages/MenuManagementPage';
import LoginPage from './pages/LoginPage';
import { translations } from './translations/translations';
import { ordersAPI, deliverersAPI, statsAPI } from './services/api';
import socketService from './services/socket';
import { notify } from './utils/notifications';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState('fr');
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

  const t = translations[language];
  const isRTL = language === 'ar';

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      loadData();
      connectSocket();
    }
    setLoading(false);
  }, []);

  // Charger les données depuis l'API
  const loadData = async () => {
    try {
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
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  // Connecter Socket.io
  const connectSocket = () => {
    socketService.connect();

    // Écouter les nouvelles commandes
    socketService.on('newOrder', (order) => {
      notify.newOrder(order.orderNumber);
      setOrders(prev => [order, ...prev]);
      loadStats();
    });

    // Écouter les mises à jour de commandes
    socketService.on('orderUpdated', (updatedOrder) => {
      setOrders(prev => 
        prev.map(o => o._id === updatedOrder._id ? updatedOrder : o)
      );
      loadStats();
    });

    // Écouter les positions des livreurs
    socketService.on('delivererPositionUpdated', (data) => {
      setDeliverers(prev =>
        prev.map(d => 
          d._id === data.delivererId 
            ? { ...d, currentLocation: data.position }
            : d
        )
      );
    });
  };

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
  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    loadData();
    connectSocket();
    notify.success(`Bienvenue ${userData.name}!`);
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

  // Afficher le loader
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // Afficher la page de connexion
  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage orders={orders} setOrders={setOrders} stats={stats} t={t} />;
      case 'orders':
        return <OrdersPage orders={orders} setOrders={setOrders} t={t} />;
      case 'map':
        return <MapPage deliverers={deliverers} t={t} />;
      case 'reports':
        return <ReportsPage t={t} />;
      case 'settings':
        return <SettingsPage t={t} />;
      case 'menu':
        return <MenuManagementPage t={t} />;
      default:
        return <DashboardPage orders={orders} setOrders={setOrders} stats={stats} t={t} />;
    }
  };

  return (
    <div className={`app ${isRTL ? 'rtl' : 'ltr'}`}>
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
        t={t}
      />
      <div className="main-content">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          language={language}
          setLanguage={setLanguage}
          user={user}
          onLogout={handleLogout}
        />
        <div className="content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;