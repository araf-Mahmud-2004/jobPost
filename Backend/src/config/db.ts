import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';

if (!MONGODB_URI) {
  throw new AppError(
    'Please define the MONGODB_URI environment variable inside .env',
    500
  );
}


/**
 * Establishes a connection to MongoDB using Mongoose
 * @returns {Promise<typeof mongoose>}
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  console.log('Creating new database connection to:', MONGODB_URI);
  const opts: mongoose.ConnectOptions = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout
  };

  try {
    const conn = await mongoose.connect(MONGODB_URI, opts);
    if (!conn) {
      throw new Error('Failed to establish database connection');
    }
    console.log('Database connected successfully');
    
    // Log all collections
    if (!conn.connection.db) {
      throw new Error('Database instance is not available');
    }
    
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Log sample data from applications collection if it exists
    if (collections.some(c => c.name === 'applications')) {
      const apps = await db.collection('applications').find({}).limit(3).toArray();
      console.log('Sample applications:', JSON.stringify(apps, null, 2));
    } else {
      console.log('No applications collection found');
    }
    
    return conn;
  } catch (e) {
    console.error('Database connection error:', e);
    if (e instanceof Error) {
      throw new AppError(`Database connection failed: ${e.message}`, 500);
    }
    throw new AppError('Database connection failed', 500);
  }
};

export default connectDB;
