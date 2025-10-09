import { storage } from "./storage";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

const samplePosts = [
  {
    title: "The Future of Artificial Intelligence: Trends and Predictions for 2024",
    slug: "future-ai-trends-2024",
    content: `# The Future of Artificial Intelligence: Trends and Predictions for 2024

Artificial Intelligence continues to revolutionize industries across the globe. As we stand on the brink of 2024, several groundbreaking trends are shaping the AI landscape.

## Key Trends Shaping AI in 2024

### 1. Multimodal AI Systems
The integration of multiple data types - text, images, audio, and video - is creating more sophisticated AI systems capable of understanding context in ways previously impossible.

### 2. Edge Computing and AI
With the proliferation of IoT devices, AI processing is moving closer to data sources, enabling real-time decision-making and reducing latency.

### 3. Ethical AI and Responsible Development
Organizations are increasingly focusing on developing AI systems that are transparent, fair, and accountable.

### 4. AI in Healthcare
From drug discovery to personalized medicine, AI is transforming healthcare delivery and patient outcomes.

## Predictions for the Coming Year

The next 12 months will see unprecedented growth in AI adoption across sectors. Companies that embrace AI strategically will gain significant competitive advantages.

*Published by Testcraft World Admin*`,
    excerpt: "Explore the cutting-edge trends and predictions shaping the future of artificial intelligence in 2024 and beyond.",
    published: true,
    categoryId: "technology",
    tags: ["AI", "Machine Learning", "Future Tech", "Innovation"]
  },
  {
    title: "Building a Successful Startup: Essential Strategies for Entrepreneurs",
    slug: "building-successful-startup-strategies",
    content: `# Building a Successful Startup: Essential Strategies for Entrepreneurs

Starting a business is one of the most challenging yet rewarding endeavors. Success requires careful planning, execution, and adaptation.

## Core Principles of Startup Success

### 1. Problem-Solution Fit
Identify real problems that customers are willing to pay to solve. Conduct thorough market research and validate your assumptions.

### 2. Build a Strong Team
Surround yourself with talented individuals who share your vision and complement your skills.

### 3. Financial Management
Maintain a clear understanding of your burn rate, runway, and key financial metrics.

### 4. Customer-Centric Approach
Focus relentlessly on customer needs and feedback to guide product development.

## Scaling Your Business

Once you've achieved product-market fit, focus on scaling operations while maintaining quality and customer satisfaction.

*Published by Testcraft World Admin*`,
    excerpt: "Learn the essential strategies and principles that successful entrepreneurs use to build and scale their startups.",
    published: true,
    categoryId: "business",
    tags: ["Entrepreneurship", "Startup", "Business Strategy", "Growth"]
  },
  {
    title: "Modern Web Design Principles: Creating User-Centric Digital Experiences",
    slug: "modern-web-design-principles",
    content: `# Modern Web Design Principles: Creating User-Centric Digital Experiences

In today's digital landscape, web design goes beyond aesthetics. It's about creating meaningful connections between users and digital products.

## Fundamental Design Principles

### 1. User Experience First
Design with the user journey in mind. Every element should serve a purpose and enhance usability.

### 2. Mobile-First Approach
With mobile traffic surpassing desktop, responsive design is no longer optional - it's essential.

### 3. Accessibility Matters
Inclusive design ensures your website works for everyone, regardless of abilities or assistive technologies.

### 4. Performance Optimization
Fast-loading websites improve user satisfaction and search engine rankings.

## Emerging Trends

Stay ahead of the curve with micro-interactions, dark mode, and AI-powered personalization.

*Published by Testcraft World Admin*`,
    excerpt: "Discover the core principles of modern web design that create exceptional user experiences and drive business results.",
    published: true,
    categoryId: "design",
    tags: ["Web Design", "UX", "UI", "Responsive Design"]
  },
  {
    title: "Achieving Work-Life Balance in the Digital Age",
    slug: "work-life-balance-digital-age",
    content: `# Achieving Work-Life Balance in the Digital Age

The boundary between work and personal life has become increasingly blurred. Here are practical strategies for maintaining balance in our always-connected world.

## Setting Boundaries

### 1. Define Work Hours
Establish clear work hours and stick to them. Use tools to automatically block work communications outside these hours.

### 2. Create Physical Separation
Designate specific spaces for work and relaxation to mentally separate professional and personal activities.

### 3. Digital Detox
Regularly disconnect from devices to recharge and focus on meaningful offline activities.

## Building Healthy Habits

Develop routines that support both productivity and well-being. Regular exercise, quality sleep, and social connections are essential.

*Published by Testcraft World Admin*`,
    excerpt: "Practical strategies for maintaining work-life balance in an increasingly connected digital world.",
    published: true,
    categoryId: "lifestyle",
    tags: ["Work-Life Balance", "Wellness", "Productivity", "Digital Detox"]
  },
  {
    title: "Content Marketing Mastery: Strategies That Drive Results",
    slug: "content-marketing-mastery-strategies",
    content: `# Content Marketing Mastery: Strategies That Drive Results

Effective content marketing builds trust, authority, and long-term customer relationships. Here's how to create content that converts.

## Content Strategy Fundamentals

### 1. Audience Research
Understand your target audience's pain points, preferences, and content consumption habits.

### 2. Content Planning
Create a content calendar that aligns with business goals and audience needs.

### 3. Quality Over Quantity
Focus on creating high-value content that provides genuine solutions and insights.

### 4. Multi-Channel Distribution
Leverage various platforms to maximize reach and engagement.

## Measuring Success

Track relevant metrics like engagement rates, conversion rates, and customer lifetime value to optimize your content strategy.

*Published by Testcraft World Admin*`,
    excerpt: "Master the art of content marketing with proven strategies that build authority and drive measurable business results.",
    published: true,
    categoryId: "marketing",
    tags: ["Content Marketing", "SEO", "Social Media", "Strategy"]
  },
  {
    title: "Breaking News: India's Digital Revolution Reaches Rural Areas",
    slug: "india-digital-revolution-rural-areas",
    content: `# Breaking News: India's Digital Revolution Reaches Rural Areas

In a groundbreaking development, India's digital infrastructure expansion has reached unprecedented levels, bringing high-speed internet and digital services to remote rural communities across the nation.

## Major Developments

### Digital Infrastructure Expansion
The government's ambitious digital India program has successfully established fiber optic networks in over 250,000 villages, connecting rural populations to the digital economy.

### Banking Revolution
Digital payment systems and mobile banking services have registered a 300% increase in rural adoption rates over the past year, transforming how rural India conducts financial transactions.

### Educational Impact
Online education platforms are now accessible to students in remote areas, bridging the educational gap between urban and rural populations.

## Economic Implications

This digital transformation is expected to boost rural economies by enabling:
- Direct market access for farmers
- Remote work opportunities
- Digital entrepreneurship
- Access to government services online

The initiative represents one of the world's largest rural digitization projects, positioning India as a global leader in inclusive digital transformation.

*Published by Testcraft World Admin*`,
    excerpt: "India's digital infrastructure expansion reaches rural areas, bringing unprecedented connectivity and economic opportunities to remote communities.",
    published: true,
    categoryId: "news",
    tags: ["Digital India", "Rural Development", "Technology", "Economic Growth"]
  },
  {
    title: "Understanding Cryptocurrency: A Beginner's Guide to Digital Assets",
    slug: "understanding-cryptocurrency-beginners-guide",
    content: `# Understanding Cryptocurrency: A Beginner's Guide to Digital Assets

Cryptocurrency has revolutionized the financial landscape, offering new opportunities and challenges. This comprehensive guide explains the fundamentals of digital currencies for beginners.

## What is Cryptocurrency?

Cryptocurrency is a digital or virtual currency secured by cryptography, making it nearly impossible to counterfeit. Unlike traditional currencies, cryptocurrencies operate on decentralized networks based on blockchain technology.

## Key Concepts

### Blockchain Technology
A distributed ledger technology that maintains a continuously growing list of records, called blocks, linked and secured using cryptography.

### Digital Wallets
Software programs that store private and public keys and interact with various blockchain networks to enable users to send, receive, and monitor their digital currency balance.

### Mining and Staking
Different methods of validating transactions and securing the network while earning rewards.

## Popular Cryptocurrencies

- **Bitcoin (BTC)**: The first and most well-known cryptocurrency
- **Ethereum (ETH)**: Platform for smart contracts and decentralized applications
- **Binance Coin (BNB)**: Native token of the Binance exchange

## Investment Considerations

Before investing in cryptocurrency, consider:
- Market volatility and risk tolerance
- Regulatory environment
- Security best practices
- Long-term vs. short-term investment goals

## Getting Started Safely

1. Research thoroughly before investing
2. Use reputable exchanges and wallets
3. Start with small amounts
4. Never invest more than you can afford to lose
5. Keep your private keys secure

*Published by Testcraft World Admin*`,
    excerpt: "A comprehensive beginner's guide to understanding cryptocurrency, blockchain technology, and digital asset investment basics.",
    published: true,
    categoryId: "others",
    tags: ["Cryptocurrency", "Blockchain", "Digital Assets", "Investment", "Finance"]
  }
];

