# Testcraftworld - Production Deployment Guide

This guide will help you deploy Testcraftworld to production using Coolify.

## Prerequisites

- Coolify instance set up and running
- GitHub repository with this codebase
- Domain name (optional but recommended)

## Quick Deployment with Coolify

### 1. Connect Your Repository

1. In your Coolify dashboard, click "Add Service" → "Application"
2. Connect your GitHub repository
3. Select the main branch

### 2. Configure Environment Variables

Set the following environment variables in Coolify:

```bash
# Database Configuration
DATABASE_URL=postgresql://bloguser:your_secure_password@postgres:5432/testcraftworld

# Server Configuration
NODE_ENV=production
PORT=5000

# Admin Token (generate a secure random string)
ADMIN_TOKEN=your_secure_admin_token_here

# Admin User Credentials
TEST_ADMIN_USERNAME=testcraftworld
TEST_ADMIN_PASSWORD=your_secure_admin_password
TEST_ADMIN_EMAIL=blogs_admin@testcraft.in

# Author User Credentials
TEST_AUTHOR_USERNAME=author
TEST_AUTHOR_PASSWORD=your_secure_author_password
TEST_AUTHOR_EMAIL=testcraftworld@testcraft.in

# PostgreSQL Password
POSTGRES_PASSWORD=your_postgres_password
```

### 3. Database Setup

Coolify will automatically create a PostgreSQL database for you. The application will:

1. Run database migrations automatically
2. Create admin and author users on first startup
3. Set up default categories and sample posts

### 4. Deploy

1. Click "Deploy" in Coolify
2. Wait for the build and deployment to complete
3. Access your blog at the provided URL

## Manual Docker Deployment (Alternative)

If you prefer manual Docker deployment:

```bash
# Clone the repository
git clone your-repo-url
cd testcraftworld

# Copy environment file and configure
cp .env.example .env
# Edit .env with your values

# Build and run with Docker Compose
docker-compose up -d
```

## Admin Access

After deployment, you can access the admin dashboard at:
`https://your-domain.com/admin`

**Default Admin Credentials:**
- Username: `testcraftworld`
- Password: (whatever you set in TEST_ADMIN_PASSWORD)

## Database Schema

The application uses the following tables:
- `users` - User accounts with roles (admin, author, reader)
- `posts` - Blog posts with author relationships
- `categories` - Post categories
- `comments` - Post comments
- `post_tags` - Post tags

## Production Features

- ✅ PostgreSQL database storage
- ✅ Automatic admin user creation
- ✅ Health checks
- ✅ Production-optimized Docker image
- ✅ Session-based authentication
- ✅ Automatic database migrations

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correctly formatted
- Check PostgreSQL credentials
- Verify database is running and accessible

### Admin User Not Created
- Check application logs in Coolify
- Ensure environment variables are set correctly
- The admin user is created on first application startup

### Build Failures
- Ensure all dependencies are properly installed
- Check Node.js version compatibility (requires Node 18+)
- Verify build scripts in package.json

## Security Notes

- Change default admin passwords in production
- Use strong, randomly generated ADMIN_TOKEN
- Keep DATABASE_URL secure and don't commit to version control
- Regularly update dependencies for security patches

## Support

For issues or questions, check the application logs in Coolify or create an issue in the repository.