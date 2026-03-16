# Session: Tech Stack, Auth & Backend Build
**Date:** 2026-03-16

## Context
Picking up from the concept alignment session. Discussed what v1 work can start early, decided on the core tech stack and authentication strategy, then built the complete backend API.

## Decisions Made

### Tech stack: Node.js + TypeScript (DEC-009)
- Aligns with dev environment (Node 22 in devcontainer)
- Aligns with React/React Native for shared knowledge across frontend and backend
- Large ecosystem for API-heavy services

### Auth: Supabase as Phase 1 platform (DEC-010)
- Supabase provides auth + Postgres + S3-compatible storage in one service
- Auth providers: Google OAuth, Apple Sign-In, email/password
- Fits the $20-50/mo Phase 1 budget
- Standard Postgres underneath — portable if we outgrow Supabase

### Auth providers: Google + Apple + email/password (DEC-011)
- Google: universal, almost every artist/manager has one
- Apple: required for iOS App Store, artists skew iPhone
- Email/password: fallback for label managers with work email
- Skipped for v1: Facebook (declining), Spotify OAuth (listener-focused, doesn't prove catalog ownership)

## What Was Built

### Backend API (PR #2: feature/backend-scaffold)
Complete Node.js + TypeScript backend using Fastify:
- **52 source files**, **34 unit tests** (all passing)
- **10 SQL migrations** for all entities from DATA_MODEL.md
- **Artist API**: auth, tracks, stories (multipart audio upload), dashboard, notifications, CSV catalog import
- **Distribution API**: partner story listing, ISRC lookup, audio redirect
- **Admin API**: moderation queue, partner management, system stats
- **Audio validation**: format (MP3/WAV/AAC), size (10MB), duration (5s-5min), sample rate (44.1kHz+)
- **Webhook dispatch** with async queue and retry (3 attempts)
- **Audit trail** on every story lifecycle event
- **Structured pino logging** with request IDs on every request
- **Storage abstraction** (local filesystem for dev, Supabase Storage for prod)
- **Docker + docker-compose** for local dev

### Supabase Integration
- Migrations run against Supabase Postgres via Management API
- Database seeded: 1 label (Riggs Records), 3 users, 5 tracks, 1 partner
- Created Management API database adapter (devcontainer can't reach Supabase direct Postgres)
- API server tested and confirmed working against live Supabase DB

### Engineering practices added to CLAUDE.md
- Structured logging (pino, log levels, context IDs)
- Testing requirements (test with every PR, real DB, regression tests mandatory)
- Feature workflow (branch per feature, small PRs, checklist)
- Session & regression logging for continuous improvement

## Learnings
- Devcontainer cannot reach Supabase's direct Postgres host (DNS unreachable) or pooler (auth fails). Created a Management API adapter as a workaround. Should resolve the direct connection for production use.
- Supabase Management API `/v1/projects/{ref}/database/query` works well for development but only supports raw SQL (no parameterized queries natively) — the adapter handles parameter interpolation.

## API Test Credentials
- Artist 1: `artist1@test.com` / `password123`
- Artist 2: `artist2@test.com` / `password123`
- Admin: `admin@storyteller.com` / `password123`
- Partner API key: `stk_37d7d1b6957284b44df0d4d85f21804887c477be8cb42d99b32b26cb72921f7a`

## Changes Made
- Added DEC-009, DEC-010, DEC-011 to DECISIONS.md
- Updated ARCHITECTURE.md tech stack from "pending" to decided
- Updated plan.md with implementation phases and checkboxes
- Added Engineering Best Practices to CLAUDE.md
- Built complete backend in `src/`
- Connected to Supabase, ran migrations, seeded data

## Open Items
- Mobile framework decision still open (React Native vs Flutter)
- Cloud provider for Phase 2+ still open (Supabase handles Phase 1)
- Fix direct Postgres connection (need correct password or pooler config)
- GitHub Actions CI pipeline
- Web app (Phase C)
