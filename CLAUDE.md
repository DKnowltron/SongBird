# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Storyteller** is a story distribution platform for the music industry. Artists record audio narratives about their songs, and Storyteller distributes those stories to streaming platforms (Spotify, Apple Music, etc.) as a new content type.

The platform has three applications sharing one backend API:
- **Backend API** — Node.js + TypeScript (Fastify), Supabase Auth + Storage
- **Web app** — Next.js 16 (React, Tailwind CSS)
- **Mobile app** — React Native (Expo SDK 55, Expo Router)

## Repository

- **Remote:** https://github.com/DKnowltron/SongBird.git
- **Default branch:** `main`

## Build & Run Commands

### Backend API
```bash
npx tsx src/index.ts              # Start API (default port 3000)
PORT=3001 npx tsx src/index.ts    # Start on specific port
npm test                          # Run tests (vitest, 34 tests)
npm run lint                      # ESLint
npm run migrate                   # Run database migrations
npm run seed                      # Seed test data
```

### Web App
```bash
cd web && npm run dev             # Dev server (port 3000)
cd web && npm run build           # Production build
```

### Mobile App
```bash
cd mobile && npx expo start      # Start Expo dev server
cd mobile && npx expo start --web # Web preview
```

### Run Everything (dev)
```bash
# Terminal 1: API
PORT=3001 npx tsx src/index.ts

# Terminal 2: Web app (auto-picks port 3000)
cd web && npm run dev

# Terminal 3: Mobile (scan QR with Expo Go)
cd mobile && npx expo start
```

## Git Workflow

### Branching strategy

- `main` — stable, reviewed code only. Never commit directly to main.
- `design/*` — design doc updates
- `feature/*` — new features
- `fix/*` — bug fixes (e.g., `fix/reg-003-playback-crash`)
- `chore/*` — tooling, config, CI changes

### Commit practices

- Write clear, descriptive commit messages — explain *why*, not just *what*
- Keep commits focused: one logical change per commit
- Never commit secrets, `.env` files, or API keys
- Stage specific files, not `git add -A`

### PR workflow

- All changes go through pull requests — no direct pushes to `main`
- PR description must reference which design docs or decisions are affected
- Squash merge to keep main history clean. Delete the feature branch after merge.

## Autonomy

This project runs in an isolated devcontainer. Claude Code has **full autonomy** to:
- Create, edit, and delete files
- Install packages and dependencies
- Run any commands (build, test, lint, scripts)
- Create branches, commit, and push
- Create and manage pull requests

Only exception: still flag genuinely destructive actions on `main` (force push, reset) before executing.

## Development Environment

- **Dev Container**: Debian-based with Node.js 22 and Claude Code pre-installed
- **Required env var**: `ANTHROPIC_API_KEY` (passed from host via devcontainer)
- **Editor extensions**: GitLens, Prettier (configured in devcontainer)

## MCP Integrations

### Figma

Figma is the project's design and collaboration tool, connected via MCP server.

- **MCP server**: `figma-remote-mcp` at `https://mcp.figma.com/mcp` (HTTP transport)
- **Auth**: OAuth — authenticates via browser. Already configured and authenticated.

### Gmail

Gmail is connected for drafting and sending emails to partners and collaborators.

- **MCP server**: `claude.ai Gmail` at `https://gmail.mcp.claude.com/mcp` (HTTP transport)
- **Auth**: OAuth — authenticates via browser. Already configured and authenticated.
- **Account**: david.knowlton@gmail.com

### Rules for Figma usage

1. **FigJam for collaboration, Figma for design.** Use FigJam boards for meetings and brainstorming. Use Figma design files for UI mockups and component design.
2. **Sync decisions back to docs.** Any decisions captured on a FigJam board must be reflected in the appropriate design docs (`DECISIONS.md`, session files, etc.).
3. **Reference board links.** When a FigJam board is used for a meeting or session, include the board link in the corresponding session file.

## Project Structure

