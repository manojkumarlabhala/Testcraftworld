import { Router } from 'express';
import { chatWithAI, generateContent, getModels } from '../services/aiService.js';
import { apiKeyAuth, requireAdmin, AuthenticatedRequest } from '../middleware/apiKeyAuth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(apiKeyAuth);
router.use(requireAdmin);

router.post('/chat', async (req: AuthenticatedRequest, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await chatWithAI(messages);
    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process AI chat request' });
  }
});

router.post('/generate-content', async (req: AuthenticatedRequest, res) => {
  try {
    const { prompt, maxTokens, temperature } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await generateContent({
      prompt,
      maxTokens: maxTokens || 2048,
      temperature: temperature || 0.7,
    });

    res.json(result);
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

router.get('/models', async (req: AuthenticatedRequest, res) => {
  try {
    const models = await getModels();
    res.json({ models });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Failed to retrieve models' });
  }
});

export default router;