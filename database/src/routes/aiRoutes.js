import express from 'express';
import AIController from '../controllers/aiController.js';

const router = express.Router();

// Chat with AI assistant
router.post('/chat', AIController.chat);

// Extract warranty info from invoice text
router.post('/extract-invoice', AIController.extractInvoice);

// Get chat history for a session
router.get('/chat/history/:session_id', AIController.getChatHistory);

// Clear chat history for a session
router.delete('/chat/history/:session_id', AIController.clearChatHistory);

export default router;
