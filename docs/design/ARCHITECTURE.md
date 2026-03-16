# StorySong — Architecture

## Tech Stack

**Backend API:** Node.js + TypeScript (see DEC-009)

**Auth:** Supabase Auth — Google OAuth, Apple Sign-In, email/password (see DEC-010, DEC-011)

**Database:** PostgreSQL via Supabase (managed, standard Postgres — portable if we outgrow Supabase)

**Object storage:** Supabase Storage (S3-compatible) — audio files, transcripts

**Web:** React / Next.js — aligns with TypeScript backend, shared knowledge with React Native

**Mobile:** TBD — React Native or Flutter (decision pending)

**Infrastructure (Phase 1):** Supabase (auth + DB + storage) + PaaS for the API server (Railway, Render, or Fly.io). Containerized (Docker). ~$20-50/month. See DEC-008 for phased plan.

## System Overview

Storyteller is a **content distribution platform** with three main surfaces:

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Artist Portal   │     │  Storyteller Backend  │     │   Streaming      │
│  (Web + Mobile)  │────▶│                       │────▶│   Platforms      │
│                  │     │  API Gateway          │     │   (Spotify,      │
│  - Record story  │     │  Story Core Service   │     │    Apple, etc.)  │
│  - Upload audio  │     │  Distribution Service │     │                  │
│  - Verify/manage │     │  Asset Storage        │     │  Pull stories    │
└─────────────────┘     └─────────────────────┘     │  via API         │
                                                     └──────────────────┘
