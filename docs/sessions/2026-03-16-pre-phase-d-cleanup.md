# 2026-03-16 — Pre-Phase D: WebM Support + Deployment Config

## Context
Phases A, B, and C are complete. Before Phase D (mobile), needed to fix WebM audio support and prepare deployment config.

## What was built

### WebM Audio Support (PR #5, merged)
- Added `audio/webm` to backend audio validator's allowed MIME types and extensions
- Updated Supabase Storage bucket to accept WebM uploads
- Updated design docs (DESIGN.md, plan.md) to list WebM as accepted format

### Deployment Configuration
- `DEPLOY.md` — comprehensive deployment guide for API (Railway/Render/Fly.io) and web app (Vercel/Docker)
- `web/Dockerfile` — standalone Next.js Docker image with build args for env vars
- `web/next.config.ts` — enabled `output: "standalone"` for Docker builds
- `railway.toml` — Railway deployment config for the API service
- Updated CI (`ci.yml`) to run API tests AND web app build in parallel jobs

### CI Improvements
- Split CI into two parallel jobs: `api-lint-and-test` and `web-build`
- Web build job verifies the Next.js app compiles with placeholder env vars
- Both jobs run on every PR and push to feature branches

## Decisions made
- **Deployment is blocked on user action**: PaaS account setup (Railway/Render/Fly.io) and Vercel connection require manual configuration. All config files are ready so deployment is a click-through process once accounts are set up.
- **Vercel recommended for web app**: Optimized for Next.js, free tier works for Phase 1, automatic deployments on merge.

## Regressions found
None.

## PRs
- **PR #5** — WebM audio support (merged)
- **PR #6** — Deployment config + CI improvements (pending)

## Learnings
- Next.js 16 `output: "standalone"` creates a self-contained `server.js` that includes all dependencies. The Dockerfile copies `.next/standalone`, `.next/static`, and `public/` — nothing else needed.
- Railway supports `railway.toml` for configuring health checks, restart policies, and build settings.

## Open items
- Actually deploy (needs PaaS accounts — Railway, Vercel, etc.)
- CORS should be locked down to web app domain in production
- Phase D: Mobile app
