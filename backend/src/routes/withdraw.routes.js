const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// User routes for withdrawal requests
router.route('/')
  .get((req, res) => {
    res.status(200).json({ message: 'Get all withdrawal requests for user' });
  })
  .post((req, res) => {
    res.status(201).json({ message: 'Create withdrawal request' });
  });

// Admin routes for managing withdrawal requests
router.route('/all')
  .get(authorize('superadmin', 'admin'), (req, res) => {
    res.status(200).json({ message: 'Get all withdrawal requests (admin)' });
  });

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({ message: `Get withdrawal request ${req.params.id}` });
  })
  .put(authorize('superadmin', 'admin'), (req, res) => {
    res.status(200).json({ message: `Update withdrawal request ${req.params.id}` });
  });

module.exports = router; 