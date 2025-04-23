const express = require('express');
const { getUsers, getUser, updateUser, deleteUser, updateProfile, whoami } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// User profile routes
router.route('/profile').put(updateProfile);
router.route('/whoami').get(whoami);

// Admin only routes
router.route('/')
  .get(authorize('superadmin', 'admin'), getUsers);

router.route('/:id')
  .get(authorize('superadmin', 'admin'), getUser)
  .put(authorize('superadmin', 'admin'), updateUser)
  .delete(authorize('superadmin'), deleteUser);

module.exports = router; 