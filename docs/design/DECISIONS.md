# StorySong — Decision Log

## DEC-001: Distribution model over platform feature
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** The original concept was a patentable feature to license to streaming platforms. We needed to decide whether to approach this as a patent-licensing play, a feature built inside streaming apps, or a standalone platform.
- **Decision:** Build Storyteller as a **story distribution platform** — analogous to how DistroKid/TuneCore distribute music to streaming services. Storyteller distributes story content to streaming platforms as a new content type.
- **Alternatives considered:**
  - Patent-only licensing: file patents and license to Spotify/Apple. Lower effort but extremely hard to monetize without a product and expensive litigation.
  - Build a listener-facing app: build our own playback experience. Requires competing with streaming platforms for listener attention.
  - Plugin/overlay: build a companion app that layers on top of streaming. Technically fragile and platform-dependent.
- **Rationale:** The distribution model slots into the existing music industry infrastructure. Streaming platforms already ingest content from distributors. A new content type (stories) is a smaller ask than a new feature. Artists already understand the distributor relationship. The patent still provides IP protection.

## DEC-002: v1 is artist-recorded stories only
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** The full vision includes three story source types: artist recordings, AI voice likeness narration, and archival interview compilations. We needed to decide what to build first.
- **Decision:** v1 supports only artist-recorded stories. AI generation and archival compilation are deferred but architecturally accommodated.
- **Alternatives considered:**
  - Build all three source types in v1: significantly more scope, AI voice likeness has legal uncertainty.
  - AI-first (generate stories to bootstrap catalog): cold start would be solved but quality and legal concerns are high.
- **Rationale:** Artist recordings are the highest-quality, most legally clear content. A friend of the founder owns a label with interested artists, so supply-side is viable without AI. The architecture designs story sources as pluggable — AI can be added later without rearchitecting.

## DEC-003: Instrumental crossfade deferred
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** The original concept included an instrumental version of the song playing underneath the story, with a beat-matched crossfade into the actual track.
- **Decision:** Defer this feature. v1 stories play as standalone audio, then the track begins (clean transition).
- **Alternatives considered:**
  - Build instrumental crossfade in v1: requires stem separation, beat matching, and tempo sync — significant audio engineering scope.
  - Require artists to supply instrumentals: adds friction to the upload process.
- **Rationale:** The crossfade is a nice-to-have that adds substantial technical complexity. The core value proposition (hearing the story behind a song) works without it. Can be added as a v2 feature.

## DEC-004: Multi-tenant from day one
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** The first users will be artists from one label (the founder's friend). We needed to decide whether to build for one label first or support multiple from the start.
- **Decision:** Multi-tenant from day one. Support multiple labels and artists.
- **Alternatives considered:**
  - Single-label v1, add multi-tenancy later: faster initial development but creates tech debt and migration pain.
- **Rationale:** Multi-tenancy in a new codebase is not significantly harder than single-tenant. Avoids rearchitecting later. The label is the first customer, not the only customer.

## DEC-005: ISRC as the universal track identifier
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** Stories need to be linked to specific tracks across multiple streaming platforms. Each platform uses different internal IDs.
- **Decision:** Use ISRC (International Standard Recording Code) as the primary track identifier. Every track in Storyteller is identified by ISRC.
- **Alternatives considered:**
  - Platform-specific IDs (Spotify URI, Apple Music ID): would require mapping tables per platform and break if a track isn't on all platforms.
  - UPC (barcode): identifies releases/albums, not individual tracks.
- **Rationale:** ISRC is the international standard for identifying sound recordings. Every distributed track has one. All streaming platforms understand ISRCs. It's the same identifier music distributors use, which aligns with our distribution model.

## DEC-006: Web and mobile artist apps
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** Artists need an interface to record, upload, and manage stories. Needed to decide which platforms to support.
- **Decision:** Build both a web app and a mobile app for artists.
- **Alternatives considered:**
  - Web only: simpler, but recording audio is a core flow and mobile is more natural for it.
  - Mobile only: misses label managers who work on desktop.
- **Rationale:** The web app serves label managers and desktop workflows (bulk management, dashboard). The mobile app is optimized for the core action: an artist recording a story about their song on the go. Both talk to the same backend API.

## DEC-007: Listeners do not use Storyteller directly
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** Needed to define who Storyteller's users are.
- **Decision:** Storyteller's users are artists/labels and streaming platform partners. Listeners experience stories only through their streaming app.
- **Alternatives considered:**
  - Build a listener-facing app or website: would compete with streaming platforms instead of partnering with them.
- **Rationale:** Storyteller is a distribution platform, not a consumer product. Listeners already have their streaming app. Building a listener experience would distract from the core value prop and create misaligned incentives with platform partners.

## DEC-008: Phased infrastructure — start simple, scale with demand
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** Considered building full enterprise infrastructure (dev/test/stage/prod, 100% uptime, multi-region) from the start.
- **Decision:** Adopt a phased infrastructure plan. Phase 1 (now): PaaS + managed DB + S3, single environment, ~$20-50/month. Phase 2 (first partner): staging + prod, CDN, monitoring, 99.5% uptime. Phase 3 (scale): auto-scaling, replicas, global CDN, 99.9%+. Phase 4 (enterprise): multi-region, compliance, 99.99%.
- **Alternatives considered:**
  - Full enterprise infrastructure from day one: dev/test/stage/prod, multi-region, auto-scaling, 99.99% uptime. Cost: thousands/month before a single user. Risk: over-investing in infra that will be redesigned once real usage patterns emerge.
- **Rationale:** Zero users and zero partners today. Infrastructure decisions made now will likely be wrong once real usage patterns are known. The architecture (containers + Postgres + S3) runs anywhere — PaaS to full cloud. Each phase has clear exit criteria tied to actual business milestones, not speculation. Money and engineering time are better spent on the product until partners are depending on the API.
