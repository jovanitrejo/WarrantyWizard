import AIService from '../services/AIService.js';
import { query } from '../config/database.js';

class AIController {
  // POST /api/ai/chat - Chat with AI assistant
  static async chat(req, res) {
    try {
      const { message, session_id } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      // Generate session_id if not provided
      const sessionId = session_id || `session_${Date.now()}`;

      // Get conversation history for this session
      const historyResult = await query(
        `SELECT role, content FROM chat_history 
         WHERE session_id = $1 
         ORDER BY created_at ASC 
         LIMIT 10`,
        [sessionId]
      );

      const conversationHistory = historyResult.rows.map(row => ({
        role: row.role,
        content: row.content
      }));

      // Get AI response
      const aiResponse = await AIService.chat(message, conversationHistory);

      // Save user message to history
      await query(
        `INSERT INTO chat_history (session_id, role, content) 
         VALUES ($1, $2, $3)`,
        [sessionId, 'user', message]
      );

      // Save AI response to history
      await query(
        `INSERT INTO chat_history (session_id, role, content) 
         VALUES ($1, $2, $3)`,
        [sessionId, 'assistant', aiResponse.reply]
      );

      res.json({
        success: true,
        data: {
          reply: aiResponse.reply,
          session_id: sessionId
        }
      });
    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process chat request',
        error: error.message
      });
    }
  }

  // POST /api/ai/extract-invoice - Extract warranty info from invoice text
  static async extractInvoice(req, res) {
    try {
      const { invoice_text } = req.body;

      if (!invoice_text) {
        return res.status(400).json({
          success: false,
          message: 'invoice_text is required'
        });
      }

      const extractedData = await AIService.extractWarrantyFromInvoice(invoice_text);

      res.json({
        success: true,
        data: extractedData
      });
    } catch (error) {
      console.error('Invoice extraction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extract warranty information',
        error: error.message
      });
    }
  }

  // GET /api/ai/chat/history/:session_id - Get chat history
  static async getChatHistory(req, res) {
    try {
      const { session_id } = req.params;

      const result = await query(
        `SELECT id, role, content, created_at 
         FROM chat_history 
         WHERE session_id = $1 
         ORDER BY created_at ASC`,
        [session_id]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chat history',
        error: error.message
      });
    }
  }

  // DELETE /api/ai/chat/history/:session_id - Clear chat history
  static async clearChatHistory(req, res) {
    try {
      const { session_id } = req.params;

      await query(
        'DELETE FROM chat_history WHERE session_id = $1',
        [session_id]
      );

      res.json({
        success: true,
        message: 'Chat history cleared'
      });
    } catch (error) {
      console.error('Clear chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear chat history',
        error: error.message
      });
    }
  }
}

export default AIController;
