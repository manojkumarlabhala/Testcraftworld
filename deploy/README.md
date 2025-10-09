# BlogMastermind PM2 Production Deployment

## 🚀 Quick Setup for Coolify

### 1. Coolify Service Configuration

**Service Type:** Node.js Application
**Build Command:** `npm ci && npm run build`
**Start Command:** `npm run deploy:production`
**Health Check:** `/health` endpoint
**Port:** `8000`

### 2. Environment Variables

Copy these to your Coolify environment variables:

```bash
# Required
DATABASE_URL=mysql://username:password@host:port/database
GEMINI_API_KEY=your_gemini_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
SESSION_SECRET=your_secure_session_secret

# AI Agent Configuration (Optional - defaults provided)
AGENT_INTERVAL_MS=3600000          # 1 hour = 3600000ms
AGENT_PUBLISH_IMMEDIATE=false      # Set to true for immediate publishing
AGENT_USE_MOCK_GENERATOR=false     # Set to true for testing without Gemini

# Server Configuration
PORT=8000
NODE_ENV=production
```

### 3. What Gets Deployed

When you deploy, PM2 will automatically start these services:

- **🌐 Web Server** (`blogmastermind-server`) - Main application on port 8000
- **🤖 AI Worker** (`blogmastermind-worker`) - Generates content every hour
- **⚙️ Processor** (`blogmastermind-processor`) - Processes and publishes queued content

### 4. AI Agent Features

✅ **Automatic Hourly Execution:** AI worker runs every hour (configurable via `AGENT_INTERVAL_MS`)
✅ **Priority Topics:** "Entrance Exams & Jobs" content is prioritized and auto-published
✅ **Queue Management:** Generated content goes to admin queue for review (unless auto-publish is enabled)
✅ **Error Recovery:** All processes auto-restart on failure
✅ **Resource Management:** Memory limits and restart delays configured

### 5. Monitoring Commands

Once deployed, you can monitor via Coolify terminal:

```bash
# Check status
npm run agent:pm2:status

# View logs
npm run agent:pm2:logs

# Restart services
npm run agent:pm2:restart

# Health check
npm run deploy:health
```

### 6. Admin Controls

Access the admin dashboard at `your-domain.com/admin` to:
- Toggle auto-publish per category
- Review AI-generated content in the queue
- Monitor publishing activity
- Manage API keys and settings

### 7. Customization

**Change AI Generation Interval:**
Set `AGENT_INTERVAL_MS` environment variable:
- 30 minutes: `1800000`
- 1 hour: `3600000` (default)
- 2 hours: `7200000`
- 6 hours: `21600000`

**Enable Immediate Publishing:**
Set `AGENT_PUBLISH_IMMEDIATE=true` to publish all generated content immediately without admin review.

**Priority Categories:**
Modify `scripts/ai-agent-worker.ts` to add more auto-publish categories or change the priority topic.

## 🔧 Troubleshooting

**If AI worker isn't generating content:**
1. Check `GEMINI_API_KEY` is set correctly
2. Verify database connection
3. Check worker logs: `pm2 logs blogmastermind-worker`

**If content isn't auto-publishing:**
1. Check admin dashboard for queue items
2. Verify processor is running: `pm2 status`
3. Check category auto-publish settings in admin

**Database issues:**
1. Ensure `DATABASE_URL` is correct
2. Verify database has required tables
3. Run `npm run ensure-db` if needed

## 📊 Production Metrics

The system will:
- Generate 1-5 articles per hour (configurable)
- Auto-publish entrance exam and job-related content
- Queue other content for admin review
- Restart processes automatically if they crash
- Log all activity for monitoring