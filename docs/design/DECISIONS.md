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

## DEC-009: Node.js + TypeScript for backend
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** Needed to choose a backend language/framework to begin implementation.
- **Decision:** Use Node.js with TypeScript for the backend API.
- **Alternatives considered:**
  - Python (FastAPI): strong for AI/ML pipeline, but v1 has no AI features. Can add a Python service later when AI generation is built.
- **Rationale:** Aligns with the dev environment (Node 22 already in devcontainer). Aligns with React/React Native for shared TypeScript knowledge across the stack. Large ecosystem for API-heavy services. TypeScript provides type safety without the overhead of a compiled language.

## DEC-010: Supabase as Phase 1 platform
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** Needed to choose infrastructure for Phase 1 (auth, database, object storage) within the $20-50/month budget.
- **Decision:** Use Supabase as the primary platform for Phase 1, providing auth, PostgreSQL, and S3-compatible object storage in one service.
- **Alternatives considered:**
  - Clerk (auth only) + separate Postgres + separate S3: more moving parts, higher cost, more integration work.
  - Auth0: industry standard but overkill and expensive for early stage.
  - Firebase Auth + separate DB: pulls toward Google ecosystem, Firestore is not Postgres.
  - Roll our own auth: months of plumbing for JWT, session management, OAuth flows. Not worth it.
- **Rationale:** Supabase bundles three core Phase 1 needs (auth, Postgres, storage) into one managed service on a free/cheap tier. The Postgres underneath is standard — portable if we outgrow Supabase. The storage is S3-compatible. Auth supports all required providers out of the box. Fits the phased infrastructure plan: use Supabase now, migrate individual components to standalone services if Phase 2/3 demands it.

## DEC-011: Auth providers — Google, Apple, email/password
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** Needed to decide which authentication methods to offer artists and label managers.
- **Decision:** Support Google OAuth, Apple Sign-In, and email/password for v1.
- **Alternatives considered:**
  - Facebook/Meta OAuth: declining relevance, adds integration work without clear value for music industry users.
  - Spotify OAuth: tempting for a music platform, but Spotify's OAuth is designed for listener-facing apps. It doesn't prove catalog ownership or artist identity.
  - Magic link (passwordless email): good UX but adds complexity around email delivery and may confuse less technical users.
- **Rationale:** Google is universal — nearly every artist and manager has a Google account. Apple is required by App Store policy if you offer any third-party sign-in, and artists skew heavily iPhone. Email/password serves label managers on work email domains not tied to Google/Apple. Three providers cover the user base without over-complicating the auth surface.

## DEC-012: Monorepo layout — web app in `web/` directory
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** Needed to decide where the Next.js web app lives relative to the backend.
- **Decision:** Web app lives in `web/` subdirectory of the same repo. Backend stays at root.
- **Alternatives considered:**
  - Separate repo: isolates concerns but splits git history, makes cross-cutting changes harder, doubles CI config.
  - npm workspaces: full monorepo tooling. Adds complexity for two packages that don't share code yet.
- **Rationale:** Simplest approach. One repo, one git history, one PR for changes that touch both. No shared code between backend and frontend yet — if that changes (shared types, validation schemas), can add npm workspaces later. Next.js is self-contained with its own `node_modules` and build.

## DEC-013: No component library for v1 web app
- **Date:** 2026-03-16
- **Status:** accepted
- **Context:** Needed to decide whether to use a component library (shadcn/ui, Radix, MUI) or build with Tailwind directly.
- **Decision:** Build with Tailwind utility classes directly. No component library.
- **Alternatives considered:**
  - shadcn/ui: excellent quality, but adds setup overhead and a layer of abstraction for a small app.
  - Radix + custom styles: good accessibility defaults, but more plumbing than needed right now.
  - MUI: too heavy and opinionated for this project's aesthetic.
- **Rationale:** The web app is small (~11 routes) and the UI is straightforward (tables, forms, cards, sidebar). Adding a component library now would be premature abstraction. Can adopt shadcn/ui later if the app grows significantly.
