#!/usr/bin/env bash
set -euo pipefail

# Coolify-friendly deploy script
# Usage: this script is safe to run from Coolify's "Start Command" or via SSH on the server.

echo "📦 Installing dependencies (production)..."
# Use npm ci with --omit=dev for modern npm
npm ci --omit=dev

echo "🔨 Building application..."
npm run build

echo "🗄 Ensuring DB (best-effort)..."
npm run ensure-db || echo "⚠️ ensure-db failed (continuing)"

echo "📁 Creating logs directory..."
mkdir -p logs

echo "🛑 Stopping existing PM2 processes (if any)..."
npx pm2 stop ecosystem.config.cjs --silent || true

echo "▶️ Starting services with PM2 (ecosystem.config.cjs)..."
npx pm2 start ecosystem.config.cjs --env production

echo "💾 Saving PM2 process list..."
npx pm2 save

echo "✅ Deployment completed."
echo "Run 'npx pm2 status' or 'npx pm2 logs <proc>' to inspect processes."

exit 0
