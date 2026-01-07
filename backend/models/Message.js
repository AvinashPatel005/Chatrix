const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalText: { type: String, required: true },
    translatedText: { type: String },
    originalLanguage: { type: String, required: true },
    targetLanguage: { type: String }, // The language it was translated into
    type: { type: String, enum: ['text', 'image', 'system', 'call_invite'], default: 'text' },
    grammarTip: { type: String }, // Optional AI-generated tip
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
