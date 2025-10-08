Database setup helper

This project includes a small helper to create missing tables and seed default categories/users.

Usage

1. Ensure your environment variables are set (e.g., via `.env.production` or your CI environment):

- DATABASE_URL
- PORT (optional)
- NODE_ENV=production
- TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD, TEST_ADMIN_EMAIL (optional)
- TEST_AUTHOR_USERNAME, TEST_AUTHOR_PASSWORD, TEST_AUTHOR_EMAIL (optional)

2. Run the helper:

```bash
# builds not required; run directly with tsx
npx tsx scripts/ensure-db.ts
# or via npm script
npm run ensure-db
```

This will connect to the database defined in `DATABASE_URL`, create the tables if missing, and seed default categories and admin/author users.

Notes

- The script will fail if the database is unreachable (network/credentials). If you prefer the app to auto-fallback to memory when the DB is unreachable, set `DATABASE_FALLBACK_TO_MEMORY=true` in your environment (not recommended for production unless you understand the implications).

- To check at runtime whether the app is using the database or memory fallback, use the `/api/db-status` endpoint (GET). It returns JSON like `{ storage: 'database'|'memory', dbReachable: boolean }`.

Security note: enabling `DATABASE_FALLBACK_TO_MEMORY=true` in production will cause data not to be persisted if the DB is unreachable. Use only for short-term recoveries or staging environments.
