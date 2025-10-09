import fetch from 'node-fetch';
import { generateContent } from './aiService.js';
import modelSelector from './modelSelector.js';
import { randomUUID } from 'crypto';

async function fetchTrendingTopicsFromNewsApi(): Promise<string[]> {
  const key = process.env.NEWS_API_KEY;
  if (!key) return [];
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=8&apiKey=${key}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    const topics = (json.articles || []).map((a: any) => a.title).filter(Boolean);
    return topics;
  } catch (err) {
    console.error('NewsAPI error', err);
    return [];
  }
}

export async function discoverTrendingTopics(): Promise<string[]> {
  const fromNews = await fetchTrendingTopicsFromNewsApi();
  if (fromNews.length) return fromNews;
  // fallback topics
  return [
    'Entrance exam announcements, job updates from India (entrance exam news, result notifications, and public/private job updates with source links)',
    'Latest technology trends in India',
    'Top business moves today',
    'Consumer product trends',
    'Startup funding news in India',
  ];
}

export async function generateArticleForTopic(topic: string) {
  const prompt = `Write a comprehensive, engaging 800+ word SEO-optimized blog article in English for Indian readers on the topic: "${topic}".

CONTENT REQUIREMENTS:
- Minimum 800 words (aim for 1000-1200 words)
- Indian context and examples wherever relevant
- Conversational tone that resonates with Indian audience
- Include practical, actionable insights
- Add Indian-specific references, statistics, or case studies when applicable

STRUCTURE REQUIREMENTS:
- Compelling, SEO-friendly title (include primary keyword)
- Brief introduction (2-3 sentences)
- At least 5-6 main sections with H2 headings
- Use H3 subheadings within sections for better readability
- Short paragraphs (2-4 sentences each)
- Include numbered or bulleted lists where appropriate
- Strong conclusion with key takeaways

SEO OPTIMIZATION:
- Use keywords naturally throughout the content
- Include semantic keywords and related terms
- Optimize headings with relevant keywords
- Write compelling meta description under 160 characters
- Suggest 5-8 relevant tags

INDIAN CONTEXT:
- Reference Indian cities, states, or regions when relevant
- Include Indian rupee values for financial topics
- Mention Indian companies, startups, or brands as examples
- Consider Indian cultural context, festivals, or traditions
- Include government schemes, policies, or initiatives if applicable
- Use Indian English terminology and expressions naturally

FORMATTING:
Return the article in this exact format:

Title: [SEO-optimized title with primary keyword]

Meta: [Meta description under 160 characters]

# [Main Title - repeat the title here]

[Brief 2-3 sentence introduction paragraph]

## [H2 Heading 1]

[Content paragraphs with proper spacing]

### [H3 Subheading if needed]

[More content]

## [H2 Heading 2]

[Content continues...]

[Continue with more H2 sections...]

## Conclusion

[Strong conclusion with key takeaways]

---

Tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]

${topic.toLowerCase().includes('exam') || topic.toLowerCase().includes('job') || topic.toLowerCase().includes('news') || topic.toLowerCase().includes('announcement') ? 'Source: [If this is news/announcement, include a reliable source URL]' : ''}

IMPORTANT: Ensure the article is exactly 800+ words, naturally incorporates Indian context, and follows proper SEO best practices with clear heading structure.`;

  let content: string | null = null;
  try {
    const preferredModel = await modelSelector.getModelForTopic(topic);
    const res = await generateContent({ prompt, maxTokens: 3000, temperature: 0.7, model: preferredModel });
    content = res.content;
  } catch (err: any) {
    console.error('AI generation failed for topic', topic, err);
    // if configured to use mock generator or API access is forbidden, fall back to a simple stub
    // AGENT_AUTO_FALLBACK=true will enable automatic fallback to mock content on any generation failure
    const autoFallback = process.env.AGENT_USE_MOCK_GENERATOR === 'true' || process.env.AGENT_AUTO_FALLBACK === 'true';
    if (autoFallback || (err?.status === 403)) {
      content = generateMockIndianArticle(topic);
    } else {
      throw err;
    }
  }

  // Extract title, meta description, and other metadata
  let title = topic;
  let metaDescription = '';
  let excerpt = '';
  let tagsArr: string[] = [];
  let sourceLink: string | null = null;

  if (content) {
    // Extract title
    const titleMatch = content.match(/Title:\s*(.+)/);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // Extract meta description
    const metaMatch = content.match(/Meta:\s*(.+)/);
    if (metaMatch) {
      metaDescription = metaMatch[1].trim();
      excerpt = metaDescription;
    } else {
      // Generate excerpt from first few sentences if no meta description
      const firstParagraph = content.split('\n').find(line => line.trim() && !line.startsWith('#') && !line.startsWith('Title:') && !line.startsWith('Meta:'));
      excerpt = firstParagraph ? firstParagraph.slice(0, 200) + '...' : '';
    }

    // Extract tags
    try {
      const tagMatch = content.match(/Tags:\s*(\[([\s\S]*?)\])/);
      if (tagMatch) {
        const maybe = JSON.parse(tagMatch[1]);
        if (Array.isArray(maybe)) tagsArr = maybe;
      }
    } catch (e) {
      // Default tags based on topic
      tagsArr = generateDefaultTags(topic);
    }

    // Extract source link
    try {
      const srcMatch = content.match(/Source:\s*(https?:\/\/[\S]+)/i);
      if (srcMatch) sourceLink = srcMatch[1];
    } catch (e) {}

    // Clean the content to remove metadata lines
    content = content
      .replace(/Title:\s*.+\n?/g, '')
      .replace(/Meta:\s*.+\n?/g, '')
      .replace(/Tags:\s*\[[\s\S]*?\]\n?/g, '')
      .replace(/Source:\s*https?:\/\/[\S]+\n?/g, '')
      .replace(/---\n?/g, '')
      .trim();
  }

  const id = randomUUID();
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 200) + '-' + id.slice(0, 6);

  return {
    id,
    title,
    slug,
    content,
    excerpt: excerpt || metaDescription,
    tags: JSON.stringify(tagsArr),
    sourceLink,
    featuredImage: null,
  };
}

