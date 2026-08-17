const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const dns = require("node:dns")
dns.setServers(['8.8.8.8', '8.8.4.4'])

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const initCronJobs = require('./jobs/cronManager');
initCronJobs();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : /^http:\/\/localhost:\d+$/,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/recurring', require('./routes/recurringRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/insights', require('./routes/insightRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/shared-wallets', require('./routes/sharedWalletRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// Error handler (must be after routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
