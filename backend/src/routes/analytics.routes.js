const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for analytics
router.route('/dashboard')
  .get((req, res) => {
    // In a real app, we'd fetch real data from the database
    // For now, return mock data with proper defaults
    
    // Get user role to customize response
    const userRole = req.user ? req.user.role : 'artist';
    
    // Default values
    let dashboardData = {
      totalEarnings: '$0',
      lastStatement: '$0',
      releases: 0,
      streams: 0,
      revenue: 0
    };
    
    // Set values based on role
    if (userRole === 'superadmin' || userRole === 'admin') {
      dashboardData = {
        totalEarnings: '$206,000',
        lastStatement: '$12,500',
        releases: 120,
        streams: 4500000,
        revenue: 125000
      };
    } else if (userRole === 'labelowner') {
      dashboardData = {
        totalEarnings: '$156,000',
        lastStatement: '$8,200',
        releases: 85,
        streams: 3200000,
        revenue: 86000
      };
    } else { // artist
      dashboardData = {
        totalEarnings: '$8,200',
        lastStatement: '$1,500',
        releases: 12,
        streams: 450000,
        revenue: 8200
      };
    }
    
    // Ensure no null values
    Object.keys(dashboardData).forEach(key => {
      if (typeof dashboardData[key] === 'string') {
        dashboardData[key] = dashboardData[key] || '$0';
      } else if (typeof dashboardData[key] === 'number') {
        dashboardData[key] = dashboardData[key] || 0;
      }
    });
    
    res.status(200).json(dashboardData);
  });

router.route('/streams')
  .get((req, res) => {
    res.status(200).json({
      total: 4500000 || 0,
      lastMonth: 120000 || 0,
      growth: 8.5 || 0,
      platforms: {
        spotify: 55 || 0,
        appleMusic: 25 || 0,
        youtube: 15 || 0,
        other: 5 || 0
      }
    });
  });

router.route('/revenue')
  .get((req, res) => {
    res.status(200).json({
      total: '$125,000' || '$0',
      lastMonth: '$12,500' || '$0',
      growth: 7.2 || 0,
      sources: {
        streaming: 80 || 0,
        downloads: 15 || 0,
        licensing: 5 || 0
      }
    });
  });

router.route('/releases/:id')
  .get((req, res) => {
    res.status(200).json({
      id: req.params.id,
      title: 'Pain By Ryan Jones' || 'Unknown',
      streams: 120000 || 0,
      revenue: '$3,600' || '$0',
      platforms: {
        spotify: 60 || 0,
        appleMusic: 28 || 0,
        youtube: 12 || 0
      }
    });
  });

router.route('/platform')
  .get((req, res) => {
    res.status(200).json({
      platforms: [
        { name: 'Spotify', value: 55 || 0, color: '#1DB954' },
        { name: 'Apple Music', value: 25 || 0, color: '#FC3C44' },
        { name: 'YouTube Music', value: 15 || 0, color: '#FF0000' },
        { name: 'Others', value: 5 || 0, color: '#8C8C8C' }
      ]
    });
  });

module.exports = router; 