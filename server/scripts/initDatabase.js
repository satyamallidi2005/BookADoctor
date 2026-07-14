require('dotenv').config();
const mongoose = require('mongoose');

// Import and register all models
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const MedicalReport = require('../models/MedicalReport');
const Notification = require('../models/Notification');
const Review = require('../models/Review');

/**
 * Initializes database structures: registers models, syncs indexes, and seeds admin details.
 */
const initDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('Error: MONGO_URI environment variable is not defined in server/.env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connection established.');

    const models = [
      User, 
      DoctorProfile, 
      Appointment, 
      MedicalReport, 
      Notification, 
      Review
    ];

    console.log('Synchronizing database indexes...');
    for (const model of models) {
      // syncIndexes drops any outdated/unlisted indexes and builds newly declared ones
      await model.syncIndexes();
      console.log(`- Indexes synchronized for collection: ${model.collection.name}`);
    }

    console.log('Checking for default System Admin account...');
    const adminUser = await User.findOne({ email: 'admin@bookdoctor.com' });

    if (!adminUser) {
      console.log('Admin account does not exist. Creating default admin...');
      await User.create({
        name: 'System Admin',
        email: 'admin@bookdoctor.com',
        password: 'Admin@123',
        phone: '1234567890',
        gender: 'male',
        role: 'admin',
        isActive: true,
      });
      console.log('Default admin seeded: admin@bookdoctor.com / Admin@123');
    } else {
      console.log('Default admin account already exists. Seeding skipped.');
    }

    console.log('Database initialization completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Database initialization failed: ${error.message}`);
    process.exit(1);
  }
};

initDatabase();
