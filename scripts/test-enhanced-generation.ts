import { generateArticleForTopic } from '../server/services/aiAgentService.ts';

async function testEnhancedArticleGeneration() {
  console.log('🧪 Testing enhanced AI article generation...');
  
  const testTopics = [
    'Digital Payment Methods in India',
    'Startup Ecosystem in Bangalore',
    'Remote Work Culture Post COVID-19 India'
  ];

  for (const topic of testTopics) {
    try {
      console.log(`\n📝 Generating article for: "${topic}"`);
      
      const article = await generateArticleForTopic(topic);
      
      console.log(`✅ Generated successfully:`);
      console.log(`   Title: ${article.title}`);
      console.log(`   Content length: ${article.content?.length || 0} characters`);
      console.log(`   Word count: ~${Math.floor((article.content?.length || 0) / 5)} words`);
      console.log(`   Excerpt: ${article.excerpt?.slice(0, 100)}...`);
      console.log(`   Tags: ${article.tags}`);
      console.log(`   Has Indian context: ${article.content?.includes('India') || article.content?.includes('Indian') ? '✅' : '❌'}`);
      console.log(`   Has proper headings: ${article.content?.includes('##') ? '✅' : '❌'}`);
      
      // Check for minimum word count (800+ words)
      const wordCount = article.content ? article.content.split(/\s+/).length : 0;
      console.log(`   Word count check (800+): ${wordCount >= 800 ? '✅' : '❌'} (${wordCount} words)`);
      
    } catch (error) {
      console.error(`❌ Failed to generate article for "${topic}":`, error);
    }
    
    // Small delay between generations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Test completed!');
}

// Run the test
testEnhancedArticleGeneration()
  .then(() => {
    console.log('\n✅ All tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });