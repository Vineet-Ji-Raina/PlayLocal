const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/search
// @desc    Search for nearby players based on filters
// @access  Protected
router.get('/search', protect, async (req, res) => {
  const { game, lat, lng, radius, availability, skill } = req.query;

  try {
    const query = {
      _id: { $ne: req.user._id }, // Exclude current user
      role: 'user' // Don't match admins
    };

    // 1. Geospatial search within a circle radius
    if (lat && lng && radius) {
      const radiusInRadians = parseFloat(radius) / 6378.1; // km to radians
      query['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
        }
      };
    }

    // 2. Filter by game preference
    if (game) {
      query.preferredGames = game;
    }

    // 3. Filter by skill level
    if (skill) {
      query.skillLevel = skill;
    }

    // 4. Filter by availability day
    if (availability) {
      query['availability.day'] = availability;
    }

    const users = await User.find(query)
      .populate('preferredGames')
      .select('-password -matchHistory');

    res.json(users);
  } catch (error) {
    console.error('Search Users Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('preferredGames')
      .populate({
        path: 'matchHistory',
        populate: [
          { path: 'sender', select: 'name email profilePhoto' },
          { path: 'receiver', select: 'name email profilePhoto' },
          { path: 'game', select: 'name category' }
        ]
      })
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Protected
router.put('/:id', protect, async (req, res) => {
  try {
    // Only allow updating own profile (or admin)
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.skillLevel = req.body.skillLevel || user.skillLevel;
    user.preferredGames = req.body.preferredGames || user.preferredGames;
    user.availability = req.body.availability || user.availability;
    user.profilePhoto = req.body.profilePhoto !== undefined ? req.body.profilePhoto : user.profilePhoto;

    if (req.body.location) {
      user.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates || user.location.coordinates,
        address: req.body.location.address || user.location.address
      };
    }

    // Allow admins to update user role
    if (req.user.role === 'admin' && req.body.role) {
      user.role = req.body.role;
    }

    const updatedUser = await user.save();
    
    // Populate before returning
    const populatedUser = await User.findById(updatedUser._id)
      .populate('preferredGames')
      .select('-password');

    res.json(populatedUser);
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