function generateMockIndianArticle(topic: string): string {
  return `Title: ${topic} - Complete Guide for Indians

Meta: Comprehensive guide on ${topic} with Indian context, practical tips, and actionable insights for Indian readers.

# ${topic} - Complete Guide for Indians

In today's rapidly evolving landscape, understanding ${topic} has become crucial for Indians across all walks of life. This comprehensive guide provides practical insights tailored specifically for the Indian context, helping you navigate the challenges and opportunities in this dynamic field.

## Understanding the Basics

${topic} has gained significant traction in India, with major cities like Mumbai, Delhi, Bangalore, and Hyderabad leading the way. The Indian market presents unique opportunities and challenges that require a localized approach. From small business owners in tier-2 cities to large corporations in metropolitan areas, everyone is recognizing the importance of staying updated with the latest trends and developments.

### Historical Context in India

The evolution of ${topic} in India has been remarkable over the past decade. Starting from limited adoption to widespread acceptance, this journey reflects India's growing digital maturity and technological advancement. Government initiatives like Digital India have played a crucial role in accelerating this transformation.

### Current Market Scenario

Today's Indian market for ${topic} is characterized by diversity, innovation, and rapid growth. With over 1.4 billion people and increasing internet penetration, India offers one of the world's largest markets for ${topic}-related solutions and services.

## Key Benefits for Indian Users

The adoption of ${topic} in India offers several advantages, particularly given our diverse economic landscape and growing digital infrastructure. These benefits extend beyond major cities to rural areas, creating inclusive growth opportunities.

### Economic Impact

${topic} contributes significantly to India's economy, creating jobs across various sectors and skill levels. From entry-level positions to senior management roles, the industry offers diverse career opportunities for Indians from all backgrounds.

### Social Transformation

Beyond economic benefits, ${topic} is driving social change in India. It's bridging geographical gaps, connecting rural and urban populations, and creating new possibilities for education, healthcare, and governance.

## Current Scenario in India

The Indian market for ${topic} has shown remarkable growth, with increasing adoption rates across tier-1 and tier-2 cities. Government initiatives and startup ecosystem support have further accelerated this trend. Major Indian companies like TCS, Infosys, Wipro, and newer players like Flipkart, Paytm, and Zomato are leading innovations in this space.

### Regional Variations

Different states in India are at various stages of ${topic} adoption. States like Karnataka, Maharashtra, and Tamil Nadu lead in technology adoption, while others are catching up rapidly with government support and private sector investments.

### Regulatory Environment

The Indian government has been proactive in creating supportive policies for ${topic}. Recent initiatives include updated regulations, tax incentives, and infrastructure development programs that encourage growth and innovation.

## Practical Implementation Tips

For Indian users looking to leverage ${topic}, here are some practical steps tailored to local conditions and requirements. These recommendations consider India's unique cultural, economic, and technological landscape.

### Step-by-Step Guide

1. **Research and Planning**: Understand local regulations and market conditions specific to your state or region
2. **Budget Assessment**: Evaluate costs in Indian rupees and consider local pricing structures
3. **Technology Infrastructure**: Assess internet connectivity, power supply, and technical support availability
4. **Skill Development**: Identify training opportunities available through government schemes and private institutions
5. **Local Partnerships**: Connect with Indian vendors, consultants, and service providers
6. **Compliance**: Ensure adherence to Indian laws, tax regulations, and industry standards

### Best Practices for Indian Context

Consider festivals, local customs, and business practices when implementing ${topic} solutions. India's diverse culture requires a nuanced approach that respects regional preferences and traditional practices.

## Challenges and Solutions

While ${topic} offers immense potential, Indians face unique challenges that require specific solutions and strategies. Understanding these challenges is crucial for successful implementation.

### Infrastructure Challenges

India's infrastructure varies significantly across regions. While major cities have world-class facilities, rural areas may face connectivity and power supply issues. Solutions include offline capabilities, mobile-first design, and alternative power sources.

### Skills Gap

The rapid growth of ${topic} has created a skills gap in the Indian market. Addressing this requires continuous learning, government training programs, and industry-academia partnerships.

### Cost Considerations

For many Indians, cost remains a significant factor. Solutions should be designed with affordability in mind, offering flexible pricing models and payment options suitable for Indian consumers.

## Success Stories from India

Several Indian companies and individuals have achieved remarkable success in ${topic}. These case studies provide inspiration and practical lessons for others looking to follow similar paths.

### Startup Success Stories

Indian startups have shown that innovation and perseverance can lead to global success. Companies that started with limited resources have grown to serve millions of users and create thousands of jobs.

### Enterprise Transformations

Large Indian corporations have successfully implemented ${topic} solutions, improving efficiency, reducing costs, and enhancing customer experience. These transformations serve as models for other organizations.

## Future Prospects in India

The future of ${topic} in India looks promising, with government support and increasing awareness driving growth across various sectors. Emerging technologies, changing consumer behavior, and supportive policies create a favorable environment for continued expansion.

### Technology Trends

Artificial intelligence, machine learning, blockchain, and IoT are shaping the future of ${topic} in India. These technologies promise to address current limitations and create new opportunities.

### Market Predictions

Industry experts predict significant growth in ${topic} adoption over the next five years. This growth will be driven by increasing digital literacy, improving infrastructure, and supportive government policies.

## Conclusion

${topic} represents a significant opportunity for Indians to improve their lives and businesses. With proper understanding, strategic implementation, and continuous learning, it can drive positive change across the country. The key to success lies in adapting global best practices to local conditions while leveraging India's unique strengths and opportunities.

As India continues its digital transformation journey, ${topic} will play an increasingly important role in shaping the nation's future. By staying informed, investing in skills development, and embracing innovation, Indians can position themselves at the forefront of this exciting evolution.

Tags: ["${topic.toLowerCase()}", "India", "technology", "business", "digital transformation", "innovation"]`;
}

function generateDefaultTags(topic: string): string[] {
  const baseTags = ["India"];
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('technology') || topicLower.includes('tech') || topicLower.includes('ai')) {
    baseTags.push("Technology", "Innovation", "Digital India");
  }
  if (topicLower.includes('business') || topicLower.includes('startup')) {
    baseTags.push("Business", "Entrepreneurship", "Indian Economy");
  }
  if (topicLower.includes('exam') || topicLower.includes('job') || topicLower.includes('employment')) {
    baseTags.push("Education", "Career", "Jobs", "Entrance Exams");
  }
  if (topicLower.includes('finance') || topicLower.includes('investment') || topicLower.includes('money')) {
    baseTags.push("Finance", "Investment", "Indian Economy");
  }
  if (topicLower.includes('health') || topicLower.includes('lifestyle')) {
    baseTags.push("Health", "Lifestyle", "Wellness");
  }
  
  // Add topic-specific tag
  const topicTag = topic.split(' ').slice(0, 2).join(' ');
  if (!baseTags.includes(topicTag)) {
    baseTags.push(topicTag);
  }
  
  return baseTags.slice(0, 6);
}

export default { discoverTrendingTopics, generateArticleForTopic };
