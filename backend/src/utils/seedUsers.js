const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
require('dotenv').config();

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define initial users
const initialUsers = [
  {
    name: 'Kallol',
    email: 'khksnkallol@gmail.com',
    password: '123456',
    role: 'superadmin',
    isActive: true
  },
  {
    name: 'Tangila',
    email: 'khksnkallol2@gmail.com',
    password: '12345678',
    role: 'admin',
    isActive: true
  }
];

// Function to seed users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create users with hashed passwords
    const userPromises = initialUsers.map(async (userData) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      return new User({
        ...userData,
        password: hashedPassword
      });
    });

    const users = await Promise.all(userPromises);
    await User.insertMany(users);
    
    console.log('Initial users seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers(); 