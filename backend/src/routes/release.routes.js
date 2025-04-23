const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all releases for the user
router.route('/')
  .get((req, res) => {
    res.status(200).json({ message: 'Get all releases for user' });
  })
  .post((req, res) => {
    res.status(201).json({ message: 'Create new release' });
  });

// Get latest releases with limit parameter
router.route('/latest')
  .get((req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    
    // In a real app, we'd fetch from database
    // For now, return mock data
    const mockReleases = [
      { id: 1, title: 'Pain By Ryan Jones', imagePath: '/images/music/1.png', type: 'Single' },
      { id: 2, title: 'Sunshine', imagePath: '/images/music/2.png', type: 'Single' },
      { id: 3, title: 'Dark Paradise', imagePath: '/images/music/3.png', type: 'Album' },
      { id: 4, title: 'Summer Vibes', imagePath: '/images/music/4.png', type: 'EP' },
      { id: 5, title: 'Midnight', imagePath: '/images/music/5.png', type: 'Single' },
      { id: 6, title: 'Electric Dreams', imagePath: '/images/music/1.png', type: 'Single' },
      { id: 7, title: 'Acoustic Sessions', imagePath: '/images/music/2.png', type: 'EP' },
      { id: 8, title: 'Neon Lights', imagePath: '/images/music/3.png', type: 'Single' },
    ];
    
    res.status(200).json(mockReleases.slice(0, limit));
  });

// Routes for specific release ID
router.route('/:id')
  .get((req, res) => {
    res.status(200).json({ message: `Get release ${req.params.id}` });
  })
  .put((req, res) => {
    res.status(200).json({ message: `Update release ${req.params.id}` });
  })
  .delete(authorize('superadmin', 'admin', 'artist'), (req, res) => {
    res.status(200).json({ message: `Delete release ${req.params.id}` });
  });

module.exports = router; 