# Session: Concept Alignment & Architecture Scoping
**Date:** 2026-03-16

## Context
Imported the full ChatGPT conversation (Storyteller.rtf) that captured the original idea, patent drafting, and backend architecture brainstorming between the founders (David Knowlton and Robert Riggs). This session focused on reviewing that material, aligning on the core concept, and scoping the v1 architecture.

## Background
The Storyteller concept was developed through extensive ChatGPT conversations covering:
- Patent drafting (provisional utility patent with 50+ claims)
- System architecture (5-layer backend)
- Feature ideation (AI voice generation, lyrics validation, instrumental crossfade, artist verification, skip controls, story prioritization)
- Licensing strategy (targeting Spotify, Apple Music, Amazon, YouTube Music)
- Prior art analysis (differentiation from Spotify's "About the Song" text cards)

## Key Concept
**Storyteller (StorySong)** is a **story distribution platform** for the music industry. It works like a music distributor (DistroKid, TuneCore) but for song stories — contextual audio narratives that play before a track on streaming platforms.

### How it works:
1. Artists record/upload stories about their songs through the Storyteller platform
2. Storyteller packages the story assets with metadata (linked to ISRC/track IDs)
3. Storyteller distributes story assets to streaming platforms via API
4. Streaming platforms integrate stories into their playback experience

### Three narrative source types (priority order):
1. **Authentic artist recording** — artist records directly via the platform
2. **AI voice likeness narration** — AI generates story in artist's voice
3. **Archival compilation** — assembled from past interviews, press, etc.

### Differentiation from Spotify "About the Song":
- Audio-first (not text cards)
- Pre-playback (not during playback)
- User toggle (enable/disable)
- Artist verification system
- Multiple narrative sources with prioritization

## Decisions Made

### Platform users (v1)
- **Artists/labels** — record, upload, manage, verify stories
- **Streaming platforms** — consume story assets via distribution API
- Listeners interact only through their streaming app, not through Storyteller directly

### AI generation pipeline — deferred
- Architecture will be designed so AI pipeline is a pluggable module
- Not required for v1; artists record stories manually
- Can be added later without rearchitecting

### Instrumental crossfade — deferred
- The founder is not sold on this feature
- Flagged as a future enhancement, not v1
- v1: story plays, then track starts (clean transition)

### Artist-facing platform
- Web app AND mobile app
- Similar UX to Spotify for Artists / DistroKid upload flow

### Distribution model
- Conforming to how streaming platforms already work with music distributors
- Story assets are a new content type in the existing distribution pipeline
- Linked to tracks via ISRC / track IDs that platforms already understand

### Early adopter
- A friend of the founder owns a record label and has artist interest
- Artists are already expressing willingness to participate
- Design multi-tenant from the start, but first integration is this label's roster

### Development approach
- Production-quality architecture, not a demo/prototype
- Plan to hire developers to build it

### Phased infrastructure (DEC-008)
- Don't build enterprise infra before there are users
- Phase 1: PaaS + managed Postgres + S3, ~$20-50/month
- Phase 2: staging/prod split, CDN, monitoring when first partner integrates
- Phase 3: auto-scaling, replicas, 99.9%+ when at real scale
- Phase 4: multi-region, compliance when enterprise contracts require it

### Go-to-market timing
- Start selling at v1 — don't wait for AI features
- The pitch is the experience: real artist stories on a working platform
- Need 20-50 songs with stories to demo compellingly
- Target month 5 for first streaming platform conversations

### AI guardrails — deferred but designed for
- v1 only needs basic content moderation (uploaded audio)
- v2 AI pipeline needs serious guardrails: hallucination prevention, consent, voice likeness safety, bias
- Architecture should accommodate a guardrail/safety layer as a pluggable module

### Identified gaps to address
- Legal structure (LLC, ownership, equity)
- Artist rights & consent (content licensing, revocation rights)
- Content moderation policy
- Artist onboarding & identity verification flow
- Track catalog import (bulk import, not just manual ISRC)
- Audio requirements spec (formats, duration, quality)
- Notification system for artists
- Admin/ops tooling
- Story asset package spec (the distribution contract)
- Testing strategy
- Partner awaiting production plan PDF for review — may request moving deferred features into v1

## Changes Made
- Converted Storyteller.rtf to storyteller.md for readability
- Created this session file
- Created plan.md with v1 architecture scope
- Populated DESIGN.md — vision, core experience, features (v1/v2/future), constraints & non-goals
- Populated ARCHITECTURE.md — system overview, component breakdown (6 components), future pluggable modules, deployment notes
- Populated DATA_MODEL.md — 7 entities (Artist, Label, Track, Story, AudioAsset, Partner, Distribution, AuditEvent), relationships, storage strategy
- Populated API.md — Artist API (auth, tracks, stories, dashboard) and Distribution API (partner story access, webhooks)
- Populated DECISIONS.md — 7 decisions (DEC-001 through DEC-007), later added DEC-008 (phased infrastructure)
- Created PRODUCTION_PLAN.md — partner-facing document covering product scope, infrastructure costs, dev costs, revenue model, IP, and first steps
- Updated plan.md with identified gaps (legal, onboarding, moderation, go-to-market)
- Updated ARCHITECTURE.md with content moderation and admin components
- Updated DESIGN.md with go-to-market timeline and additional v1 features
- Updated API.md with admin endpoints and catalog import
- Rebuilt production plan PDF with all updates

## Open Items
- **Awaiting partner feedback** on production plan PDF — may change v1 scope
- Choose tech stack (backend language/framework, mobile framework, cloud provider)
- Research DDEX and existing distribution standards for extensibility
- Define audio format requirements and validation rules (draft in API doc, needs finalization)
- Design artist identity verification flow (linking to existing profiles on platforms)
- Define the webhook signature/verification spec for partners
- Plan the onboarding flow for the first label partner
- Legal: LLC formation, ownership/equity agreement, artist content licensing terms
- Define the story asset package spec (distribution contract with streaming platforms)
