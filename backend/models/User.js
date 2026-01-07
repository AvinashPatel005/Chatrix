const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },

  // New Array Structure
  nativeLanguages: [{ type: String, required: true }],
  learningLanguages: [{
    language: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'native'], default: 'beginner' }
  }],

  // Availability & Meta
  timezone: { type: String, default: 'UTC' },
  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
