const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Game = require('../models/Game');
const Location = require('../models/Location');
const PlayRequest = require('../models/PlayRequest');
const Community = require('../models/Community');
const Report = require('../models/Report');

const gamesData = [
  { name: 'Chess', category: 'indoor', description: 'Classic board game of strategy and tactics.', icon: 'crown' },
  { name: 'Carrom', category: 'indoor', description: 'Strike and pocket table game popular in South Asia.', icon: 'disc' },
  { name: 'Table Tennis', category: 'indoor', description: 'Fast-paced table sport.', icon: 'tablets' },
  { name: 'Badminton', category: 'outdoor', description: 'Racket sport played with shuttles.', icon: 'swords' },
  { name: 'Cards (Poker/Rummy)', category: 'indoor', description: 'Social skill card games.', icon: 'spade' },
  { name: 'Football', category: 'outdoor', description: 'Outdoor Turf 5-a-side or 7-a-side matches.', icon: 'trophy' }
];

const seedDatabase = async () => {
  try {
    // 1. Clear Database
    await User.deleteMany({});
    await Game.deleteMany({});
    await Location.deleteMany({});
    await PlayRequest.deleteMany({});
    await Community.deleteMany({});
    await Report.deleteMany({});
    console.log('Database cleared.');

    // 2. Insert Games
    const games = await Game.insertMany(gamesData);
    console.log('Games seeded:', games.length);

    // Map game names to IDs
    const gameMap = {};
    games.forEach(g => { gameMap[g.name] = g._id; });

    // 3. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);

    const usersData = [
      {
        name: 'Rohan Sharma',
        email: 'rohan@gmail.com',
        password: hashedPassword,
        location: {
          type: 'Point',
          coordinates: [72.8258, 19.0596], // Bandra West, Mumbai
          address: 'Bandra West, Mumbai, Maharashtra 400050'
        },
        preferredGames: [gameMap['Chess'], gameMap['Badminton']],
        skillLevel: 'intermediate',
        availability: [
          { day: 'Saturday', timeSlots: ['16:00-19:00'] },
          { day: 'Sunday', timeSlots: ['09:00-12:00', '16:00-19:00'] }
        ],
        profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        bio: 'Avid Chess player and badminton enthusiast. Looking for weekend partners near Bandra!',
        role: 'user'
      },
      {
        name: 'Priya Patel',
        email: 'priya@gmail.com',
        password: hashedPassword,
        location: {
          type: 'Point',
          coordinates: [72.8338, 19.0689], // Khar West (approx 1.2 km away)
          address: 'Khar West, Mumbai, Maharashtra 400052'
        },
        preferredGames: [gameMap['Chess'], gameMap['Table Tennis']],
        skillLevel: 'beginner',
        availability: [
          { day: 'Monday', timeSlots: ['18:00-20:00'] },
          { day: 'Wednesday', timeSlots: ['18:00-20:00'] }
        ],
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        bio: 'Picked up chess recently. Looking to play casual games on weekday evenings.',
        role: 'user'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@gmail.com',
        password: hashedPassword,
        location: {
          type: 'Point',
          coordinates: [72.8430, 19.0813], // Santacruz West (approx 3 km away)
          address: 'Santacruz West, Mumbai, Maharashtra 400054'
        },
        preferredGames: [gameMap['Carrom'], gameMap['Badminton']],
        skillLevel: 'advanced',
        availability: [
          { day: 'Saturday', timeSlots: ['07:00-10:00'] },
          { day: 'Sunday', timeSlots: ['07:00-10:00'] }
        ],
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        bio: 'Looking for fast-paced smash Badminton matches. Available for morning sessions.',
        role: 'user'
      },
      {
        name: 'Aisha Khan',
        email: 'aisha@gmail.com',
        password: hashedPassword,
        location: {
          type: 'Point',
          coordinates: [72.8267, 19.1025], // Juhu (approx 4.8 km away)
          address: 'Juhu, Mumbai, Maharashtra 400049'
        },
        preferredGames: [gameMap['Table Tennis'], gameMap['Badminton'], gameMap['Chess']],
        skillLevel: 'intermediate',
        availability: [
          { day: 'Friday', timeSlots: ['17:00-20:00'] },
          { day: 'Saturday', timeSlots: ['10:00-14:00'] }
        ],
        profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        bio: 'Let us connect for a game of Table Tennis or Badminton. I have my own rackets.',
        role: 'user'
      },
      {
        name: 'Kabir Malhotra',
        email: 'kabir@gmail.com',
        password: hashedPassword,
        location: {
          type: 'Point',
          coordinates: [72.8984, 19.0624], // Chembur (approx 8.5 km away)
          address: 'Chembur, Mumbai, Maharashtra 400071'
        },
        preferredGames: [gameMap['Badminton'], gameMap['Football']],
        skillLevel: 'advanced',
        availability: [
          { day: 'Tuesday', timeSlots: ['20:00-22:00'] },
          { day: 'Thursday', timeSlots: ['20:00-22:00'] }
        ],
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        bio: 'Turf Football regular. Always up for a match.',
        role: 'user'
      },
      // Admin User
      {
        name: 'Platform Admin',
        email: 'admin@partnerfinder.com',
        password: adminPassword,
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760], // Mumbai Center
          address: 'Central Admin Office, Mumbai'
        },
        preferredGames: [],
        skillLevel: 'intermediate',
        availability: [],
        profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
        bio: 'System Administrator.',
        role: 'admin'
      }
    ];

    const users = await User.insertMany(usersData);
    console.log('Users seeded:', users.length);

    const rohan = users.find(u => u.email === 'rohan@gmail.com');
    const priya = users.find(u => u.email === 'priya@gmail.com');
    const vikram = users.find(u => u.email === 'vikram@gmail.com');
    const aisha = users.find(u => u.email === 'aisha@gmail.com');
    const kabir = users.find(u => u.email === 'kabir@gmail.com');

    // 4. Create Locations (Venues)
    const locationsData = [
      {
        type: 'clubhouse',
        address: 'Seaside Society Clubhouse, Bandra West, Mumbai',
        coordinates: { type: 'Point', coordinates: [72.8250, 19.0600] }
      },
      {
        type: 'ground',
        address: 'Juhu Sports Association Ground, Juhu, Mumbai',
        coordinates: { type: 'Point', coordinates: [72.8280, 19.1030] }
      }
    ];

    const locations = await Location.insertMany(locationsData);
    console.log('Locations seeded:', locations.length);

    // 5. Create Communities
    const communityData = [
      {
        name: 'Bandra Board Gamers',
        description: 'A society group for indoor board games like Chess, Carrom, and Cards.',
        organizer: rohan._id,
        members: [rohan._id, priya._id, vikram._id],
        linkedSociety: 'Seaside Apartments, Bandra',
        recurringSessionSchedule: 'Sundays at 5:00 PM',
        isVerified: true
      },
      {
        name: 'Juhu Shuttle Club',
        description: 'Weekly badminton meetups at local clubhouses and grounds.',
        organizer: aisha._id,
        members: [aisha._id, rohan._id, vikram._id],
        linkedSociety: 'Juhu Sports Center',
        recurringSessionSchedule: 'Saturdays at 8:00 AM',
        isVerified: false
      }
    ];

    const communities = await Community.insertMany(communityData);
    console.log('Communities seeded:', communities.length);

    // Link community to Location
    locations[0].linkedCommunity = communities[0]._id;
    await locations[0].save();
    locations[1].linkedCommunity = communities[1]._id;
    await locations[1].save();

    // 6. Create PlayRequests
    const requestsData = [
      // Pending request
      {
        sender: rohan._id,
        receiver: priya._id,
        game: gameMap['Chess'],
        proposedLocation: {
          type: 'clubhouse',
          address: 'Seaside Society Clubhouse, Bandra West, Mumbai',
          coordinates: [72.8250, 19.0600]
        },
        proposedTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        status: 'pending'
      },
      // Accepted request
      {
        sender: vikram._id,
        receiver: rohan._id,
        game: gameMap['Badminton'],
        proposedLocation: {
          type: 'ground',
          address: 'Juhu Sports Association Ground, Juhu, Mumbai',
          coordinates: [72.8280, 19.1030]
        },
        proposedTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'accepted'
      },
      // Completed request
      {
        sender: aisha._id,
        receiver: rohan._id,
        game: gameMap['Chess'],
        proposedLocation: {
          type: 'home',
          address: 'Rohan\'s Place, Bandra West',
          coordinates: [72.8258, 19.0596]
        },
        proposedTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        status: 'completed'
      }
    ];

    const requests = await PlayRequest.insertMany(requestsData);
    console.log('Play requests seeded:', requests.length);

    // Link request IDs to matchHistory
    rohan.matchHistory.push(requests[1]._id, requests[2]._id);
    vikram.matchHistory.push(requests[1]._id);
    aisha.matchHistory.push(requests[2]._id);
    await rohan.save();
    await vikram.save();
    await aisha.save();

    // 7. Create a Sample Report
    const reportData = {
      reportedBy: aisha._id,
      targetUser: kabir._id,
      reason: 'User coordinates are too far and keeps sending duplicate tournament adverts.',
      status: 'pending'
    };
    await Report.create(reportData);
    console.log('Sample report seeded.');

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    throw error;
  }
};

// Check if run directly from command line
if (require.main === module) {
  const connectDB = require('../config/db');
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/partner_finder')
    .then(async () => {
      console.log('Connected to database for standalone seeding...');
      await seedDatabase();
      mongoose.disconnect();
      process.exit(0);
    })
    .catch(err => {
      console.error('Failed to connect to database for seeding:', err.message);
      process.exit(1);
    });
}

module.exports = seedDatabase;
