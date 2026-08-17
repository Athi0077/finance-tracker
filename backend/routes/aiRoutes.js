const express = require('express');
const { protect } = require('../middleware/auth');
const { chat, getHistory, getMessages, getSummary } = require('../controllers/aiController');

const router = express.Router();

router.use(protect);

router.post('/chat', chat);
router.get('/chat/history', getHistory);
router.get('/chat/:conversationId/messages', getMessages);
router.post('/summary', getSummary);

module.exports = router;
