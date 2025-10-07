# Testcraftworld

A modern, self-hosted blog platform built with React, Express, and PostgreSQL. Features user authentication, role-based access control, and a clean, responsive UI.

## Features

- 🏠 **Self-hosted**: Deploy anywhere with Docker or Coolify
- 👥 **User Management**: Admin and Author roles with different permissions
- 📝 **Blog Writing**: Rich text editor for creating and publishing posts
- 🏷️ **Categories**: 5 predefined categories (Technology, Business, Design, Lifestyle, Marketing) with dedicated pages
- 🔐 **Authentication**: Secure login/registration system
- 📱 **Responsive**: Mobile-friendly design with Tailwind CSS
- ⚡ **Fast**: Built with Vite for quick development and builds
- 🎨 **Modern UI**: Clean interface with shadcn/ui components

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd testcraftworld
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env` and update the database URL if needed.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Create test users (optional):**
   ```bash
   npm run test-users
   ```

5. **Open your browser:**
   Visit [http://localhost:8000](http://localhost:8000)

## Official Website Accounts

The website comes with pre-configured admin and author accounts for content management:

### **Admin Account** (Full Access)
- **Username:** testcraftworld
- **Password:** admin123
- **Email:** blogs_admin@testcraft.in
- **Role:** Administrator (full access to all features, user management, content moderation)

### **Author Account** (Content Creation)
- **Username:** author
- **Password:** author123
- **Email:** testcraftworld@testcraft.in
- **Role:** Author (can create and manage blog posts)

### **Legacy Admin Account**
- **Username:** admin
- **Password:** admin (or ADMIN_TOKEN from .env)
- **Email:** admin@testcraft.com
- **Role:** Administrator (for backward compatibility)

These accounts are automatically created when the server starts and cannot be deleted through the web interface. They provide immediate access to all website functionality for content management and administration.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run test-users` - Create test users
- `npm run reset-users` - Reset all users (admin only)
- `npm run db:push` - Push database schema changes

## Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── ...
├── server/          # Express backend
│   ├── routes.ts    # API routes
│   ├── storage.ts   # Database/storage layer
│   └── ...
├── shared/          # Shared types and schemas
├── scripts/         # Utility scripts
└── .env            # Environment configuration
```

## API Endpoints

### Public
- `GET /api/posts` - Get published posts
- `GET /api/posts/:id` - Get single post
- `GET /api/categories` - Get all categories

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User (Authors)
- `POST /api/user/create-post` - Create new post

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/posts` - List all posts (including drafts)
- `POST /api/admin/create-post` - Create post (admin)
- `POST /api/admin/create-category` - Create category

## Navigation

The website features a clean navigation menu with direct links to category pages:

- **Home** - Latest articles from all categories
- **Technology** - Tech news and trends
- **Business** - Business insights and strategies
- **Design** - Design trends and inspiration
- **Lifestyle** - Lifestyle tips and wellness
- **Marketing** - Marketing strategies and tips
- **About** - About the website
- **Contact** - Contact information

## Deployment

### Coolify (Recommended)
1. Connect your repository to Coolify
2. Set environment variables
3. Deploy!

### Docker
```bash
docker build -t testcraftworld .
docker run -p 8000:8000 -e DATABASE_URL=... testcraftworld
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## License

MIT License - see LICENSE file for details.