export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GenerateContentRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface GenerateContentResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

import modelSelector from './modelSelector.js';

// env override still allowed; otherwise modelSelector will probe and pick best model
const MODEL_NAME = process.env.GEMINI_MODEL || '';

export async function chatWithAI(messages: ChatMessage[]): Promise<string> {
  try {
    console.log('Using Gemini model:', MODEL_NAME);
    // Attempt to start chat with preferred model and fall back if necessary.
    const tried: string[] = [];
    // Determine model list: env override first, otherwise ask selector for best model then fallbacks
    const candidates = MODEL_NAME ? [MODEL_NAME] : [await modelSelector.getBestModel()];
    const fallbackModels = [...candidates, 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
    for (const m of fallbackModels) {
      if (!m || tried.includes(m)) continue;
      tried.push(m);
      try {
        const genAI = new (await import('@google/generative-ai')).GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: m });
        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history });
        const lastMessage = messages[messages.length - 1];

        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        console.log('chatWithAI: used model', m);
        return response.text();
      } catch (err: any) {
        console.warn(`chatWithAI: model ${m} failed:`, err?.status || err?.message || err);
        // If auth/permission error, surface helpful guidance immediately
        if (err && err.status && (err.status === 403 || err.status === 401)) {
          console.error('Gemini auth error. Ensure your GEMINI_API_KEY or GOOGLE_APPLICATION_CREDENTIALS (service account) is valid and has access to the Generative Language API (generativelanguage.googleapis.com).');
          throw err;
        }
        // otherwise try next fallback model
      }
    }
    throw new Error('Failed to start chat with any known Gemini model.');
  } catch (error) {
    console.error('Gemini chat error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
  try {
    // Try preferred model first, then fallback list if model not supported by this API client/version.
    const generationConfig = {
      temperature: request.temperature || 0.7,
      maxOutputTokens: request.maxTokens || 2048,
    };

  let lastErr: any = null;
  const candidates = request.model ? [request.model] : (MODEL_NAME ? [MODEL_NAME] : [await modelSelector.getBestModel()]);
  const fallbackModels = [...candidates, 'gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
    for (const m of fallbackModels) {
      if (!m) continue;
      try {
        console.log('Attempting generateContent with model:', m);
        const genAI = new (await import('@google/generative-ai')).GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
          generationConfig,
        });
        const response = await result.response;
        const text = response.text();
        return {
          content: text,
          usage: {
            promptTokens: Math.round((request.prompt.length || 0) / 4), // rough estimate
            completionTokens: Math.round((text || '').length / 4),
            totalTokens: Math.round(((request.prompt.length || 0) + (text || '').length) / 4),
          },
        };
      } catch (err: any) {
        lastErr = err;
        console.warn(`generateContent: model ${m} failed:`, err?.status || err?.message || err);
        // If auth/permission error, surface helpful guidance immediately
        if (err && err.status && (err.status === 403 || err.status === 401)) {
          console.error('Gemini auth error. Ensure your GEMINI_API_KEY or GOOGLE_APPLICATION_CREDENTIALS (service account) is valid and has access to the Generative Language API (generativelanguage.googleapis.com).');
          throw err;
        }
        // For 404/model-not-found, continue to next fallback model
      }
    }
    console.error('All model attempts failed for generateContent. Last error:', lastErr);
    throw lastErr || new Error('Failed to generate content with available Gemini models');
  } catch (error) {
    console.error('Gemini content generation error:', error);
    throw new Error('Failed to generate content');
  }
}

export async function getModels(): Promise<string[]> {
  try {
    // Gemini doesn't have a direct models endpoint like OpenAI
    // Return available models based on documentation
    return ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-pro-vision'];
  } catch (error) {
    console.error('Error getting Gemini models:', error);
    return ['gemini-1.5-pro'];
  }
}