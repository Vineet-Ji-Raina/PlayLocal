const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['indoor', 'outdoor'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String, // lucide icon name or emoji
    default: 'trophy'
  }
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);
