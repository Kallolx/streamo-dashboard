const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const profileUploadDir = path.join(__dirname, '../../public/uploads/profiles');
const documentUploadDir = path.join(__dirname, '../../public/uploads/documents');

if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

if (!fs.existsSync(documentUploadDir)) {
  fs.mkdirSync(documentUploadDir, { recursive: true });
}

// Configure storage for profile pictures
const profileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, profileUploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for document pictures
const documentStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, documentUploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'document-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Create upload middleware instances
const uploadProfileImage = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
}).single('profileImage');

const uploadDocumentImage = multer({
  storage: documentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
}).single('documentPicture');

// Middleware to handle profile image upload
exports.profileImageUpload = (req, res, next) => {
  uploadProfileImage(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Multer error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // If file was uploaded successfully, add the path to req.body
    if (req.file) {
      // Create a URL path for the uploaded file
      req.body.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    next();
  });
};

// Middleware to handle document image upload
exports.documentImageUpload = (req, res, next) => {
  uploadDocumentImage(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Multer error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // If file was uploaded successfully, add the path to req.body
    if (req.file) {
      // Create a URL path for the uploaded file
      req.body.documentPicture = `/uploads/documents/${req.file.filename}`;
    }
    
    next();
  });
}; 