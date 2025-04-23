const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all royalties for the current user
router.route('/')
  .get((req, res) => {
    // In a real app, we would fetch from database
    // For now, return mock data
    res.status(200).json([
      { id: 1, track: "The Overview", artist: "Steven Wilson", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%" },
      { id: 2, track: "The Overview", artist: "Linkin Park", label: "Fiction Records", revenue: "$2,800", labelSplit: "50%", artistSplit: "50%" },
      { id: 3, track: "The Overview", artist: "Steven Wilson", label: "Fiction Records", revenue: "$1,900", labelSplit: "50%", artistSplit: "50%" }
    ]);
  });

// Get royalty summary including total earnings and last statement
router.route('/summary')
  .get((req, res) => {
    // In a real app, we would calculate this from the database
    // For now, return mock data
    
    // Get user role from auth middleware to customize response
    const userRole = req.user ? req.user.role : 'artist';
    
    let mockData = {
      totalEarnings: '$8,200',
      lastStatement: '$1,500',
      pendingPayments: '$950',
      statementHistory: [
        { 
          id: 'st-001',
          period: 'Jan 2023',
          amount: '$1,500',
          status: 'paid',
          date: '2023-02-15',
          downloadUrl: '/statements/st-001.pdf'
        },
        { 
          id: 'st-002',
          period: 'Feb 2023',
          amount: '$1,800',
          status: 'paid',
          date: '2023-03-15',
          downloadUrl: '/statements/st-002.pdf'
        },
        { 
          id: 'st-003',
          period: 'Mar 2023',
          amount: '$2,100',
          status: 'paid',
          date: '2023-04-15',
          downloadUrl: '/statements/st-003.pdf'
        },
        { 
          id: 'st-004',
          period: 'Apr 2023',
          amount: '$1,850',
          status: 'paid',
          date: '2023-05-15',
          downloadUrl: '/statements/st-004.pdf'
        },
        { 
          id: 'st-005',
          period: 'May 2023',
          amount: '$950',
          status: 'pending',
          date: '2023-06-15'
        }
      ]
    };
    
    // Adjust values based on user role
    if (userRole === 'superadmin' || userRole === 'admin') {
      mockData.totalEarnings = '$206,000';
      mockData.lastStatement = '$12,500';
      mockData.pendingPayments = '$8,900';
    } else if (userRole === 'labelowner') {
      mockData.totalEarnings = '$156,000';
      mockData.lastStatement = '$8,200';
      mockData.pendingPayments = '$4,500';
    }
    
    // Ensure no null values in the response
    Object.keys(mockData).forEach(key => {
      if (key !== 'statementHistory') {
        mockData[key] = mockData[key] || '$0';
      }
    });
    
    // Ensure statementHistory is always an array
    mockData.statementHistory = mockData.statementHistory || [];
    
    res.status(200).json(mockData);
  });

// Get statement history
router.route('/statements')
  .get((req, res) => {
    // In a real app, this would come from database
    // For now, return mock data
    const statements = [
      { 
        id: 'st-001',
        period: 'Jan 2023',
        amount: '$1,500',
        status: 'paid',
        date: '2023-02-15',
        downloadUrl: '/statements/st-001.pdf'
      },
      { 
        id: 'st-002',
        period: 'Feb 2023',
        amount: '$1,800',
        status: 'paid',
        date: '2023-03-15',
        downloadUrl: '/statements/st-002.pdf'
      },
      { 
        id: 'st-003',
        period: 'Mar 2023',
        amount: '$2,100',
        status: 'paid',
        date: '2023-04-15',
        downloadUrl: '/statements/st-003.pdf'
      },
      { 
        id: 'st-004',
        period: 'Apr 2023',
        amount: '$1,850',
        status: 'paid',
        date: '2023-05-15',
        downloadUrl: '/statements/st-004.pdf'
      },
      { 
        id: 'st-005',
        period: 'May 2023',
        amount: '$950',
        status: 'pending',
        date: '2023-06-15'
      }
    ];
    
    res.status(200).json(statements);
  });

// Download a statement
router.route('/statements/:id/download')
  .get((req, res) => {
    // In a real app, we would generate a PDF or fetch from storage
    // For now, just return a success message
    res.status(200).json({ message: `Statement ${req.params.id} would be downloaded here` });
  });

// Admin routes for managing royalties
router.route('/add')
  .post(authorize('superadmin', 'admin'), (req, res) => {
    res.status(201).json({ message: 'Add royalty payment', data: req.body });
  });

module.exports = router; 