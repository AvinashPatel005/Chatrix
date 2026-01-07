const { StreamClient } = require('@stream-io/node-sdk');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const streamClient = new StreamClient(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

const getStreamToken = async (req, res) => {
    try {
        const userId = req.user.id;
        const token = streamClient.createToken(userId);
        res.json({ token, apiKey: process.env.STREAM_API_KEY });
    } catch (error) {
        res.status(500).json({ message: 'Error generating stream token', error: error.message });
    }
}

// Advanced Matching: Find users with compatible language pairs
const findMatch = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await User.findById(userId);

        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        const myNatives = currentUser.nativeLanguages || []; // what I speak
        const myLearningList = currentUser.learningLanguages || []; // what I want
        const myLearningCodes = myLearningList.map(l => l.language);

        // Find existing connections (active or pending) to exclude
        const existingConvos = await Conversation.find({ participants: userId });
        const excludedIds = [userId];

        existingConvos.forEach(c => {
            // participants array contains ObjectIds
            c.participants.forEach(p => {
                if (String(p) !== String(userId)) excludedIds.push(p);
            });
        });

        // Find matches where:
        // 1. Their native languages include at least one of my learning languages
        // 2. Their learning languages include at least one of my native languages
        const rawMatches = await User.find({
            _id: { $nin: excludedIds },
            nativeLanguages: { $in: myLearningCodes },
            'learningLanguages.language': { $in: myNatives }
        }).select('-password');

        // Enhance response with compatibility info
        const matches = rawMatches.map(user => {
            // Which of their natives do I want to learn?
            const canTeachMe = user.nativeLanguages.filter(lang => myLearningCodes.includes(lang));

            // Which of my natives do they want to learn?
            const wantsToLearn = user.learningLanguages
                .filter(l => myNatives.includes(l.language))
                .map(l => l.language);

            return {
                ...user.toObject(),
                matchInfo: {
                    canTeachMe,    // Languages they provide
                    wantsToLearn   // Languages they recieve
                }
            };
        });

        res.json(matches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error finding matches' });
    }
};

// Send Connection Request
const sendConnectionRequest = async (req, res) => {
    try {
        const { receiverId, teachLanguage, learnLanguage } = req.body;
        const senderId = req.user.id;

        // Validation: Ensure pair exists
        if (!teachLanguage || !learnLanguage) {
            return res.status(400).json({ message: "Language pair required" });
        }

        // Check for existing connection for this specific pair
        const existing = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
            languages: { $all: [teachLanguage, learnLanguage], $size: 2 },
            // Optional: check if status is strictly overlap
        });

        if (existing) {
            return res.status(400).json({ message: "Connection for this language pair already exists" });
        }

        // Create Pending Request
        const learningMap = {
            [senderId]: learnLanguage,    // Sender is learning this
            [receiverId]: teachLanguage   // Receiver is learning this (which is sender's native)
        };
        // wait... "teachLanguage" is what sender teaches? Or what sender learns?
        // Let's clarify payload.
        // Frontend should send: "I want to learn Spanish (from them) and teach English (to them)"
        // teachLanguage: 'en', learnLanguage: 'es' (Sender perspective)

        // learningMap:
        // Sender -> learns 'es'
        // Receiver -> learns 'en'

        const newConnection = await Conversation.create({
            requester: senderId,
            recipient: receiverId,
            participants: [senderId, receiverId],
            languages: [teachLanguage, learnLanguage],
            learningMap: {
                [senderId]: learnLanguage,
                [receiverId]: teachLanguage
            },
            status: 'pending'
        });

        res.status(201).json(newConnection);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

// Accept/Reject/Cancel Request
const updateConnectionStatus = async (req, res) => {
    try {
        const { conversationId, status } = req.body;
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) return res.status(404).json({ message: 'Request not found' });

        // User cancelling their own sent request
        if (status === 'cancelled') {
            if (String(conversation.requester) !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to cancel this request' });
            }
            await Conversation.findByIdAndDelete(conversationId);
            return res.json({ message: 'Request cancelled', conversationId });
        }

        // Only recipient can accept/reject
        if (String(conversation.recipient) !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        conversation.status = status;
        await conversation.save();

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get List (Active Chats vs Pending Requests)
const getConversations = async (req, res) => {
    try {
        const { type } = req.query; // 'active' or 'pending'

        let query = { participants: req.user.id };

        if (type === 'pending') {
            // Incoming requests
            query = { recipient: req.user.id, status: 'pending' };
        } else if (type === 'sent') {
            query = { requester: req.user.id, status: 'pending' };
        } else {
            // Default active chats
            query = { participants: req.user.id, status: 'accepted' };
        }

        const conversations = await Conversation.find(query)
            .populate('participants', 'username avatar nativeLanguages learningLanguages')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId }).populate('sender', 'username avatar');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getLeaderboard = async (req, res) => {
    try {
        const topStreaks = await Conversation.find({ streak: { $gt: 0 } })
            .sort({ streak: -1 })
            .limit(10)
            .populate('participants', 'username avatar');
        res.json(topStreaks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Alias for ease of use (backward compat if needed, or route update)
// Mapping 'createConversation' in routes to 'sendConnectionRequest' logic?
// Current route: POST /api/chat -> createConversation
// I should update routes.

module.exports = {
    findMatch,
    sendConnectionRequest, // Replaces createConversation
    updateConnectionStatus,
    getConversations,
    getMessages,
    getStreamToken,
    getLeaderboard
};
