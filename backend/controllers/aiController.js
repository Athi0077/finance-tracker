const aiService = require('../services/aiService');
const financeContextService = require('../services/financeContextService');
const AIConversation = require('../models/AIConversation');
const AIMessage = require('../models/AIMessage');

/**
 * Handle chat interaction with the AI Advisor
 */
const chat = async (req, res, next) => {
    try {
        const { message, conversationId } = req.body;
        const userId = req.user._id;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        let conversation;
        if (conversationId) {
            conversation = await AIConversation.findOne({ _id: conversationId, userId });
        }

        if (!conversation) {
            conversation = await AIConversation.create({
                userId,
                title: message.substring(0, 30) + '...'
            });
        }

        // Save user message
        await AIMessage.create({
            conversationId: conversation._id,
            userId,
            role: 'user',
            content: message
        });

        // Get history (last 10 messages)
        const history = await AIMessage.find({ conversationId: conversation._id })
            .sort({ createdAt: 1 })
            .limit(10); // Simple buffer

        // Get financial context
        const context = await financeContextService.getFinancialContext(userId);

        // Call AI
        const aiResponse = await aiService.chatWithFinancialAdvisor(context, message, history);

        // Save AI message
        const newAIMessage = await AIMessage.create({
            conversationId: conversation._id,
            userId,
            role: 'model',
            content: aiResponse
        });

        res.status(200).json({
            success: true,
            data: {
                conversationId: conversation._id,
                message: newAIMessage
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get chat history for a conversation
 */
const getHistory = async (req, res, next) => {
    try {
        const conversations = await AIConversation.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        next(error);
    }
};

const getMessages = async (req, res, next) => {
    try {
        const messages = await AIMessage.find({ 
            conversationId: req.params.conversationId,
            userId: req.user._id
        }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate AI Summary
 */
const getSummary = async (req, res, next) => {
    try {
        const context = await financeContextService.getFinancialContext(req.user._id);
        const summary = await aiService.generateMonthlySummary(context);
        
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Scan receipt and extract data
 */
const scanReceipt = async (req, res, next) => {
    try {
        const { image } = req.body; // Expect base64 image data
        if (!image) {
            return res.status(400).json({ success: false, message: 'Image data is required' });
        }

        const extractedData = await aiService.scanReceiptImage(image);
        
        res.status(200).json({
            success: true,
            data: extractedData
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    chat,
    getHistory,
    getMessages,
    getSummary,
    scanReceipt
};
