module.exports = {
  apps: [
    {
      name: 'blogmastermind-server',
      script: 'server/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader tsx',
      instances: 1,
      autorestart: true,
      restart_delay: 5000,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8000
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log'
    },
    {
      name: 'blogmastermind-worker',
      script: 'scripts/ai-agent-worker.ts',
      interpreter: 'node',
      interpreter_args: '--loader tsx',
      instances: 1,
      autorestart: true,
      restart_delay: 10000,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        AGENT_INTERVAL_MS: process.env.AGENT_INTERVAL_MS || 3600000, // 1 hour by default
        AGENT_PUBLISH_IMMEDIATE: process.env.AGENT_PUBLISH_IMMEDIATE || 'false'
      },
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      log_file: './logs/worker-combined.log'
    },
    {
      name: 'blogmastermind-processor',
      script: 'scripts/ai-agent-processor.ts',
      interpreter: 'node',
      interpreter_args: '--loader tsx',
      instances: 1,
      autorestart: true,
      restart_delay: 15000,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        AGENT_PUBLISH_IMMEDIATE: process.env.AGENT_PUBLISH_IMMEDIATE || 'false'
      },
      error_file: './logs/processor-error.log',
      out_file: './logs/processor-out.log',
      log_file: './logs/processor-combined.log'
    }
  ]
};
