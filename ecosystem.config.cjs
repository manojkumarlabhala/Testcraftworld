module.exports = {
  apps: [
    {
      name: 'blogmastermind-server',
      // Use the compiled server bundle for production
      script: 'dist/index.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8000,
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log',
    },
    {
      name: 'blogmastermind-worker',
      // Use compiled worker script in production
      script: 'dist/scripts/ai-agent-worker.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      env_production: {
        NODE_ENV: 'production',
        AGENT_INTERVAL_MS: process.env.AGENT_INTERVAL_MS || 3600000,
        AGENT_PUBLISH_IMMEDIATE: process.env.AGENT_PUBLISH_IMMEDIATE || 'false',
      },
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      log_file: './logs/worker-combined.log',
    },
    {
      name: 'blogmastermind-processor',
      script: 'dist/scripts/ai-agent-processor.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      env_production: {
        NODE_ENV: 'production',
        AGENT_PUBLISH_IMMEDIATE: process.env.AGENT_PUBLISH_IMMEDIATE || 'false',
      },
      error_file: './logs/processor-error.log',
      out_file: './logs/processor-out.log',
      log_file: './logs/processor-combined.log',
    },
  ],
};
