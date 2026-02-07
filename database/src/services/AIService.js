import OpenAI from 'openai';
import dotenv from 'dotenv';
import Warranty from '../models/Warranty.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AIService {
  // AI Chatbot - Answer questions about warranties
  static async chat(message, conversationHistory = []) {
    try {
      // Get all warranties for context
      const warranties = await Warranty.getAll();
      const analytics = await Warranty.getAnalytics();

      // Build context about the warranty system
      const systemContext = `You are WarrantyWizard AI Assistant, an expert in warranty management for enterprises.

Current Warranty Database Summary:
- Total Warranties: ${analytics.overview.total_warranties}
- Active Warranties: ${analytics.overview.active_count}
- Expiring Soon (30 days): ${analytics.overview.expiring_soon_count}
- Expired: ${analytics.overview.expired_count}
- Total Value: $${parseFloat(analytics.overview.total_value || 0).toLocaleString()}
- Claims Filed: ${analytics.overview.claims_filed}
- Total Claims Value: $${parseFloat(analytics.overview.total_claims_value || 0).toLocaleString()}

Warranty Details (recent/important ones):
${warranties.slice(0, 20).map(w => `
- ${w.product_name} (${w.category})
  Serial: ${w.serial_number}
  Purchased: ${w.purchase_date}
  Warranty Ends: ${w.warranty_end}
  Status: ${w.warranty_end < new Date() ? 'EXPIRED' : w.warranty_end <= new Date(Date.now() + 30*24*60*60*1000) ? 'EXPIRING SOON' : 'Active'}
  Cost: $${w.purchase_cost}
  Claim Filed: ${w.claim_filed ? 'Yes' : 'No'}
`).join('\n')}

Your role:
1. Answer questions about warranties in the system
2. Provide insights and recommendations
3. Help users understand warranty status and value
4. Suggest actions to maximize warranty benefits
5. Be concise but helpful

Important: Base all answers on the actual data provided above. Don't make up information.`;

      // Prepare messages
      const messages = [
        { role: 'system', content: systemContext },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      });

      return {
        reply: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Fallback response if API fails
      if (error.status === 401) {
        return {
          reply: "I'm having trouble connecting to my AI service. Please check that the OpenAI API key is configured correctly.",
          error: 'API_KEY_ERROR'
        };
      }
      
      return {
        reply: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        error: error.message
      };
    }
  }

  // Generate predictive insights for a warranty
  static async generateInsight(warranty) {
    try {
      const prompt = `Analyze this equipment warranty and provide a risk assessment:

Equipment: ${warranty.product_name}
Category: ${warranty.category}
Purchase Date: ${warranty.purchase_date}
Warranty End: ${warranty.warranty_end}
Cost: $${warranty.purchase_cost}
Current Date: ${new Date().toISOString().split('T')[0]}

Consider:
1. How close to warranty expiration?
2. Equipment category failure rates
3. Value at risk if warranty expires unused

Provide:
1. Risk score (0-100)
2. Brief insight (2-3 sentences)
3. Recommended action

Format your response as JSON:
{
  "risk_score": <number>,
  "insight": "<string>",
  "recommendation": "<string>"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a warranty risk assessment expert. Provide analysis in JSON format only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 300
      });

      const content = response.choices[0].message.content;
      
      // Extract JSON from response (sometimes GPT wraps it in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return JSON.parse(content);
    } catch (error) {
      console.error('Insight Generation Error:', error);
      
      // Fallback rule-based insight
      const daysUntilExpiry = Math.ceil((new Date(warranty.warranty_end) - new Date()) / (1000 * 60 * 60 * 24));
      
      let riskScore = 0;
      let insight = '';
      let recommendation = '';

      if (daysUntilExpiry < 0) {
        riskScore = 100;
        insight = `This warranty has already expired. Any repair costs will be out-of-pocket.`;
        recommendation = 'Consider purchasing an extended warranty if available, or budget for potential repair costs.';
      } else if (daysUntilExpiry <= 30) {
        riskScore = 80;
        insight = `Warranty expires in ${daysUntilExpiry} days. High-risk period for missing valuable coverage.`;
        recommendation = 'Schedule preventive maintenance immediately to catch any issues before warranty expires.';
      } else if (daysUntilExpiry <= 90) {
        riskScore = 50;
        insight = `Warranty expires in ${daysUntilExpiry} days. Good time to plan preventive maintenance.`;
        recommendation = 'Schedule inspection within the next month to ensure warranty can be used if needed.';
      } else {
        riskScore = 20;
        insight = `Warranty coverage is secure for ${daysUntilExpiry} more days.`;
        recommendation = 'Monitor regularly and schedule maintenance 60 days before expiration.';
      }

      return {
        risk_score: riskScore,
        insight,
        recommendation
      };
    }
  }

  // Extract warranty information from invoice text (OCR result)
  static async extractWarrantyFromInvoice(invoiceText) {
    try {
      const prompt = `Extract warranty information from this invoice/receipt text:

${invoiceText}

Extract the following information (if available):
- Product name
- Serial number
- Purchase date
- Warranty period (in months or years)
- Purchase cost
- Supplier/Vendor name

Format your response as JSON:
{
  "product_name": "<string>",
  "serial_number": "<string or null>",
  "purchase_date": "<YYYY-MM-DD or null>",
  "warranty_length_months": <number or null>,
  "purchase_cost": <number or null>,
  "supplier": "<string or null>"
}

If information is not found, use null. Be as accurate as possible.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert at extracting structured data from invoices. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 400
      });

      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return JSON.parse(content);
    } catch (error) {
      console.error('Invoice Extraction Error:', error);
      throw new Error('Failed to extract warranty information from invoice');
    }
  }
}

export default AIService;
