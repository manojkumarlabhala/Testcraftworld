# Deployment notes for BlogMastermind

This repository includes scripts and configs to run the app in production.

Quick steps (Docker):

1. Build the Docker image

```sh
docker build -t blogmastermind:latest .
```

2. Run the container (example):

```sh
docker run -d \
  -p 8000:8000 \
  --name blogmastermind \
  -e NODE_ENV=production \
  -e DATABASE_URL="mysql://user:pass@host:3306/dbname" \
  -e ADMIN_TOKEN="your_admin_token" \
  blogmastermind:latest
```

PM2-based deploy (systemd):

1. Copy `ecosystem.config.js` and `deploy/start-production.sh` to the server
2. Ensure Node.js >= 20 is installed
3. Run `./deploy/start-production.sh` as a deploy user

Systemd service for agent worker: `deploy/blogmastermind-agent.service`

Health checks:
- HTTP: GET /api/health

Notes:
- The Dockerfile builds the app during image build and runs `npm start` in production.
- For smaller images, consider using a multi-stage build with a build container that outputs the `dist/` and then a runtime image that only copies `dist` + node_modules.
