const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Transaction Schema
 * Stores transaction data imported from CSV files
 */
const transactionSchema = new Schema({
  // Tracking fields
  csvUploadId: {
    type: Schema.Types.ObjectId,
    ref: 'CsvUpload',
    required: true
  },
  rowNumber: {
    type: Number,
    required: true
  },
  
  // Transaction identification
  transactionId: {
    type: String,
    required: true
  },
  
  // Content information
  title: {
    type: String,
    default: ''
  },
  artist: {
    type: String,
    default: ''
  },
  isrc: {
    type: String,
    default: ''
  },
  upc: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  
  // Service information
  serviceType: {
    type: String,
    default: ''
  },
  territory: {
    type: String,
    default: ''
  },
  transactionType: {
    type: String,
    default: 'stream'
  },
  
  // Financial data
  quantity: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  revenueUSD: {
    type: Number,
    default: 0
  },
  
  // Additional metadata
  transactionDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  },
  rawData: {
    type: Object
  }
}, { timestamps: true });

// Add indexes for faster querying
transactionSchema.index({ csvUploadId: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ artist: 1 });
transactionSchema.index({ title: 1 });
transactionSchema.index({ serviceType: 1 });
transactionSchema.index({ territory: 1 });
transactionSchema.index({ transactionDate: 1 });

// Create the model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 