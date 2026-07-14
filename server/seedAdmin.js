require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI environmental variable is not set in .env.');
      process.exit(1);
    }

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected for admin seeding.');

    // Check if admin already exists (either by email or by admin role)
    const adminExists = await User.findOne({ email: 'admin@bookdoctor.com' });

    if (adminExists) {
      console.log('Admin account already exists (admin@bookdoctor.com). Seeding skipped.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create the Admin user
    // Note: phone and gender are required by our model schema, so we populate them.
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@bookdoctor.com',
      password: 'Admin@123',
      phone: '1234567890',
      gender: 'male',
      role: 'admin',
      isActive: true,
    });

    if (adminUser) {
      console.log('------------------------------------------------');
      console.log('Admin user seeded successfully!');
      console.log('Email: admin@bookdoctor.com');
      console.log('Password: Admin@123');
      console.log('------------------------------------------------');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
