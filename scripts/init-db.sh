#!/bin/bash

# Database initialization script for production
# This script runs database migrations and ensures admin user exists

set -e

echo "Running database migrations..."
npm run db:push

echo "Database initialization complete!"

# Note: Admin user creation happens automatically in the application startup
# when the server starts for the first time