const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ==========================================
// 1. INSTANT HEALTH CHECK (Must be first)
// ==========================================
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', up: true }));
app.get('/', (req, res) => res.status(200).send('99Sellers API V8 - Online'));

// ==========================================
// 2. START LISTENING IMMEDIATELY
// ==========================================
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n🚀 [V8_SERVER] BOOTED INSTANTLY ON PORT ${PORT}`);
  console.log(`🌍 [V8_SERVER] HEALTH CHECK URL: https://99sellers-production-c7bd.up.railway.app/health`);

  // Heartbeat to keep process alive and logs moving
  setInterval(() => {
    console.log(`[ALIVE] ${new Date().toISOString()} - Event Loop Active`);
  }, 20000);

  // ==========================================
  // 3. BACKGROUND HEAVY LOADING
  // ==========================================
  try {
    console.log('[INIT] Loading models and routes in background...');

    // Basic Middleware
    app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    app.use(cors({ origin: true, credentials: true }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Serve uploaded files statically
    const path = require('path');
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Load Database & Models
    const db = require('./models');
    const { sequelize } = db;

    console.log('[DB] Connecting...');
    await sequelize.authenticate();
    console.log('[DB] Connected.');

    // Load Routes Lazy
    app.use('/api', require('./routes/auth'));
    app.use('/api/properties', require('./routes/properties'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/admin', require('./routes/admin'));
    app.use('/api/content', require('./routes/content'));
    app.use('/api/billing', require('./routes/billing'));
    app.use('/api/subscription', require('./routes/subscription'));
    app.use('/api/payment', require('./routes/paymentRoutes'));
    app.use('/api/feedback', require('./routes/feedback'));
    app.use('/api/saved-searches', require('./routes/savedSearches'));
    app.use('/api/saved-properties', require('./routes/savedProperties'));
    app.use('/api/export', require('./routes/export'));

    app.get('/api/test', (req, res) => res.json({ success: true, status: 'READY' }));

    // Sync & Seed in background
    await sequelize.sync({ alter: true });
    console.log('[DB] Models Synced.');
    const { seedData } = require('./services/seedService');
    await seedData();
    console.log('[DB] Seeding Finished. SYSTEM READY.');

  } catch (err) {
    console.error('[CRITICAL_INIT_ERROR]', err.message);
  }
});

// Global Error Prevents
process.on('uncaughtException', (err) => console.error('[UNCAUGHT]', err));
process.on('unhandledRejection', (reason) => console.error('[UNHANDLED]', reason));

module.exports = app;