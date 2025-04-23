const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const releaseRoutes = require('./routes/release.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const royaltyRoutes = require('./routes/royalty.routes');
const withdrawRoutes = require('./routes/withdraw.routes');

// Create Express app
const app = express();

// Configure CORS for production and development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, /\.vercel\.app$/] // Allow Vercel domains and specified frontend URL
    : 'http://localhost:3000', // Local development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Custom logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Set port
const PORT = process.env.PORT || 5000;

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://webbyte:streamo@streamo-dashboard.6jdxmuo.mongodb.net/?retryWrites=true&w=majority&appName=streamo-dashboard";

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/releases', releaseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/royalties', royaltyRoutes);
app.use('/api/withdrawals', withdrawRoutes);

// Root route for API health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Not found - ${req.originalUrl}` 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 