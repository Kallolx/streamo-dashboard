const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * CSV Upload Schema
 * Stores information about uploaded CSV files and their processing status
 */
const csvUploadSchema = new Schema({
  // File information
  fileName: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  
  // Processing information
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'completed_with_errors', 'failed'],
    default: 'pending'
  },
  processedRows: {
    type: Number,
    default: 0
  },
  totalRows: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: null
  },
  
  // User information
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Indexes for faster querying
csvUploadSchema.index({ status: 1 });
csvUploadSchema.index({ uploadedBy: 1 });
csvUploadSchema.index({ createdAt: -1 });

// Create the model
const CsvUpload = mongoose.model('CsvUpload', csvUploadSchema);

module.exports = CsvUpload; 