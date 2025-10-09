#!/bin/bash

# Health check script for BlogMastermind PM2 processes
# This script verifies that all required services are running

set -e

echo "🔍 Checking BlogMastermind health..."

# Check if PM2 is running
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed"
    exit 1
fi

# Get PM2 status in JSON format
PM2_STATUS=$(pm2 jlist 2>/dev/null || echo "[]")

# Check if server is running
SERVER_RUNNING=$(echo "$PM2_STATUS" | grep -q "blogmastermind-server.*online" && echo "true" || echo "false")
WORKER_RUNNING=$(echo "$PM2_STATUS" | grep -q "blogmastermind-worker.*online" && echo "true" || echo "false")
PROCESSOR_RUNNING=$(echo "$PM2_STATUS" | grep -q "blogmastermind-processor.*online" && echo "true" || echo "false")

echo "📊 Service Status:"
echo "  🌐 Server: $([ "$SERVER_RUNNING" = "true" ] && echo "✅ Running" || echo "❌ Stopped")"
echo "  🤖 Worker: $([ "$WORKER_RUNNING" = "true" ] && echo "✅ Running" || echo "❌ Stopped")"
echo "  ⚙️ Processor: $([ "$PROCESSOR_RUNNING" = "true" ] && echo "✅ Running" || echo "❌ Stopped")"

# Check if web server is responding
if [ "$SERVER_RUNNING" = "true" ]; then
    if curl -f -s http://localhost:${PORT:-8000}/health > /dev/null 2>&1; then
        echo "  🏥 Health Check: ✅ Passing"
    else
        echo "  🏥 Health Check: ❌ Failing"
        exit 1
    fi
fi

# Exit with error if any critical service is down
if [ "$SERVER_RUNNING" = "false" ]; then
    echo "❌ Critical: Server is not running"
    exit 1
fi

if [ "$WORKER_RUNNING" = "false" ]; then
    echo "⚠️ Warning: AI Worker is not running (hourly content generation disabled)"
fi

if [ "$PROCESSOR_RUNNING" = "false" ]; then
    echo "⚠️ Warning: Processor is not running (auto-publishing disabled)"
fi

echo "✅ BlogMastermind health check passed"
exit 0