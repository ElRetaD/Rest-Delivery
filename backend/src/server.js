// backend/src/server.js

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import { initializeSocket } from './socket/socketHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import delivererRoutes from './routes/delivererRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

// Charger les variables d'environnement
dotenv.config();

console.log('🔧 Configuration chargée');
console.log('📍 PORT:', process.env.PORT);
console.log('📍 MONGODB_URI:', process.env.MONGODB_URI);

// Créer l'application Express
const app = express();
const httpServer = createServer(app);

// Configuration CORS TRÈS PERMISSIVE pour le développement
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware pour logger toutes les requêtes
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Initialiser Socket.io
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Initialiser le gestionnaire Socket.io
initializeSocket(io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ajouter io à req pour l'utiliser dans les controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliverers', delivererRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/stats', statsRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Delivery API',
    version: '1.0.0',
  });
});

// Route de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});

// Test route pour vérifier CORS
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS fonctionne!',
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  console.log('❌ Route non trouvée:', req.url);
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Connexion à MongoDB et démarrage du serveur
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connexion à MongoDB
    await connectDB();

    // Démarrer le serveur
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 ========================================`);
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🔌 Socket.io ready for connections`);
      console.log(`🌍 CORS enabled for: http://localhost:5173`);
      console.log(`🚀 ========================================\n`);
      console.log(`✅ Ready to accept requests!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  httpServer.close(() => process.exit(1));
});

// Démarrer le serveur
startServer();

export default app;