export async function createSamplePosts() {
  try {
    console.log('Creating sample blog posts...');

    // Get the admin user for authoring posts
    const admin = await storage.getUserByUsername('testcraftworld');
    if (!admin) {
      console.error('Admin user not found. Please ensure the admin user is created first.');
      return;
    }

    // Get categories
    const categories = await storage.getCategories();
    const categoryMap: { [key: string]: string } = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    for (const postData of samplePosts) {
      // Check if post already exists
      const existingPost = await storage.getPostBySlug(postData.slug);
      if (existingPost) {
        console.log(`Post "${postData.title}" already exists, skipping...`);
        continue;
      }

      const categoryId = categoryMap[postData.categoryId];
      if (!categoryId) {
        console.error(`Category "${postData.categoryId}" not found, skipping post "${postData.title}"`);
        continue;
      }

      const post = await storage.createPost({
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        excerpt: postData.excerpt,
        published: postData.published,
        categoryId: categoryId,
        authorId: admin.id
      });

      // Add tags to the post
      for (const tag of postData.tags) {
        await storage.addTagToPost({
          postId: post.id,
          tag: tag
        });
      }

      console.log(`Created post: ${post.title}`);
    }

    console.log('Sample posts creation completed!');
  } catch (error) {
    console.error('Error creating sample posts:', error);
  }
}