#!/bin/bash

# Production startup script
# Ensures database is ready and runs migrations before starting the app

set -e

echo "Waiting for database to be ready..."
# Wait for PostgreSQL to be ready
until pg_isready -h postgres -U bloguser -d testcraftworld 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready! Running migrations..."
npm run db:push

echo "Starting Testcraftworld application..."
exec npm start