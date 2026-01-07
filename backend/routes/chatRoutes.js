const express = require('express');
const router = express.Router();
const {
    getConversations,
    getMessages,
    sendConnectionRequest,
    updateConnectionStatus,
    findMatch,
    getStreamToken,
    getLeaderboard
} = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

router.get('/stream-token', protect, getStreamToken);
router.get('/matches', protect, findMatch);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/', protect, getConversations); // Supports ?type=pending, active, sent
router.post('/', protect, sendConnectionRequest); // Request new connection
router.put('/status', protect, updateConnectionStatus); // Accept/Reject
router.get('/:conversationId/messages', protect, getMessages);

module.exports = router;
