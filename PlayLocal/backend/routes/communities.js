const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const { protect } = require('../middleware/auth');

// @route   GET /api/communities
// @desc    Get all communities
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const communities = await Community.find({})
      .populate('organizer', 'name email profilePhoto')
      .populate('members', 'name email profilePhoto');
    res.json(communities);
  } catch (error) {
    console.error('Get Communities Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/communities/:id
// @desc    Get community by ID
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('organizer', 'name email profilePhoto')
      .populate('members', 'name email profilePhoto location');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    console.error('Get Community Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/communities
// @desc    Create a community
// @access  Protected
router.post('/', protect, async (req, res) => {
  const { name, description, linkedSociety, recurringSessionSchedule } = req.body;

  try {
    const community = await Community.create({
      name,
      description,
      organizer: req.user._id,
      members: [req.user._id],
      linkedSociety: linkedSociety || '',
      recurringSessionSchedule: recurringSessionSchedule || '',
      isVerified: false // Admin can verify it later
    });

    const populatedCommunity = await Community.findById(community._id)
      .populate('organizer', 'name email profilePhoto')
      .populate('members', 'name email profilePhoto');

    res.status(201).json(populatedCommunity);
  } catch (error) {
    console.error('Create Community Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/communities/:id/join
// @desc    Join a community group
// @access  Protected
router.post('/:id/join', protect, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is already a member
    if (community.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this community' });
    }

    community.members.push(req.user._id);
    await community.save();

    const populatedCommunity = await Community.findById(community._id)
      .populate('organizer', 'name email profilePhoto')
      .populate('members', 'name email profilePhoto');

    res.json(populatedCommunity);
  } catch (error) {
    console.error('Join Community Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/communities/:id/leave
// @desc    Leave a community group
// @access  Protected
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is member
    const memberIndex = community.members.indexOf(req.user._id);
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Not a member of this community' });
    }

    // Organizer cannot leave their own community
    if (community.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Organizer cannot leave their own community. Delete it instead.' });
    }

    community.members.splice(memberIndex, 1);
    await community.save();

    const populatedCommunity = await Community.findById(community._id)
      .populate('organizer', 'name email profilePhoto')
      .populate('members', 'name email profilePhoto');

    res.json(populatedCommunity);
  } catch (error) {
    console.error('Leave Community Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
