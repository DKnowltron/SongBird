# StorySong — Plan

## What We're Building

**Storyteller** is a story distribution platform for the music industry. Artists record audio narratives about their songs, and Storyteller distributes those stories to streaming platforms (Spotify, Apple Music, etc.) as a new content type — the same way music distributors deliver tracks and metadata today.

## Tech Stack (decided)

- **Backend:** Node.js + TypeScript (Fastify)
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth (Google, Apple, email/password)
- **Object storage:** Supabase Storage (S3-compatible)
- **Web frontend:** React / Next.js (future)
- **Mobile:** TBD (React Native or Flutter)
- **Hosting (Phase 1):** Supabase + PaaS (Railway/Render/Fly.io)
- **CI/CD:** GitHub Actions

## v1 Scope

### In scope
- **Artist/label portal** (web + mobile)
  - Artist onboarding and identity verification (label-invited or verified via existing distributor profiles)
  - Record stories in-app (similar to Spotify Canvas upload)
  - Upload pre-recorded story audio files
  - Link stories to tracks via ISRC / track ID
  - Bulk catalog import (CSV/file upload of ISRCs, or integration with distributor APIs)
  - Review, edit, and manage stories
  - Verify or reject stories
  - Story status dashboard (per track: has story, verified, distributed)
  - Notification system (story distributed, platform requests, status changes)

- **Story management backend**
  - Story CRUD (create, read, update, delete)
  - Story-to-track mapping (ISRC-based)
  - Story prioritization engine (artist recording > AI > archival)
  - Verification workflow and status tracking
  - Story versioning (artist can replace a story)
  - Multi-tenant: supports multiple labels and artists
  - Content moderation (flagging, review queue, content policy enforcement)
  - Audio validation (format, duration, file size, quality checks)

- **Distribution API**
  - Streaming platforms pull story assets and metadata
  - Story asset package: audio file, transcript, verification status, metadata
  - Linked to standard track identifiers (ISRC)
  - Webhook notifications when new/updated stories are available
  - Partner authentication and rate limiting
  - Story asset package spec (the contract between Storyteller and streaming platforms)

- **Admin / ops tooling**
  - Content moderation dashboard (review flagged stories, approve/reject)
  - Partner management (onboard streaming platforms, manage API keys)
  - System health monitoring
  - User management (artists, labels, roles)

- **Data storage**
  - Story metadata database (tracks, stories, verification status, priority)
  - Asset/object storage (audio files, transcripts)
  - Audit/event log (who verified what, when)

- **Testing**
  - Unit tests for business logic
  - Integration tests for API endpoints
  - End-to-end tests for critical flows (record story → distribute)

### Deferred (designed as pluggable, not built in v1)
- AI narrative generation engine (voice likeness, text generation)
- AI guardrails and safety layer (hallucination prevention, consent, bias detection)
- Archival compilation engine (interview ingestion, curation)
- Lyrics validation engine (NLP cross-referencing)
- Instrumental background / crossfade engine
- Knowledge graph
- Analytics warehouse / engagement dashboards
- Story monetization / ads
- Interactive storytelling (listener Q&A)
- Listener-facing features (all listener interaction is through streaming apps)

