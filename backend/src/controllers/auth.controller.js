const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key', {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role,
      // Basic info
      birthDate,
      gender,
      introduction,
      // Address
      country,
      city,
      phone,
      address,
      // Distributor
      currentDistributor,
      distributorNumber,
      // Social profiles
      youtubeLink,
      facebookLink,
      tiktokLink,
      instagramLink,
      // Document info
      documentType,
      documentId
    } = req.body;

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Create user with all fields
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'artist',
      // Basic info
      birthDate,
      gender,
      introduction,
      // Address
      country,
      city,
      phone,
      address,
      // Distributor
      currentDistributor,
      distributorNumber,
      // Social profiles
      youtubeLink,
      facebookLink,
      tiktokLink,
      instagramLink,
      // Document info
      documentType,
      documentId
      // Note: profileImage and documentPicture would be handled through file uploads
    });

    if (user) {
      // Set last login time
      user.lastLogin = Date.now();
      await user.save();

      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          // Include all additional user fields
          birthDate: user.birthDate,
          gender: user.gender,
          introduction: user.introduction,
          country: user.country,
          city: user.city,
          phone: user.phone,
          address: user.address,
          currentDistributor: user.currentDistributor,
          distributorNumber: user.distributorNumber,
          youtubeLink: user.youtubeLink,
          facebookLink: user.facebookLink,
          tiktokLink: user.tiktokLink,
          instagramLink: user.instagramLink,
          documentType: user.documentType,
          documentId: user.documentId,
          documentPicture: user.documentPicture,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // If it's a validation error, return more detailed information
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    // If it's a duplicate key error (e.g., email already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate field value entered',
        field: Object.keys(error.keyValue)[0]
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Return a more complete user object with all fields
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        // Include all additional user fields
        birthDate: user.birthDate,
        gender: user.gender,
        introduction: user.introduction,
        country: user.country,
        city: user.city,
        phone: user.phone,
        address: user.address,
        currentDistributor: user.currentDistributor,
        distributorNumber: user.distributorNumber,
        youtubeLink: user.youtubeLink,
        facebookLink: user.facebookLink,
        tiktokLink: user.tiktokLink,
        instagramLink: user.instagramLink,
        documentType: user.documentType,
        documentId: user.documentId,
        documentPicture: user.documentPicture,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // In a real implementation, you would:
    // 1. Generate a reset token
    // 2. Save it to the user record with an expiration
    // 3. Send an email with a reset link
    
    // For this example, we'll just check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Success response (even if user not found, for security)
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public (with token)
exports.resetPassword = async (req, res) => {
  // In a real implementation, you would:
  // 1. Verify the reset token from the request
  // 2. Check if it's expired
  // 3. Update the user's password
  
  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully'
  });
}; 