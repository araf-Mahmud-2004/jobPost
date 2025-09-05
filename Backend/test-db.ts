import mongoose from 'mongoose';

const testConnection = async () => {
  // Replace with your actual password
  const MONGODB_URI = 'mongodb+srv://jobp5298_db_user:YOUR_PASSWORD@clusterbatt.il9feyb.mongodb.net/job-portal?retryWrites=true&w=majority';
  
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('Using connection string:', MONGODB_URI.replace(/:([^:@]+)@/, ':***@'));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB');
    
    // Get the database instance
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📂 Available collections:');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    // Show document count in each collection
    console.log('\n📊 Document counts:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to connect to MongoDB');
    console.error('Error details:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

// Run the test
testConnection();