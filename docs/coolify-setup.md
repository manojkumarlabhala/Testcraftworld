# Coolify Setup Guide (Option A: Managed MySQL)

Use this guide to configure the application with a Coolify-managed MySQL database using an internal hostname.

## 1) Create the MySQL database in Coolify
- In Coolify, add a new Database -> MySQL (or reuse an existing one).
- After provisioning, open the database details:
  - Note the Internal Hostname, Username, Password, and Database name.
  - Ensure the DB and your app will run in the same stack/project/network.

## 2) Update application environment variables
In your app service in Coolify, set the following environment variables based on your DB details:

- DATABASE_URL
  - Format: `mysql://<user>:<password>@<internal-hostname>:3306/<database>?ssl-mode=DISABLED`
  - Example: `mysql://app_user:app_password@coolify-mysql:3306/app_db?ssl-mode=DISABLED`
- DATABASE_SSL_BYPASS: `false` (internal connections typically do not need SSL)
- DATABASE_FALLBACK_TO_MEMORY: `false` (set `true` only temporarily to boot without DB)
- NODE_ENV: `production`
- PORT: `8000`
- ADMIN_TOKEN: set a secure random value
- SESSION_SECRET: set a secure random value

Tip: You can copy values from `.env.example` into Coolify, replacing placeholders.

## 3) Redeploy the application
- Deploy or redeploy your app so it picks up the new environment variables.
- Coolify should start the service; check logs to confirm it connects to MySQL.

## 4) Initialize/ensure schema and seed defaults
Choose one of these options:

- Option A: Use the included GitHub Actions workflow "Ensure Database"
  - Add repository secrets for `DATABASE_URL`, `DATABASE_SSL_BYPASS` (and any other required envs).
  - Manually run the workflow to execute the DB ensure script.

- Option B: Run locally where you can reach the DB
  - Export the same env vars locally, then run:
  - `npm run ensure-db`

The script will create missing tables and seed default users/categories if needed.

## 5) Verify runtime health
- Visit `/api/health` on your app to check it’s running.
- Visit `/api/db-status` to confirm `storage: "database"` and `dbReachable: true`.

## 6) Troubleshooting
- If you see ETIMEDOUT/ENOTFOUND:
  - Ensure the app and DB are in the same Coolify network/stack.
  - Double-check the internal hostname (use the value from the DB details page).
- If SSL errors occur, ensure `ssl-mode=DISABLED` in `DATABASE_URL` and `DATABASE_SSL_BYPASS=false`.
- Use `DATABASE_FALLBACK_TO_MEMORY=true` temporarily to boot the app while fixing DB connectivity (not for production use).

---

Once everything works, keep `DATABASE_FALLBACK_TO_MEMORY=false` for persistent storage.
