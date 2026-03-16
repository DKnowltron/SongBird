# Session: Tech Stack & Auth Decisions
**Date:** 2026-03-16

## Context
Picking up from the concept alignment session. Discussed what v1 work can start early, decided on the core tech stack and authentication strategy.

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

## Early start items identified
Work that's locked in and can begin now:
1. Project scaffolding (Node/TS, Supabase)
2. Database schema/migrations (data model is fully designed)
3. Auth + Artist API CRUD
4. Audio upload + validation pipeline
5. CSV catalog import
6. Distribution API (partner-facing read layer)
7. Webhook notification system

## Changes Made
- Added DEC-009 (Node.js + TypeScript) to DECISIONS.md
- Added DEC-010 (Supabase for Phase 1) to DECISIONS.md
- Added DEC-011 (Auth providers) to DECISIONS.md
- Updated ARCHITECTURE.md tech stack section from "pending" to decided

## Open Items
- Project scaffolding — ready to start
- Mobile framework decision still open (React Native vs Flutter)
- Cloud provider for Phase 2+ still open (Supabase handles Phase 1)