```
StorySong/
├── CLAUDE.md                  ← project instructions (this file)
├── plan.md                    ← execution plan (active working doc)
├── DK_ToDos.md                ← founder's manual action items
├── DEPLOY.md                  ← deployment guide (API + web)
├── .env                       ← secrets (gitignored)
├── package.json               ← backend dependencies
├── Dockerfile                 ← API Docker image
├── railway.toml               ← Railway PaaS config
├── eslint.config.js           ← ESLint v9 flat config
├── vitest.config.ts           ← Test config
│
├── src/                       ← Backend API source
│   ├── config/                ← env config (zod validated)
│   ├── db/                    ← connection, migrations, seed
│   ├── middleware/             ← auth (JWT + Supabase), error handler
│   ├── modules/               ← route modules (auth, tracks, stories, etc.)
│   ├── services/              ← storage, supabase client, audio validator
│   ├── utils/                 ← crypto, errors, logger
│   └── types/                 ← TypeScript interfaces
│
├── web/                       ← Next.js web app
│   ├── src/app/               ← App Router pages (11 routes)
│   ├── src/components/        ← sidebar, story-recorder
│   ├── src/lib/               ← supabase client, api client, auth context, hooks
│   └── Dockerfile             ← standalone Next.js Docker image
│
├── mobile/                    ← React Native (Expo) mobile app
│   ├── app/                   ← Expo Router pages (17 screens)
│   │   ├── (tabs)/            ← Bottom tab screens (home, tracks, record, notifications, profile)
│   │   ├── auth/              ← Login, register
│   │   ├── tracks/            ← Track detail
│   │   ├── record/            ← Select track, recording screen
│   │   └── admin/             ← Moderation, partners
│   └── src/lib/               ← supabase, api, auth context, hooks, theme
│
├── docs/
│   ├── design/                ← source-of-truth design docs
│   │   ├── DESIGN.md          ← vision, features, non-goals
│   │   ├── ARCHITECTURE.md    ← tech stack, deployment phases
│   │   ├── DATA_MODEL.md      ← entities, relationships
│   │   ├── API.md             ← all endpoints, request/response
│   │   ├── DECISIONS.md       ← 14 decisions with rationale
│   │   └── REGRESSION.md      ← 3 bugs logged with fixes + test cases
│   ├── partner/               ← partner-facing materials
│   ├── reference/             ← original source material
│   └── sessions/              ← per-session engineering logs
│
├── scripts/                   ← setup and utility scripts
├── .github/workflows/ci.yml   ← CI: API tests + web build (parallel)
└── .claude/commands/           ← custom slash commands (/design, /uiux)
```

## Design Documents (mandatory)

Design docs live in `docs/design/`. These are the source of truth and must be kept current.

| File | Purpose |
|------|---------|
| `docs/design/DESIGN.md` | Vision, core experience, features, non-goals |
| `docs/design/ARCHITECTURE.md` | Tech stack, components, dependencies, deployment |
| `docs/design/DATA_MODEL.md` | Entities, relationships, storage |
| `docs/design/DECISIONS.md` | Decision log with context and rationale |
| `docs/design/API.md` | Endpoints, request/response shapes, external integrations |
| `docs/design/REGRESSION.md` | Bugs found, root causes, fixes, and required test cases |
| `docs/sessions/` | Per-conversation session logs |

### Rules for documentation (CRITICAL)

1. **Create a session file at the START of every conversation.** Name it `docs/sessions/YYYY-MM-DD-NNN-topic.md` using the current date, a sequence number, and a descriptive slug. Do this BEFORE writing any code.
2. **Update docs in real time.** When a decision is made or code is written, update the relevant docs immediately — session file, plan.md, DECISIONS.md, REGRESSION.md. Never backfill at the end.
3. **Log every significant decision** in `docs/design/DECISIONS.md` with context, alternatives, and rationale.
4. **Log every bug** in `docs/design/REGRESSION.md` with root cause, fix, and test case.
5. **No orphan decisions.** If a decision affects multiple docs, update all of them.
6. **Read before writing.** Before any work, read the relevant doc(s) to understand current state.
7. **Update plan.md checkboxes** as each item completes, not in a batch.

### Rules for regressions

1. **Log every bug immediately when found** — add a numbered entry to `docs/design/REGRESSION.md`.
2. **Never close without a test case.** Every regression entry must include how to verify the fix holds.
3. **Reference regressions in session files.** If a bug is found during a session, note it in both places.

## Engineering Best Practices

### Logging

1. **Structured logging from day one.** Use pino — no raw `console.log` in production code.
2. **Log levels matter.** `error` for failures, `warn` for recoverable issues, `info` for key business events, `debug` for dev detail.
3. **Context in every log.** Include relevant IDs (requestId, artistId, storyId, trackISRC).
4. **No sensitive data in logs.** Never log passwords, tokens, API keys.

### Testing

1. **Test as you build.** Every new module gets tests in the same PR.
2. **Test pyramid.** Unit tests for business logic. Integration tests for API routes hitting a real database. No mocking the database.
3. **Test naming.** Describe behavior: `"rejects audio files over 10MB"`, not `"test upload validation"`.
4. **Run tests before committing.** Tests must pass before creating a commit.
5. **Regression tests are mandatory.** Every bug in REGRESSION.md must have a corresponding test.

### Feature development workflow

1. **Branch per feature.** Every feature, fix, or chore gets its own branch. Never work directly on `main`.
2. **Small, focused PRs.** One logical change per PR.
3. **PR checklist:**
   - Tests pass
   - Linting passes
   - Session file updated
   - Design docs updated if implementation changed anything
   - REGRESSION.md updated if any bugs were found and fixed
   - Commit messages explain *why*
4. **Merge to main via PR only.** Squash merge, delete branch after.

### Session logging

1. **Session files are engineering journals.** Log what was built, what patterns worked, what was harder than expected, and what you'd do differently.
2. **Tag learnings.** Note better approaches under a `## Learnings` section.
3. **Reference PRs.** Link PRs created during the session.
