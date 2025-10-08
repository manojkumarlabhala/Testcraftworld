import "dotenv/config";

// Allow connecting to databases using self-signed certificates
// In development: always bypass SSL validation for easier debugging
// In production: bypass only if explicitly allowed via environment variable
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  // optional runtime notice
  // console.warn intentionally left as log to surface in dev logs
  // so the developer knows TLS validation is relaxed.
  // eslint-disable-next-line no-console
  console.warn("Relaxing TLS certificate validation for development (NODE_TLS_REJECT_UNAUTHORIZED=0)");
} else if (process.env.DATABASE_SSL_BYPASS === "true") {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  // eslint-disable-next-line no-console
  console.warn("WARNING: Bypassing SSL certificate validation for database connection in production");
}

import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Debug: Check if environment variables are loaded
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if ((app as any).get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
  const serverInstance = server.listen({
    port,
    host,
  }, () => {
    log(`serving on port ${port}`);
    console.log(`Server is listening on http://${host}:${port}`);
  }).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });

  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    serverInstance.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    serverInstance.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
})();
