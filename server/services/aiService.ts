import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GenerateContentRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateContentResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function chatWithAI(messages: ChatMessage[]): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];

    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini chat error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const generationConfig = {
      temperature: request.temperature || 0.7,
      maxOutputTokens: request.maxTokens || 2048,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      usage: {
        promptTokens: request.prompt.length / 4, // Rough estimate
        completionTokens: text.length / 4, // Rough estimate
        totalTokens: (request.prompt.length + text.length) / 4,
      },
    };
  } catch (error) {
    console.error('Gemini content generation error:', error);
    throw new Error('Failed to generate content');
  }
}

export async function getModels(): Promise<string[]> {
  try {
    // Gemini doesn't have a direct models endpoint like OpenAI
    // Return available models based on documentation
    return ['gemini-pro', 'gemini-pro-vision'];
  } catch (error) {
    console.error('Error getting Gemini models:', error);
    return ['gemini-pro'];
  }
}