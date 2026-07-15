const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/games
// @desc    Get all games
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const games = await Game.find({}).sort({ name: 1 });
    res.json(games);
  } catch (error) {
    console.error('Get Games Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/games
// @desc    Create a game category
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, category, description, icon } = req.body;

  try {
    const gameExists = await Game.findOne({ name });
    if (gameExists) {
      return res.status(400).json({ message: 'Game already exists' });
    }

    const game = await Game.create({
      name,
      category,
      description,
      icon: icon || 'trophy'
    });

    res.status(201).json(game);
  } catch (error) {
    console.error('Create Game Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/games/:id
// @desc    Update a game category
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { name, category, description, icon } = req.body;

  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    game.name = name || game.name;
    game.category = category || game.category;
    game.description = description !== undefined ? description : game.description;
    game.icon = icon || game.icon;

    const updatedGame = await game.save();
    res.json(updatedGame);
  } catch (error) {
    console.error('Update Game Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/games/:id
// @desc    Delete a game category
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    await game.deleteOne();
    res.json({ message: 'Game removed' });
  } catch (error) {
    console.error('Delete Game Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
