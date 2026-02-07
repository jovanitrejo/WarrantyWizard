import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY || process.env.OPENAI_API_KEY
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIService {
  // Chat with AI about warranties
  static async chat(message: string, conversationHistory: ChatMessage[] = []): Promise<{ reply: string; usage?: any; error?: string }> {
    try {
      // System context for the AI
      const systemContext = `You are WarrantyWizard AI Assistant, an expert in warranty management for enterprises.
You help users manage and understand their warranties, provide insights on warranty coverage, 
and help track warranty expiration dates and claims.

Be helpful, concise, and provide actionable recommendations when relevant.`;

      // Prepare messages for OpenAI
      const messages: ChatMessage[] = [
        { role: 'system', content: systemContext },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // or 'gpt-4', 'gpt-3.5-turbo'
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      });

      return {
        reply: response.choices[0].message.content || 'No response generated',
        usage: response.usage
      };
    } catch (error: any) {
      console.error('AI Chat Error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        stack: error.stack
      });

      if (error.status === 401) {
        return {
          reply: "I'm having trouble connecting to my AI service. Please check that the OpenAI API key is configured correctly.",
          error: 'API_KEY_ERROR'
        };
      }

      if (error.code === 'ERR_MODULE_NOT_FOUND') {
        return {
          reply: "AI service is not properly configured. Please check dependencies.",
          error: 'SERVICE_ERROR'
        };
      }

      return {
        reply: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        error: error.message,
      };
    }
  }

  // Generate AI-powered insights about a warranty
  static async generateInsight(warrantyData: any): Promise<string> {
    try {
      const prompt = `Analyze this warranty and provide a brief risk assessment and recommendations:

Product: ${warrantyData.product_name || 'Unknown'}
Category: ${warrantyData.category || 'Unknown'}
Purchase Date: ${warrantyData.purchase_date || 'Unknown'}
Warranty End: ${warrantyData.warranty_end || 'Unknown'}
Cost: $${warrantyData.purchase_cost || 0}

Provide:
1. Risk assessment (high/medium/low)
2. Key recommendation
3. Action to take

Keep it concise (2-3 sentences).`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a warranty management expert. Provide brief, actionable insights in 2-3 sentences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0].message.content || 'Unable to generate insight';
    } catch (error: any) {
      console.error('Error generating insight:', error);
      throw error;
    }
  }
}
