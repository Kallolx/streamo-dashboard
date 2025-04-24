const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csvController = require('../controllers/csv.controller');
const { authorize } = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadDirectory = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow CSV files
const fileFilter = (req, file, cb) => {
  // Check if the file is a CSV by MIME type or extension
  if (
    file.mimetype === 'text/csv' ||
    file.originalname.toLowerCase().endsWith('.csv')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Routes

// Upload a CSV file - only for admins and super admins
router.post(
  '/upload',
  authorize(['admin', 'superadmin']),
  upload.single('file'),
  csvController.uploadCsv
);

// Get CSV upload status
router.get(
  '/:id/status',
  authorize(),
  csvController.getCsvStatus
);

// Get all CSV uploads with pagination
router.get(
  '/',
  authorize(),
  csvController.getCsvUploads
);

// Delete a CSV upload
router.delete(
  '/:id',
  authorize(['admin', 'superadmin']),
  csvController.deleteCsvUpload
);

module.exports = router; 