const mongoose = require('mongoose');

// Could be part of User or separate. Keeping separate for analytics.
const userStatsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    totalMessagesSent: { type: Number, default: 0 },
    totalCallMinutes: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    wordsLearned: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserStats', userStatsSchema);
