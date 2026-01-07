const { translate } = require('google-translate-api-x');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const UserStats = require('../models/UserStats');

// Translation service
const translateText = async (text, targetLang) => {
    try {
        // google-translate-api-x expects 'es', 'fr', etc.
        // If targetLang is 'en', it works seamlessly.
        const res = await translate(text, { to: targetLang, forceBatch: false });
        return res.text;
    } catch (error) {
        console.error('Translation Error:', error.message);
        // Fallback if API fails
        return `[${targetLang}] ${text}`;
    }
};

const userSocketMap = {}; // Track online users: { userId: socketId }

module.exports = (io) => {
    io.on('connection', (socket) => {
        const userId = socket.handshake.query.id;

        // Verify userId exists and is valid
        if (userId && userId !== "undefined") {
            userSocketMap[userId] = socket.id;
            // Broadcast updated online list to all clients
            io.emit('get_online_users', Object.keys(userSocketMap));
            console.log(`User connected: ${userId}`);
        }

        socket.on('join', (userId) => {
            socket.join(userId);
        });

        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
        });

        socket.on('send_message', async (data) => {
            try {
                const { senderId, conversationId, content, originalLanguage, targetLanguage, type = 'text' } = data;

                // 1. Translate (only if text)
                let translatedContent = content;
                if (type === 'text') {
                    translatedContent = await translateText(content, targetLanguage);
                } else {
                    translatedContent = content;
                }

                // 2. Save Message
                const message = await Message.create({
                    conversationId,
                    sender: senderId,
                    originalText: content,
                    translatedText: translatedContent,
                    originalLanguage,
                    targetLanguage,
                    type
                });

                // 3. Update Conversation & Streak
                const conversation = await Conversation.findById(conversationId);
                conversation.lastMessage = message._id;
                conversation.updatedAt = Date.now();

                // Calendar-based streak logic
                const now = new Date();
                const last = conversation.lastInteraction ? new Date(conversation.lastInteraction) : new Date(0);

                // Compare dates only (ignore time) to check for "different days"
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());

                const diffTime = Math.abs(today - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                    if (conversation.streak === 0) conversation.streak = 1;
                } else if (diffDays === 1) {
                    conversation.streak += 1;
                } else {
                    conversation.streak = 1;
                }

                conversation.lastInteraction = now;
                await conversation.save();

                // 4. Update Sender Stats
                await UserStats.findOneAndUpdate({ user: senderId }, { $inc: { totalMessagesSent: 1 } });

                // 5. Emit to room
                const populatedMessage = await Message.findById(message._id).populate('sender', 'username avatar');
                io.to(conversationId).emit('receive_message', populatedMessage);

            } catch (error) {
                console.error('Message error:', error);
            }
        });

        socket.on('typing', ({ conversationId, userId }) => {
            socket.to(conversationId).emit('user_typing', { userId });
        });

        socket.on('disconnect', () => {
            // Only remove if the disconnecting socket is the current active one for the user
            // (Handling multiple tabs: logic ensures we don't mark offline if another tab is open/active)
            if (userId && userSocketMap[userId] === socket.id) {
                delete userSocketMap[userId];
                io.emit('get_online_users', Object.keys(userSocketMap));
            }
            console.log('User disconnected:', socket.id);
        });
    });
};
