# StorySong — Regression Tracker

## Known Issues & Fixes

### REG-001: Devcontainer cannot connect to Supabase Postgres directly
- **Date found:** 2026-03-16
- **Severity:** medium
- **Description:** The API server cannot establish a direct Postgres connection to Supabase from inside the devcontainer. The pooler (`aws-0-us-east-1.pooler.supabase.com`) returns "Tenant or user not found" and the direct host (`db.ocftwwotizzopooxwgyi.supabase.co`) fails DNS resolution.
- **Root cause:** Two issues: (1) the devcontainer's network cannot resolve Supabase's direct DB hostname, (2) the pooler connection may have a password mismatch — the DB password contains special characters (`#`, `!`) which may not have been set correctly during project creation, or the pooler username format is wrong.
- **Fix (workaround):** Created a Supabase Management API database adapter in `src/db/connection.ts`. When `DATABASE_URL` is not set, the app routes SQL queries through `api.supabase.com/v1/projects/{ref}/database/query`. This works but adds latency per query and doesn't support true parameterized queries (parameters are interpolated into SQL strings).
- **Fix (permanent, TODO):** Reset the Supabase DB password from the dashboard to something without special characters, then test the pooler connection string. Alternatively, configure devcontainer networking to reach `db.*.supabase.co`.
- **Test case:** `curl http://localhost:3000/v1/tracks -H "Authorization: Bearer <token>"` should return seeded tracks. Integration test should query the DB and get results.
- **Files affected:** `src/db/connection.ts`, `src/config/env.ts`, `.env`

### REG-002: migrate.ts fails in Management API mode
- **Date found:** 2026-03-16
- **Severity:** medium
- **Description:** Running `npm run migrate` fails with "Direct pool access not available in Management API mode" because `migrate.ts` calls `getPool()` directly instead of using the `query()` abstraction.
- **Root cause:** The original `migrate.ts` was written for direct Postgres connections only — it used `pool.connect()`, `client.query('BEGIN')`, and transactions. The Management API adapter doesn't expose a pool or support transactions.
- **Fix:** Rewrote `migrate.ts` to use `query()` instead of `getPool()`. Migrations split SQL by semicolons and execute each statement individually. Transaction wrapping removed (DDL is auto-committed in Postgres anyway).
- **Test case:** `npm run migrate` succeeds when only `SUPABASE_PROJECT_REF` and `SUPABASE_ACCESS_TOKEN` are set (no `DATABASE_URL`). New migration files are applied and tracked in `_migrations` table.
- **Files affected:** `src/db/migrate.ts`

### REG-003: OAuth callback crashes for existing artists without supabase_user_id
- **Date found:** 2026-03-16
- **Severity:** high
- **Description:** When a Supabase Auth user logs in via OAuth and their email matches an existing artist (e.g. from seed data), the OAuth callback tries to INSERT a new artist record, hitting a unique constraint violation on `email`. The 500 error blocks login entirely.
- **Root cause:** `handleOAuthCallback`, `loginWithSupabase`, and `verifySupabaseToken` only looked up artists by `supabase_user_id`. Artists created before Supabase Auth integration (seed data, local auth) have no `supabase_user_id`, so the lookup returned empty and the code tried to create a duplicate.
- **Fix:** All three functions now fall back to email lookup when `supabase_user_id` lookup returns no results. If found by email, the `supabase_user_id` is backfilled via UPDATE, linking the accounts for future lookups.
- **Test case:** Login with a Supabase Auth account whose email matches a pre-existing artist without `supabase_user_id`. Should succeed and link the accounts. Subsequent logins should use the fast `supabase_user_id` path.
- **Files affected:** `src/modules/auth/auth.service.ts`, `src/middleware/auth.ts`

## Required Test Cases

- **DB connectivity:** API must be able to query Supabase and return data (REG-001)
- **Auth flow:** Login returns valid JWT, JWT grants access to protected routes
- **Track listing:** Authenticated artist can list their tracks with pagination
- **Story lifecycle:** Create draft → publish → verify flow completes without errors
