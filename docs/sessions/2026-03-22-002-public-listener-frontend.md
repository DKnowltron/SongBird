# Session: Public Listener Frontend (Real Build)

**Date:** 2026-03-22
**Branch:** `feature/listener-frontend-real`
**Goal:** Build a real listener-facing frontend in the existing Next.js web app, backed by new public API endpoints.

## Context

The static HTML mockups (PR #10) proved the design. Now converting to real Next.js pages with SSR, SEO meta tags, and live API data. The public frontend turns Storyteller from a pure B2B tool into a two-sided platform.

## What's Being Built

### Backend
- New `src/modules/public/` module with 5 read-only endpoints (no auth)
- GET /v1/public/songs/:isrc — combined track + story + content links
- GET /v1/public/artists/:id — public artist profile + tracks
- GET /v1/public/search?q= — full-text search
- GET /v1/public/featured — featured story
- GET /v1/public/recent — recently added stories

### Frontend
- New `(public)` route group in web app (no auth required)
- 6 pages: landing, song/[isrc], explore, artist/[id], about, for-artists
- Shared components: navbar, footer, audio player, song cards, search
- AuthProvider moved from root layout to (app) layout
- Dark theme scoped to public pages

## Decisions Made
- DEC-016: Public route group with separate layout (no AuthProvider)
- Use ISRC as URL slug for song pages (globally unique, SEO-indexable)
- Featured = most recently verified story (no DB column needed yet)

## Learnings
- (to be filled)
