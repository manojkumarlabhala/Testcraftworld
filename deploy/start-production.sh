#!/bin/bash

# Production deployment script for BlogMastermind with PM2
# This script sets up and starts the application with all services

set -e

echo "🚀 Starting BlogMastermind production deployment..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🔨 Building application..."
npm run build

# Ensure database is ready
echo "🗄️ Ensuring database is ready..."
npm run ensure-db || echo "⚠️ Database setup failed, but continuing..."

# Stop any existing PM2 processes
echo "🛑 Stopping existing PM2 processes..."
pm2 stop ecosystem.config.cjs || echo "No existing processes to stop"

# Start services with PM2
echo "🎯 Starting services with PM2..."
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list for auto-restart on reboot
echo "💾 Saving PM2 process list..."
pm2 save

# Setup PM2 to start on system boot (if not already done)
echo "🔄 Setting up PM2 startup..."
pm2 startup || echo "PM2 startup already configured or not supported"

# Show status
echo "📊 PM2 Status:"
pm2 status

echo "✅ BlogMastermind is now running in production!"
echo "📈 Web server: Running on port ${PORT:-8000}"
echo "🤖 AI Worker: Running with ${AGENT_INTERVAL_MS:-3600000}ms interval ($(( ${AGENT_INTERVAL_MS:-3600000} / 60000 )) minutes)"
echo "⚙️ Processor: Running and ready to process queue"
echo ""
echo "📋 Useful commands:"
echo "  pm2 status                 - Show process status"
echo "  pm2 logs                   - Show all logs"
echo "  pm2 logs blogmastermind-worker - Show worker logs"
echo "  pm2 restart all            - Restart all processes"
echo "  pm2 stop all               - Stop all processes"
echo "  pm2 delete all             - Delete all processes"