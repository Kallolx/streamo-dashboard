const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authorize } = require('../middleware/auth');

// Get all transactions with pagination and filtering
router.get(
  '/',
  authorize(),
  transactionController.getTransactions
);

// Get a summary of transactions for analytics
// This specific route must come before the parameterized route
router.get(
  '/summary',
  authorize(),
  transactionController.getTransactionSummary
);

// Get a transaction by ID
router.get(
  '/:id',
  authorize(),
  transactionController.getTransactionById
);

// Delete a transaction by ID
router.delete(
  '/:id',
  authorize(['admin', 'superadmin']),
  transactionController.deleteTransaction
);

module.exports = router; 