```

The system follows a **distribution model**: Storyteller is to song stories what DistroKid is to music tracks. Streaming platforms consume story content through a standard API, the same way they consume music and metadata from distributors.

## Component Breakdown

### 1. API Gateway
**Responsibility:** Single entry point for all API traffic. Handles authentication, authorization, rate limiting, and routing.

**Inputs:**
- Requests from artist portal (web/mobile)
- Requests from streaming platform partners

**Outputs:**
- Authenticated, routed requests to internal services

**Key behaviors:**
- Artist auth (login, session management)
- Partner API key authentication for streaming platforms
- Rate limiting per partner
- Request validation

### 2. Story Core Service
**Responsibility:** Central business logic for story lifecycle management.

**Inputs:**
- Story creation requests (record or upload)
- Story metadata (track ISRC, artist ID, story type)
- Verification actions (approve, reject, replace)

**Outputs:**
- Stored story records with metadata
- Verification status changes
- Story version history

**Key behaviors:**
- Story CRUD operations
- Track-to-story mapping via ISRC
- Story prioritization (when multiple story types exist for a track)
- Verification workflow (pending → verified / rejected)
- Story versioning (replacing a story creates a new version)
- Artist ownership enforcement (only the artist/label can manage their stories)

### 3. Distribution Service
**Responsibility:** Packages and delivers story assets to streaming platform partners.

**Inputs:**
- Story records and audio assets from Story Core
- Partner configuration (which platforms, what format)

**Outputs:**
- Story asset packages (audio + metadata + verification status)
- Webhook notifications to partners

**Key behaviors:**
- Package story assets for partner consumption
- Serve story assets via partner API
- Send webhook notifications on story create/update/delete
- Track distribution status per partner
- Handle partner-specific formatting if needed

### 4. Asset Storage
**Responsibility:** Stores and serves audio files and related assets.

**Inputs:**
- Uploaded or recorded audio files
- Transcripts (if generated)

**Outputs:**
- Signed URLs for audio playback/download
- Audio file metadata (duration, format, size)

**Key behaviors:**
- Accept audio uploads (validate format, duration, size)
- Store in object storage
- Generate signed/temporary URLs for partner access
- Audio format validation and normalization

### 5. Artist Portal — Web App
**Responsibility:** Browser-based interface for artists and label managers.

**Inputs:** User interactions

**Outputs:** API calls to backend

**Key behaviors:**
- Artist onboarding and profile management
- Catalog browsing (tracks linked via ISRC)
- Story recording (in-browser, using Web Audio API)
- Story upload (audio file)
- Story management dashboard
- Verification controls

### 6. Artist Portal — Mobile App
**Responsibility:** Mobile interface for artists to record and manage stories on the go.

**Inputs:** User interactions

**Outputs:** API calls to backend

**Key behaviors:**
- Same capabilities as web app
- Optimized for recording (native audio capture)
- Push notifications (story distributed, verification requested)

### 7. Admin / Ops Dashboard
**Responsibility:** Internal tooling for platform operators to manage content, partners, and system health.

**Inputs:** Admin user interactions

**Outputs:** Moderation actions, partner configuration changes, system metrics

**Key behaviors:**
- Content moderation queue (review flagged stories, approve/reject)
- Partner management (onboard streaming platforms, manage API keys, view delivery status)
- User management (artists, labels, roles, identity verification review)
- System health overview (API uptime, error rates, storage usage)
- Audit log viewer

### 8. Notification Service
**Responsibility:** Keeps artists informed about story lifecycle events.

**Inputs:** Events from story core and distribution services

**Outputs:** Push notifications (mobile), email notifications, in-app notifications

**Key behaviors:**
- Story distributed to platform
- Story flagged for moderation review
- Story approved/rejected by moderator
- Partner requests or status changes
- Configurable notification preferences per artist

### Future Components (pluggable, not built in v1)

#### AI Narrative Generation Engine
Slots into the story pipeline as a new story source. Generates narrative text and optional voice audio when no artist recording exists. Feeds into the existing prioritization engine.

#### AI Safety / Guardrail Layer
Sits between AI generation and story publishing. Responsibilities:
- Hallucination prevention (cross-reference with lyrics and known facts)
- Voice likeness consent verification
- Bias detection across genres and demographics
- Automated content screening before human review
- Artist right-of-refusal enforcement

#### Archival Compilation Engine
Ingests interview transcripts, podcast clips, press articles. Extracts relevant quotes and assembles narrative segments. Another story source feeding into prioritization.

#### Lyrics Validation Engine
Cross-references AI-generated narratives against song lyrics using NLP. Produces accuracy scores. Triggers regeneration if score is low. Sits between AI generation and story publishing.

#### Analytics Service
Receives engagement data from streaming platforms (story plays, skips, completion rates). Powers dashboards for artists and labels.

## External Dependencies

### Streaming platform partner APIs
- Each streaming platform will need to integrate with Storyteller's distribution API
- Storyteller conforms to existing content ingestion patterns where possible
- ISRC is the universal track identifier bridging Storyteller and platform catalogs

### ISRC / Music metadata
- Stories are linked to tracks via ISRC (International Standard Recording Code)
- May need to integrate with a music metadata service to help artists find and link their tracks

### Audio processing
- Audio format validation and normalization (ensure consistent quality)
- Potentially a transcription service for generating text transcripts of stories

## Deployment — Phased Infrastructure Plan

Infrastructure scales with the product. We don't build for enterprise on day one — we build what we need now and add rigor as usage and partnerships demand it.

### Phase 1: Build & Prove (now → first artists using the platform)

**Goal:** Get the product running, onboard first label's artists, iterate fast.

**Infrastructure:**
- **Platform:** Supabase (auth + Postgres + S3-compatible storage) — see DEC-010
- **Hosting:** PaaS (Railway, Render, or Fly.io) for the API server — deploy from Git, no DevOps overhead
- **Database:** Supabase Postgres (managed, standard Postgres — portable)
- **Object storage:** Supabase Storage (S3-compatible) for audio files
- **Environments:** One environment (doubles as dev and staging)
- **Backups:** Automated daily DB backups (most managed Postgres services include this)
- **Monitoring:** Basic health checks and error logging (e.g., Sentry for errors, built-in PaaS metrics)
- **CI/CD:** GitHub Actions — run tests, deploy on merge to main

**What we skip:**
- No separate dev/test/stage/prod
- No auto-scaling
- No CDN
- No multi-region

**Estimated cost:** ~$20–50/month

**Exit criteria for Phase 2:** A streaming platform partner is ready to integrate, or artist usage is steady and growing.

---

### Phase 2: First Partner Integration (first streaming platform partnership)

**Goal:** Production-grade reliability. A streaming platform is now depending on our API.

**Infrastructure upgrades:**
- **Environments:** Separate **staging** and **production** environments
- **Hosting:** Move to a container platform if needed (AWS ECS/Fargate, GCP Cloud Run, or stay on PaaS if it's handling load)
- **Database:** Production Postgres with point-in-time recovery, automated backups with 7-day retention
- **CDN:** CloudFront or Cloudflare in front of audio assets — partners need fast, reliable audio delivery
- **Monitoring:** Application performance monitoring (Datadog, New Relic, or open-source equivalent), uptime monitoring, alerting on API errors and latency
- **CI/CD:** Full pipeline — lint, test, deploy to staging, manual promote to production
- **Security:** HTTPS everywhere, API key rotation support, webhook signature verification, secrets management (not in code)
- **Uptime target:** 99.5% (allows ~1.8 days downtime/year — realistic for a small team)

**What we skip:**
- No dev/test environments (staging + prod is enough)
- No auto-scaling (right-size manually)
- No multi-region

**Estimated cost:** ~$200–500/month

**Exit criteria for Phase 3:** Multiple platform partners, meaningful traffic, or revenue that justifies infrastructure investment.

---

### Phase 3: Scale (multiple partners, real traffic)

**Goal:** Enterprise-grade infrastructure. Multiple streaming platforms pulling stories. Uptime and performance are competitive advantages.

**Infrastructure upgrades:**
- **Environments:** Full **dev → staging → production** pipeline
- **Hosting:** Container orchestration with auto-scaling (ECS, GKE, or similar)
- **Database:** Primary + read replicas, automated failover, 30-day backup retention
- **Object storage:** Multi-region replication for audio assets
- **CDN:** Global CDN for audio delivery — partners worldwide need low-latency access
- **Monitoring:** Full observability stack — metrics, logs, traces, dashboards, on-call alerting
- **Load testing:** Regular load tests simulating partner API traffic patterns
- **Security:** SOC 2 readiness, regular security audits, WAF, DDoS protection
- **Uptime target:** 99.9%+ (~8.7 hours downtime/year)

**Estimated cost:** $1,000–5,000+/month (scales with traffic)

---

### Phase 4: Enterprise (future, if needed)

**Goal:** Global scale, regulatory compliance, enterprise partner requirements.

- Multi-region deployment (US, EU, Asia)
- Data residency controls (for GDPR / regional compliance)
- 99.99% uptime SLA
- Dedicated partner integration environments
- Disaster recovery with RTO < 1 hour
- Full audit logging for compliance

This phase is driven by partner contracts and regulatory requirements, not speculation.

---

### Infrastructure principles (all phases)
- **Managed services over self-hosted.** Don't run your own Postgres, queue, or object store. Pay for managed versions and focus engineering time on the product.
- **Containers from the start.** Even in Phase 1, package the app as a Docker container. This makes moving between hosting providers trivial.
- **No premature optimization.** Don't add caching, CDN, or read replicas until metrics show you need them.
- **Backups are non-negotiable.** Even in Phase 1, automated DB backups. Audio assets in object storage are inherently durable.
- **Secrets never in code.** Environment variables or a secrets manager from day one.
