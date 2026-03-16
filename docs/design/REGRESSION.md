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

## Required Test Cases

- **DB connectivity:** API must be able to query Supabase and return data (REG-001)
- **Auth flow:** Login returns valid JWT, JWT grants access to protected routes
- **Track listing:** Authenticated artist can list their tracks with pagination
- **Story lifecycle:** Create draft → publish → verify flow completes without errors
