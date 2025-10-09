import 'dotenv/config';
import aiAgentService from '../server/services/aiAgentService.js';

async function run() {
  try {
    console.log('Running Gemini test generation...');
    const topics = await aiAgentService.discoverTrendingTopics();
    console.log('Discovered topics:', topics.slice(0,5));
    const topic = topics[0] || 'Current affairs in India';
    const article = await aiAgentService.generateArticleForTopic(topic);
    console.log('Generated article title:', article.title);
    console.log('Excerpt:', article.excerpt);
    console.log('Content head:\n', (article.content || '').slice(0,1000));
    process.exit(0);
  } catch (err) {
    console.error('Gemini test failed:', err);
    process.exit(2);
  }
}

run();
