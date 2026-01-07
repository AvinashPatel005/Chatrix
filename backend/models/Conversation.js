const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    // Connection Request Fields
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },

    // Participants (for easier querying after acceptance)
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // synced with requester/recipient

    // The Core Language Pair
    languages: [{ type: String }], // e.g., ['en', 'es']
    learningMap: { type: Map, of: String }, // { userId: 'targetLang' } -> who is learning what in this chat

    // Chat Data
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    updatedAt: { type: Date, default: Date.now },

    // Stats & Streaks (Scoped to this connection)
    streak: { type: Number, default: 0 },
    lastInteraction: { type: Date },

    // Media Stats
    totalCallMinutes: { type: Number, default: 0 }
});

// Ensure unique connection per pair per users? 
// Complex to index, handled in controller logic.

module.exports = mongoose.model('Conversation', conversationSchema);
