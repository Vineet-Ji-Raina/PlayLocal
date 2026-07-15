const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;

    if (dbUri) {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(dbUri);
      console.log('MongoDB Connected successfully to remote/local instance.');
    } else {
      console.log('No MONGODB_URI found in environment. Spinning up Mongo Memory Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      
      // Configure memory server to reuse or create new instance
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      console.log(`Mongo Memory Server started successfully.`);
      await mongoose.connect(mongoUri);
      console.log('Connected to virtual MongoDB in-memory database.');
      
      // Keep track of instance for graceful shutdown
      mongoose.mongoServerInstance = mongoServer;
    }
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
