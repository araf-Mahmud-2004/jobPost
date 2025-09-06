import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/userModel';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Admin credentials
    const adminData = {
      name: process.argv[2] || 'Admin User',
      email: process.argv[3] || 'admin@jobportal.com',
      password: process.argv[4] || 'Admin@123',
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const adminUser = await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true, // Admin is automatically verified
    });

    console.log('Admin user created successfully:');
    console.log({
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the script
createAdminUser();
