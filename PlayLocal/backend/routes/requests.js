const express = require('express');
const router = express.Router();
const PlayRequest = require('../models/PlayRequest');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/requests
// @desc    Send a play request
// @access  Protected
router.post('/', protect, async (req, res) => {
  const { receiver, game, proposedLocation, proposedTime } = req.body;

  try {
    const playRequest = await PlayRequest.create({
      sender: req.user._id,
      receiver,
      game,
      proposedLocation,
      proposedTime,
      status: 'pending'
    });

    const populatedRequest = await PlayRequest.findById(playRequest._id)
      .populate('sender', 'name email profilePhoto')
      .populate('receiver', 'name email profilePhoto')
      .populate('game', 'name category');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Create Request Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/requests/:id
// @desc    Accept/Decline/Complete play request
// @access  Protected
router.put('/:id', protect, async (req, res) => {
  const { status } = req.body; // 'accepted', 'declined', 'completed'

  try {
    const playRequest = await PlayRequest.findById(req.params.id);

    if (!playRequest) {
      return res.status(404).json({ message: 'Play request not found' });
    }

    const isReceiver = playRequest.receiver.toString() === req.user._id.toString();
    const isSender = playRequest.sender.toString() === req.user._id.toString();

    if (status === 'accepted' || status === 'declined') {
      if (!isReceiver && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only the recipient can accept or decline play requests' });
      }
    }

    if (status === 'completed') {
      if (!isSender && !isReceiver && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only participants can mark requests as completed' });
      }
    }

    playRequest.status = status;
    await playRequest.save();

    // Link in User matchHistory if accepted or completed
    if (status === 'accepted' || status === 'completed') {
      await User.findByIdAndUpdate(playRequest.sender, { $addToSet: { matchHistory: playRequest._id } });
      await User.findByIdAndUpdate(playRequest.receiver, { $addToSet: { matchHistory: playRequest._id } });
    }

    const populatedRequest = await PlayRequest.findById(playRequest._id)
      .populate('sender', 'name email profilePhoto')
      .populate('receiver', 'name email profilePhoto')
      .populate('game', 'name category');

    res.json(populatedRequest);
  } catch (error) {
    console.error('Update Request Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/requests/history/:userId
// @desc    Get match/play request history for a user
// @access  Protected
router.get('/history/:userId', protect, async (req, res) => {
  try {
    if (req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view another user\'s history' });
    }

    const requests = await PlayRequest.find({
      $or: [
        { sender: req.params.userId },
        { receiver: req.params.userId }
      ]
    })
      .populate('sender', 'name email profilePhoto location')
      .populate('receiver', 'name email profilePhoto location')
      .populate('game', 'name category icon')
      .sort({ updatedAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get Request History Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
