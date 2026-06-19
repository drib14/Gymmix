require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const workoutPlanRoutes = require('./routes/workoutPlan.routes');
const workoutLogRoutes = require('./routes/workoutLog.routes');
const nutritionRoutes = require('./routes/nutrition.routes');
const bodyMetricRoutes = require('./routes/bodyMetric.routes');
const goalRoutes = require('./routes/goal.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const blogRoutes = require('./routes/blog.routes');
const notificationRoutes = require('./routes/notification.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Connect to MongoDB
connectDB();

// ── Global Middleware ──────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Skip rate limiter for webhook
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(generalLimiter);

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '⚡ Gymmix API is running', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/workout-logs', workoutLogRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/body-metrics', bodyMetricRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);

// ── Error Handling ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n⚡ Gymmix Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Socket.IO: Ready`);
  console.log(`🗄️  Database: Gymmix\n`);
});

module.exports = app;
