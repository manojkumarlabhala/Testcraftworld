# AI Agent Configuration Guide

## Overview

The BlogMasterMind AI agent has been enhanced to generate comprehensive, SEO-optimized articles with Indian-focused content. Every article now contains 800+ words with proper heading structure and enhanced SEO optimization.

## Features

### Enhanced Content Generation
- **Minimum 800+ words** (typically 1000-1200 words)
- **Indian-focused content** with local context, examples, and references
- **Proper heading structure** with H2 and H3 sections
- **Enhanced SEO optimization** with keyword targeting
- **Cultural sensitivity** with Indian terminology and expressions

### Content Structure
Each generated article includes:
- SEO-optimized title with primary keywords
- Meta description under 160 characters
- Brief introduction (2-3 sentences)
- 5-6 main sections with H2 headings
- H3 subheadings for better readability
- Short paragraphs (2-4 sentences each)
- Numbered/bulleted lists where appropriate
- Strong conclusion with key takeaways
- 5-8 relevant tags
- Source links for news/announcement topics

### Indian Context Integration
- References to Indian cities, states, and regions
- Indian rupee values for financial topics
- Indian companies, startups, and brands as examples
- Cultural context including festivals and traditions
- Government schemes, policies, and initiatives
- Indian English terminology and expressions

## Configuration

### Environment Variables

```bash
# Required for AI generation
GEMINI_API_KEY=your_gemini_api_key_here

# Optional - enables mock fallback when API fails
AGENT_AUTO_FALLBACK=true
AGENT_USE_MOCK_GENERATOR=true

# Database configuration
DATABASE_URL=your_database_url
DATABASE_FALLBACK_TO_MEMORY=true  # For development without DB
```

### Getting Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

## Usage

### Manual Article Generation

```bash
# Generate a single article
npm run agent

# Test enhanced generation
npm run test-generation
```

### Automatic Hourly Generation (Production)

```bash
# Start PM2 services for automatic execution
npm run agent:pm2:start

# Check status
npm run agent:pm2:status

# View logs
npm run agent:pm2:logs

# Stop services
npm run agent:pm2:stop
```

### Enhance Existing Articles

To update all existing articles with the new enhanced format:

```bash
# Run the enhancement script
npm run enhance-articles
```

This script will:
- Find all existing articles
- Skip already enhanced articles (with Indian context)
- Generate new enhanced content
- Preserve existing metadata (category, images, publication status)
- Update articles with 800+ words and proper structure

## Article Categories

The system automatically categorizes articles into:
- **Technology**: AI, tech trends, software, hardware
- **Business**: Startups, entrepreneurship, economy
- **Design**: UI/UX, graphic design, web design
- **Lifestyle**: Health, wellness, personal development
- **Marketing**: Digital marketing, advertising, branding
- **News**: Current events, announcements, updates
- **Others**: Fallback for undefined content

## Production Deployment

### Coolify Deployment

1. **Prepare Environment**:
   ```bash
   # Copy deployment scripts
   chmod +x ./deploy/start-production.sh
   chmod +x ./deploy/health-check.sh
   ```

2. **Set Environment Variables in Coolify**:
   ```
   NODE_ENV=production
   GEMINI_API_KEY=your_api_key
   DATABASE_URL=your_database_url
   AGENT_AUTO_FALLBACK=true
   ```

3. **Deploy with PM2**:
   ```bash
   npm run deploy:production
   ```

### Health Monitoring

```bash
# Check deployment health
npm run deploy:health

# View PM2 status
pm2 status

# View logs
pm2 logs blogmastermind-agent
```

## Testing

### Test Enhanced Generation

```bash
# Test with sample topics
npx tsx scripts/test-enhanced-generation.ts

# Test with mock fallback (no API key needed)
AGENT_AUTO_FALLBACK=true npx tsx scripts/test-enhanced-generation.ts
```

### Verify Article Quality

Enhanced articles should meet these criteria:
- ✅ 800+ words (typically 1000+ words)
- ✅ Indian context and references
- ✅ Proper H2/H3 heading structure
- ✅ SEO-optimized title and meta description
- ✅ Relevant tags (5-8 tags)
- ✅ Cultural sensitivity and local terminology

## Troubleshooting

### Common Issues

1. **API Key Invalid**:
   ```
   Error: 403 Forbidden - Method doesn't allow unregistered callers
   ```
   - Solution: Verify GEMINI_API_KEY is correct and has API access

2. **Database Connection**:
   ```
   DATABASE_URL is not set
   ```
   - Solution: Set DATABASE_FALLBACK_TO_MEMORY=true for development

3. **Short Articles**:
   - The mock fallback generates 1000+ word articles
   - Real API will generate even longer, more detailed content

4. **Missing Indian Context**:
   - Enhanced prompt specifically requests Indian examples
   - Articles include references to Indian cities, companies, and culture

### Support

For issues or questions:
1. Check the logs: `npm run agent:pm2:logs`
2. Test generation: `npm run test-generation`
3. Verify environment variables are set correctly
4. Ensure API key has proper permissions

## Performance

- **Generation Time**: 10-30 seconds per article (depending on topic complexity)
- **Content Quality**: Consistently 800+ words with proper structure
- **SEO Score**: Optimized titles, meta descriptions, and keyword usage
- **Indian Relevance**: All articles include local context and examples

## Next Steps

1. **Set up API key** for production-quality content
2. **Run enhancement script** to update existing articles
3. **Deploy to Coolify** for automatic hourly generation
4. **Monitor performance** with health checks and logs