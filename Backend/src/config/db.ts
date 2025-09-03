import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';

if (!MONGODB_URI) {
  throw new AppError(
    'Please define the MONGODB_URI environment variable inside .env',
    500
  );
}

// Extend NodeJS global type with mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

// Cached connection to avoid multiple connections in development
const globalWithMongoose = global as typeof globalThis & {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

/**
 * Establishes a connection to MongoDB using Mongoose
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected successfully');
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    if (error instanceof Error) {
      console.error('MongoDB connection error:', error.message);
      throw new AppError('Database connection failed', 500, { error: error.message });
    }
    throw new AppError('Database connection failed', 500);
  }
}

export default connectDB;
