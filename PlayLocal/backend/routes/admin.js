const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PlayRequest = require('../models/PlayRequest');
const Game = require('../models/Game');
const Community = require('../models/Community');
const Report = require('../models/Report');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).populate('preferredGames').select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Admin Get Users Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin account' });
    }
    
    // Remove related requests
    await PlayRequest.deleteMany({
      $or: [{ sender: req.params.id }, { receiver: req.params.id }]
    });

    // Remove community memberships
    await Community.updateMany(
      { members: req.params.id },
      { $pull: { members: req.params.id } }
    );

    // Delete community if user is organizer
    await Community.deleteMany({ organizer: req.params.id });

    await user.deleteOne();
    res.json({ message: 'User and all related records deleted successfully' });
  } catch (error) {
    console.error('Admin Delete User Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/communities/:id/verify
// @desc    Verify or unverify a community
// @access  Private/Admin
router.put('/communities/:id/verify', protect, adminOnly, async (req, res) => {
  const { isVerified } = req.body;
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    community.isVerified = isVerified;
    await community.save();
    res.json(community);
  } catch (error) {
    console.error('Admin Verify Community Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get platform metrics and KPIs
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRequests = await PlayRequest.countDocuments({});
    
    // Active requests (pending or accepted)
    const activeRequests = await PlayRequest.countDocuments({ status: { $in: ['pending', 'accepted'] } });
    
    // Completed requests
    const completedRequests = await PlayRequest.countDocuments({ status: 'completed' });
    const acceptedRequests = await PlayRequest.countDocuments({ status: 'accepted' });
    
    // Successful match rate (accepted + completed / total)
    const successfulMatches = acceptedRequests + completedRequests;
    const matchRate = totalRequests > 0 ? Math.round((successfulMatches / totalRequests) * 100) : 0;
    
    // Monthly Active Users (users active/updated in the last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const mau = await User.countDocuments({
      role: 'user',
      updatedAt: { $gte: thirtyDaysAgo }
    });

    // Repeat engagement rate (% of users with 2 or more completed/accepted play requests)
    const allUsers = await User.find({ role: 'user' }).populate('matchHistory');
    let engagedUsers = 0;
    allUsers.forEach(u => {
      if (u.matchHistory && u.matchHistory.length >= 2) {
        engagedUsers++;
      }
    });
    const repeatRate = totalUsers > 0 ? Math.round((engagedUsers / totalUsers) * 100) : 0;

    const gameCount = await Game.countDocuments({});
    const communityCount = await Community.countDocuments({});
    const pendingReportsCount = await Report.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalRequests,
      activeRequests,
      matchRate,
      mau,
      repeatRate,
      gameCount,
      communityCount,
      pendingReportsCount
    });
  } catch (error) {
    console.error('Admin Stats Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/reports
// @desc    Submit a user or community report
// @access  Protected
router.post('/reports', protect, async (req, res) => {
  const { targetUser, targetCommunity, reason } = req.body;

  try {
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      targetUser: targetUser || null,
      targetCommunity: targetCommunity || null,
      reason
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Submit Report Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/reports
// @desc    Get all reports
// @access  Private/Admin
router.get('/reports', protect, adminOnly, async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('reportedBy', 'name email')
      .populate('targetUser', 'name email')
      .populate('targetCommunity', 'name')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Get Reports Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/reports/:id
// @desc    Update report status (e.g. resolve)
// @access  Private/Admin
router.put('/reports/:id', protect, adminOnly, async (req, res) => {
  const { status } = req.body; // 'resolved' or 'pending'

  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status || report.status;
    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate('reportedBy', 'name email')
      .populate('targetUser', 'name email')
      .populate('targetCommunity', 'name');

    res.json(populatedReport);
  } catch (error) {
    console.error('Resolve Report Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
