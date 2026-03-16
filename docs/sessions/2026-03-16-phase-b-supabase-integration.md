# 2026-03-16 — Phase B: Supabase Integration

## Context
Phase A was complete on `feature/backend-scaffold` (PR #2) but not yet merged. This session completed CI setup, merged Phase A, then built and merged Phase B (Supabase Auth + Storage).

## What was built

### CI Pipeline (Phase A9)
- GitHub Actions workflow: lint + test on PR/push with Postgres 16 service container
- Migrated ESLint from legacy `--ext` flag to v9 flat config
- **PR #2 merged to main** (squash merge)

### Supabase Auth Integration
- `src/services/supabase.ts` — Admin and public Supabase clients (singleton pattern)
- Auth middleware auto-detects Supabase JWT vs local JWT based on env config
- Auth service routes through Supabase `signUp`/`signInWithPassword` when configured
- New endpoints: `POST /v1/auth/refresh`, `POST /v1/auth/oauth/callback`
- OAuth callback auto-creates artist profile from Supabase user metadata
- Falls back to local JWT auth when Supabase env vars aren't set (CI/dev compatibility)

### Supabase Storage Integration
- `SupabaseStorageService` implementing existing `StorageService` interface
- Created `story-audio` bucket (private, 10MB limit, audio MIME types only)
- Signed URL generation for time-limited downloads
- Falls back to `LocalStorageService` when `STORAGE_TYPE=local`

### Database Changes
- Migration 011: `supabase_user_id UUID UNIQUE` column on artists, `password_hash` made nullable
- Fixed `migrate.ts` to work with Management API mode (was using `getPool()` directly — see REG-002)
- Backfilled `_migrations` tracking table for migrations 001–010

## Decisions made
- **Dual auth mode**: Supabase Auth in production, local JWT in dev/CI. Detected by checking `isSupabaseConfigured()` at runtime, not build time.
- **password_hash for Supabase users**: Set to `'supabase-managed'` placeholder (nullable column, but existing rows have NOT NULL from before migration).
- **Storage bucket config**: Private bucket, audio MIME types only (`audio/mpeg`, `audio/wav`, `audio/aac`, `audio/mp4`), 10MB limit matching API validation.

## Regressions found
- **REG-002**: `migrate.ts` used `getPool()` which throws in Management API mode. Fixed by switching to `query()` and splitting SQL statements. See REGRESSION.md.

## PRs
- **PR #2** — Backend foundation (merged, squash)
- **PR #3** — Supabase Auth + Storage (merged, squash)

## Learnings
- Supabase Management API doesn't support transactions (`BEGIN`/`COMMIT`), so migrations run each statement individually. This is fine for DDL but means multi-statement migrations aren't atomic in Management API mode.
- The `signInWithPassword` call from the admin client works for getting tokens during registration — no need for a separate public client call.
- ESLint v9 dropped the `--ext` flag entirely; flat config is the only way forward.

## Open items
- Deploy API to PaaS (last Phase B item)
- Phase C: Next.js web app
- REG-001 permanent fix still pending (direct Postgres connection)
