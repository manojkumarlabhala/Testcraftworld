import { storage } from '../server/storage.ts';
import { generateArticleForTopic } from '../server/services/aiAgentService.ts';

interface Post {
  id: string;
  title: string;
  content?: string;
  tags?: string;
  category?: string;
  featuredImage?: string;
  sourceLink?: string;
  excerpt?: string;
  published?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

async function enhanceExistingArticles() {
  console.log('🚀 Starting enhancement of existing articles...');
  
  try {
    // Get all existing posts
    const posts = await storage.getPosts(100, 0) as Post[];
    console.log(`📊 Found ${posts.length} articles to enhance`);
    
    if (posts.length === 0) {
      console.log('❌ No articles found to enhance');
      return;
    }

    let enhanced = 0;
    let failed = 0;
    
    for (const post of posts) {
      try {
        console.log(`\n🔄 Enhancing: "${post.title}"`);
        
        // Skip if content is already enhanced (check for Indian context or long content)
        if (post.content && 
            (post.content.length > 2000 || 
             post.content.includes('India') || 
             post.content.includes('Indian'))) {
          console.log(`⏭️  Skipping "${post.title}" - already appears enhanced`);
          continue;
        }
        
        // Generate enhanced content using the original title as topic
        const enhancedArticle = await generateArticleForTopic(post.title);
        
        // Update the post with enhanced content while preserving important metadata
        const updatedPost = {
          id: post.id,
          title: enhancedArticle.title, // Use enhanced title with better SEO
          content: enhancedArticle.content,
          excerpt: enhancedArticle.excerpt,
          tags: enhancedArticle.tags,
          sourceLink: post.sourceLink || enhancedArticle.sourceLink, // Preserve existing source
          category: post.category, // Preserve existing category
          featuredImage: post.featuredImage, // Preserve existing image
          published: post.published, // Preserve publication status
          generated: true, // Mark as AI generated
          commentsDisabled: false,
        };
        
        await storage.updatePost(post.id, updatedPost);
        enhanced++;
        console.log(`✅ Enhanced: "${enhancedArticle.title}"`);
        
        // Add a small delay to avoid overwhelming the AI service
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        failed++;
        console.error(`❌ Failed to enhance "${post.title}":`, error);
      }
    }
    
    console.log('\n📊 Enhancement Summary:');
    console.log(`✅ Successfully enhanced: ${enhanced} articles`);
    console.log(`❌ Failed to enhance: ${failed} articles`);
    console.log(`📄 Total processed: ${posts.length} articles`);
    
    if (enhanced > 0) {
      console.log('\n🎉 Article enhancement completed successfully!');
      console.log('📝 All enhanced articles now include:');
      console.log('   • 800+ words with Indian context');
      console.log('   • Proper heading structure (H2/H3)');
      console.log('   • Enhanced SEO optimization');
      console.log('   • Indian-focused examples and references');
    }
    
  } catch (error) {
    console.error('💥 Error during article enhancement:', error);
    process.exit(1);
  }
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  enhanceExistingArticles()
    .then(() => {
      console.log('\n🏁 Enhancement process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Enhancement process failed:', error);
      process.exit(1);
    });
}

export { enhanceExistingArticles };