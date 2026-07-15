const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const seedDatabase = require('./scripts/seed');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');
const requestRoutes = require('./routes/requests');
const communityRoutes = require('./routes/communities');
const adminRoutes = require('./routes/admin');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Main status endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Local Sports & Games Partner Finder API is running...' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  // Connect to DB
  await connectDB();

  // Check if games collection is empty. If so, seed database automatically.
  const Game = require('./models/Game');
  try {
    const gameCount = await Game.countDocuments({});
    if (gameCount === 0) {
      console.log('No games found in database. Running auto-seeding...');
      await seedDatabase();
    } else {
      console.log('Database already has seeded data.');
    }
  } catch (error) {
    console.error('Check game collection failed, skipping auto-seed:', error.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down server gracefully...');
    server.close(async () => {
      console.log('HTTP server closed.');
      await mongoose.disconnect();
      console.log('MongoDB disconnected.');
      
      if (mongoose.mongoServerInstance) {
        await mongoose.mongoServerInstance.stop();
        console.log('Virtual MongoDB memory server stopped.');
      }
      
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
