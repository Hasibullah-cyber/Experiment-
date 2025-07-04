import { GoogleGenerativeAI } from '@google/generative-ai';
import { storage } from './storage';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class ShoppingAssistant {
  private async getProductContext(): Promise<string> {
    try {
      const { products } = await storage.getAllProducts({ limit: 50 });
      const categories = await storage.getAllCategories();
      
      const productSummary = products.map(p => 
        `${p.name} (${p.brand || 'No brand'}) - ${p.shortDescription || p.description?.substring(0, 100)} - $${p.price}${p.salePrice ? ` (Sale: $${p.salePrice})` : ''}`
      ).join('\n');
      
      const categorySummary = categories.map(c => `${c.name}: ${c.description}`).join('\n');
      
      return `Available Categories:\n${categorySummary}\n\nSample Products:\n${productSummary}`;
    } catch (error) {
      console.error('Error getting product context:', error);
      return 'Product information temporarily unavailable.';
    }
  }

  async generateResponse(userMessage: string, chatHistory: ChatMessage[] = []): Promise<string> {
    try {
      const productContext = await this.getProductContext();
      
      const systemPrompt = `You are a helpful shopping assistant for ShopCenter, an e-commerce website. Help customers find products, answer questions, and provide recommendations.

Available Products and Categories:
${productContext}

Guidelines:
- Be friendly, helpful, and concise
- Recommend specific products when appropriate
- If asked about products not in our catalog, politely explain we don't carry them and suggest alternatives
- Help with sizing, features, comparisons, and general shopping advice
- If users want to search for something specific, suggest they use the search feature
- Keep responses under 200 words unless detailed explanations are needed

Current conversation context:
${chatHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Customer message: ${userMessage}`;

      const result = await model.generateContent(systemPrompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm having trouble processing your request right now. Please try asking again or contact our support team for assistance.";
    }
  }

  async getProductRecommendations(query: string): Promise<any[]> {
    try {
      const { products } = await storage.getAllProducts();
      
      // Simple keyword matching for recommendations
      const keywords = query.toLowerCase().split(' ');
      const recommendations = products.filter(product => {
        const searchText = `${product.name} ${product.description} ${product.brand} ${product.shortDescription}`.toLowerCase();
        return keywords.some(keyword => searchText.includes(keyword));
      }).slice(0, 5);

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }
}