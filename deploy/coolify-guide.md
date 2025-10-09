# Coolify Deployment Configuration for BlogMastermind
# 
# This file provides guidance for deploying BlogMastermind on Coolify with PM2
# Copy the relevant sections to your Coolify service configuration

# ============================================================================
# SERVICE CONFIGURATION
# ============================================================================

# Base Docker Image: node:18-alpine or node:20-alpine
# Build Command: npm ci && npm run build
# Start Command: chmod +x ./deploy/start-production.sh && ./deploy/start-production.sh

# ============================================================================
# ENVIRONMENT VARIABLES (Copy to Coolify Environment Variables)
# ============================================================================

# Database Configuration
DATABASE_URL=mysql://username:password@db-hostname:3306/database_name
DATABASE_SSL_BYPASS=false
DATABASE_FALLBACK_TO_MEMORY=false

# Server Configuration
PORT=8000
NODE_ENV=production

# AI Agent Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-pro
AGENT_INTERVAL_MS=3600000
AGENT_PUBLISH_IMMEDIATE=false
AGENT_USE_MOCK_GENERATOR=false

# Image Services
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# Email Configuration (Optional)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_ADDRESS=blogs@yourdomain.com

# Authentication
SESSION_SECRET=your_secure_session_secret_here
ADMIN_TOKEN=your_secure_admin_token_here

# Test User Credentials
TEST_ADMIN_USERNAME=testcraftworld
TEST_ADMIN_PASSWORD=your_secure_password_here
TEST_ADMIN_EMAIL=admin@yourdomain.com
TEST_AUTHOR_USERNAME=author
TEST_AUTHOR_PASSWORD=your_secure_password_here
TEST_AUTHOR_EMAIL=author@yourdomain.com

# ============================================================================
# HEALTHCHECK CONFIGURATION
# ============================================================================
# Path: /health
# Expected Response: 200 OK with JSON {"status": "ok"}

# ============================================================================
# VOLUME MOUNTS (Optional)
# ============================================================================
# ./logs:/app/logs - For persistent PM2 logs
# ./public/unsplash-cache:/app/public/unsplash-cache - For cached images

# ============================================================================
# NETWORK CONFIGURATION
# ============================================================================
# Internal Port: 8000
# External Port: 80 or 443 (configured in Coolify)

# ============================================================================
# PM2 PROCESSES THAT WILL RUN
# ============================================================================
# 1. blogmastermind-server    - Main web server (port 8000)
# 2. blogmastermind-worker    - AI content generator (runs every hour)
# 3. blogmastermind-processor - Queue processor (auto-publishes content)

# ============================================================================
# DEPLOYMENT STEPS FOR COOLIFY
# ============================================================================
# 1. Create a new service in Coolify
# 2. Set the source to your Git repository
# 3. Configure environment variables from the list above
# 4. Set build command: npm ci && npm run build
# 5. Set start command: chmod +x ./deploy/start-production.sh && ./deploy/start-production.sh
# 6. Configure health check: /health endpoint
# 7. Deploy the service
# 8. Monitor logs: pm2 logs (accessible via Coolify terminal)

# ============================================================================
# MONITORING AND MAINTENANCE
# ============================================================================
# Check status: pm2 status
# View logs: pm2 logs
# Restart: pm2 restart all
# Update config: pm2 restart ecosystem.config.js

# ============================================================================
# AUTOMATIC FEATURES ENABLED
# ============================================================================
# ✅ AI Worker runs every hour automatically
# ✅ Auto-publish for "Entrance Exams & Jobs" category
# ✅ Queue processing for all generated content
# ✅ Process restart on failure
# ✅ Memory limit monitoring
# ✅ Centralized logging