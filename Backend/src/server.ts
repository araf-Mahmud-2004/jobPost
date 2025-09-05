import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import { errorHandler } from './middleware/errorHandler';
import jobRoutes from './routes/jobRoutes';
import adminRoutes from './routes/adminRoutes';
import applicationRoutes from './routes/applicationRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');

const startServer = async () => {
  try {
    // Set mongoose options
    const mongooseOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ Successfully connected to MongoDB');
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.error(err.name, err);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB');
    console.error('Error details:', error);
    console.error('MongoDB URI used:', MONGODB_URI);
    process.exit(1);
  }
};

startServer();

export default app;