> **Note:** Partner (Robert's label) may request moving some deferred features into v1 after reviewing the production plan. Architecture supports this without rework.

## Implementation Plan

### Phase A: Backend Foundation (current — overnight build)

**Branch:** `feature/backend-scaffold`

#### A1. Project scaffold
- [x] Initialize Node.js + TypeScript project
- [x] Fastify server with health check
- [x] Docker + docker-compose (API + Postgres for local dev)
- [x] ESLint + Prettier config
- [x] pino structured logging
- [x] Environment config (.env handling)
- [x] .gitignore updated for Node.js project

#### A2. Database schema
- [x] Migration system setup (node-pg-migrate or similar)
- [x] All 8 entity tables from DATA_MODEL.md
- [x] Indexes, enums, constraints, foreign keys
- [x] Seed script for local dev (test label, test artist, sample tracks)

#### A3. Auth
- [x] Supabase Auth integration layer (prepared for Supabase, works with local JWT for now)
- [x] JWT middleware for artist routes
- [x] API key middleware for partner routes
- [x] Auth routes (register, login) — local implementation until Supabase is connected

#### A4. Artist API
- [x] Track CRUD (register, list, get by ID)
- [x] Story CRUD (create with audio upload, get, update, delete)
- [x] Story lifecycle (publish, verify, reject)
- [x] Catalog import (CSV upload)
- [x] Dashboard stats endpoint
- [x] Request validation (zod or similar)

#### A5. Audio pipeline
- [x] Multipart upload handling
- [x] Format validation (MP3, WAV, AAC)
- [x] Size validation (max 10MB)
- [x] Duration validation (5s–5min)
- [x] Storage service abstraction (local filesystem for dev, Supabase Storage for prod)

#### A6. Distribution API
- [x] Partner story listing (with updated_since for incremental sync)
- [x] Story by ISRC lookup
- [x] Audio download redirect (signed URLs)
- [x] Webhook dispatch service (send notifications to partner URLs)

#### A7. Admin API
- [x] Moderation queue (list flagged, approve, reject)
- [x] Partner management (CRUD, API key generation)
- [x] System stats

#### A8. Testing
- [x] Test framework setup (vitest)
- [x] Unit tests for business logic (validation, story lifecycle)
- [x] Integration tests for API routes (hitting real test DB)
- [x] Test database setup/teardown

#### A9. CI/CD
- [x] GitHub Actions workflow (lint, test on PR)
- [x] Auto-run tests on push to feature branches

### Phase B: Supabase Integration
- [x] Create Supabase project
- [x] Migrate schema to Supabase Postgres
- [x] Wire up Supabase Auth (Google, Apple, email/password)
- [x] Wire up Supabase Storage for audio files
- [x] Update .env with Supabase credentials
- [ ] Deploy API to PaaS

### Phase C: Web App
- [x] Next.js project scaffold
- [x] Auth flow (Supabase Auth — email/password, Google, Apple, OAuth callback)
- [x] Track management pages (list, add, import CSV, detail view)
- [x] Story recording (Web Audio API — record, playback, upload)
- [x] Story upload flow (multipart file upload with transcript)
- [x] Dashboard (stats cards)
- [x] Admin panel (moderation queue, partner management)
- [x] Notifications page
- [x] Stories overview page (tracks with/without stories)
- [x] Protected route layout with sidebar navigation

### Phase D: Mobile App
- [ ] Framework decision (React Native vs Flutter)
- [ ] Project scaffold
- [ ] Auth flow
- [ ] Story recording (native audio)
- [ ] Core flows matching web app

## Architecture Direction

### Distribution model
Storyteller conforms to how streaming platforms already ingest content from distributors. Story assets are treated as a new content type alongside tracks, artwork, lyrics, and credits. The goal is minimal friction for platform adoption.

### Backend layers (v1)
1. **API gateway** — auth, rate limiting, routing
2. **Story core service** — story management, prioritization, verification workflows, content moderation
3. **Distribution service** — packaging and delivering assets to streaming partners
4. **Asset storage** — object store for audio, relational DB for metadata
5. **Admin service** — moderation queue, partner management, system health

### Artist-facing apps
- Web app (primary, for label managers and artists on desktop)
- Mobile app (for artists recording stories on the go)
- Both talk to the same backend API

### Designed for future expansion
- AI pipeline slots in as a new story source feeding into the existing prioritization engine
- AI guardrail/safety layer sits between AI generation and story publishing
- Archival ingestion slots in the same way
- No v1 code needs to change to support these

## Legal & Business (must address before/during development)

### Legal structure
- Form LLC (or determine appropriate entity)
- Ownership/equity agreement between David Knowlton and Robert Riggs
- Define roles and decision-making authority

### Artist rights & consent
- Content licensing agreement: when an artist uploads a story, who owns it?
- Distribution rights: can Storyteller distribute to any platform?
- Revocation: can an artist pull their story? What happens to already-distributed copies?
- Voice likeness consent framework (needed before AI features, design now)

### Patent
- File provisional patent at USPTO ($75–150)
- Establishes priority date, gives 12 months to file non-provisional
- Draft is ready

### Content policy
- Define what's allowed/prohibited in story content
- Moderation workflow (automated checks + manual review)
- Appeals process for rejected content

### Privacy
- Privacy policy covering artist data
- GDPR considerations if onboarding EU artists
- Data retention and deletion policies

## Go-to-Market

### Timeline
| Milestone | Target |
|-----------|--------|
| File provisional patent | ASAP |
| ~~Finalize tech stack~~ | ~~Week 1–2~~ Done |
| Development starts | Now |
| Backend API + database complete | Week 8–10 |
| Web app complete | Week 10–12 (parallel) |
| Mobile app complete | Week 12–16 (parallel or after web) |
| Integration testing + polish | Week 14–17 |
| **v1 ready** | **~Month 4** |
| Onboard first artists (label partner) | Month 4–5 |
| 20–50 songs with stories on platform | Month 5 |
| **Start streaming platform conversations** | **Month 5–6** |

### Sales approach
- Don't wait for AI features — sell the experience
- The pitch: real artist stories on a working platform, one API integration
- Demo: press play, hear the story, hear the song. "Imagine every song on your platform had this."
- Deferred features (AI generation, analytics) are the roadmap pitch for scale

### First target platforms
1. Spotify — largest platform, most feature-forward, has precedent with Canvas/Storylines
2. Apple Music — premium positioning, values artist relationships
3. Amazon Music / YouTube Music — secondary targets

## Audio Requirements

| Parameter | Requirement |
|-----------|-------------|
| Formats accepted | MP3, WAV, AAC |
| Min duration | 5 seconds |
| Max duration | 5 minutes |
| Max file size | 10 MB |
| Sample rate | 44.1 kHz minimum |
| Channels | Mono or stereo |

## Next Steps
1. ~~Choose tech stack~~ Done (Node/TS + Supabase)
2. **Build backend foundation** (Phase A — in progress)
3. **Send production plan PDF to partner** for feedback
4. Incorporate partner feedback (may change v1 scope)
5. File provisional patent
6. Address legal structure (LLC, equity, artist licensing terms)
7. Create Supabase project and wire up (Phase B)
8. Start web app (Phase C)
