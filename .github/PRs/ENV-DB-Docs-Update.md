Title: chore(env): placeholder SESSION_SECRET; add DB test scripts and generator; log DATABASE_SSL_BYPASS

Summary
-------
This PR:
- Replaces a committed session secret in `.env.example` with a placeholder and guidance to avoid leaking secrets.
- Adds DB diagnostic scripts to aid in reproducing and debugging database connectivity issues:
  - `scripts/generate-session-secret.sh` - creates a secure base64 session secret for production.
  - `scripts/test-db-connection.cjs` - Neon-based pool tester with retries and exponential backoff.
  - `scripts/test-db-pg.cjs` - direct `pg` client tester.
  - `scripts/test-db-pg-ssl.cjs` - direct `pg` client tester which sets ssl.rejectUnauthorized=false.
- Adds logging to `server/db.ts` to surface `DATABASE_SSL_BYPASS` and help troubleshoot TLS issues.

Why
---
During deployment attempts, the remote DB returned TLS and 503/ECONNRESET style errors. These scripts and the `.env.example` change will help operators and developers diagnose and safely manage secrets.

Testing
-------
- Start the dev server (in-memory) and see health endpoint:

  PORT=5001 NODE_ENV=development npm run dev
  curl -sS http://localhost:5001/api/health

- Run DB testers (assuming a valid `.env` with DATABASE_URL):

  set -a && source .env && set +a
  NODE_TLS_REJECT_UNAUTHORIZED=0 ./scripts/test-db-connection.cjs
  NODE_TLS_REJECT_UNAUTHORIZED=0 ./scripts/test-db-pg.cjs
  ./scripts/test-db-pg-ssl.cjs

Security notes
--------------
- DO NOT commit real secrets. Use the `generate-session-secret.sh` to create a secret and store it in your platform's secret store.

Next steps
----------
- If CI or deployment requires, update Docker/Coolify healthcheck to target `/api/health` on the chosen container port.
- Continue investigating remote DB provider if 503 persists; consider using a local Docker Postgres for staging.

