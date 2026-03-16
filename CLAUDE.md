# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StorySong is a new project currently in the **design phase**. No application code yet.

## Repository

- **Remote:** https://github.com/DKnowltron/SongBird.git
- **Default branch:** `main`

## Git Workflow

### Branching strategy

- `main` — stable, reviewed code only. Never commit directly to main.
- `design/*` — design doc updates (e.g., `design/data-model`, `design/api-contracts`)
- `feature/*` — new features during prototyping (e.g., `feature/auth`, `feature/song-generator`)
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
- During design phase: PRs for doc changes keep the history reviewable

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
- **Setup command** (already done): `claude mcp add --transport http figma-remote-mcp https://mcp.figma.com/mcp`

### Gmail

Gmail is connected for drafting and sending emails to partners and collaborators.

- **MCP server**: `claude.ai Gmail` at `https://gmail.mcp.claude.com/mcp` (HTTP transport)
- **Auth**: OAuth — authenticates via browser. Already configured and authenticated.
- **Account**: david.knowlton@gmail.com

### How we use Figma

- **FigJam boards**: For meetings, brainstorming, and collaborative decision-making. Claude Code can read and write to these boards directly via the MCP server.
- **Figma designs**: For UI/UX design work during prototyping. Claude Code can read design files to implement pixel-accurate layouts.
- **Partner meetings**: Meeting agendas are set up as FigJam boards. Participants add sticky notes, comments, and votes during the meeting. Claude Code reads the board afterward to capture decisions and update design docs.

### Rules for Figma usage

1. **FigJam for collaboration, Figma for design.** Use FigJam boards for meetings and brainstorming. Use Figma design files for UI mockups and component design.
2. **Sync decisions back to docs.** Any decisions captured on a FigJam board must be reflected in the appropriate design docs (`DECISIONS.md`, session files, etc.).
3. **Reference board links.** When a FigJam board is used for a meeting or session, include the board link in the corresponding session file.

## Project Structure

```
StorySong/
├── CLAUDE.md              ← project instructions (this file)
├── plan.md                ← execution plan (active working doc)
├── .env                   ← secrets (gitignored)
├── package.json           ← dependencies (PDF generation)
│
├── docs/
│   ├── design/            ← source-of-truth design docs
│   │   ├── DESIGN.md      ← vision, core experience, features, non-goals
│   │   ├── ARCHITECTURE.md ← tech stack, components, deployment
│   │   ├── DATA_MODEL.md  ← entities, relationships, storage
│   │   ├── API.md         ← endpoints, request/response, integrations
│   │   ├── DECISIONS.md   ← decision log with context and rationale
│   │   └── REGRESSION.md  ← bugs, root causes, fixes, test cases
│   │
│   ├── partner/           ← partner-facing materials
│   │   ├── PRODUCTION_PLAN.md
│   │   ├── PARTNER_MEETING_AGENDA.md
│   │   └── Storyteller-Production-Plan.pdf
│   │
│   ├── reference/         ← original source material (read-only context)
│   │   ├── storyteller.md ← converted from original ChatGPT conversation
│   │   └── Storyteller.rtf ← original ChatGPT conversation export
│   │
│   └── sessions/          ← per-session logs
│       └── YYYY-MM-DD-session-name.md
│
└── scripts/               ← tooling & utilities
    ├── generate-pdf.js    ← PDF generation script
    └── production-plan.html ← HTML template for PDF
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
| `docs/sessions/` | Per-session logs named `YYYY-MM-DD-session-name.md` |

### Rules for design sessions

1. **Read before writing.** Before any design discussion, read the relevant doc(s) to understand current state. Do not contradict or duplicate existing decisions without explicitly noting the change.
2. **Update docs during the conversation.** When a design decision is made, update the relevant doc immediately — do not wait until the end of the session.
3. **Log every significant decision.** Any choice between alternatives (tech stack, architecture pattern, data model shape, API style) gets an entry in `docs/design/DECISIONS.md` with context, alternatives, and rationale.
4. **No orphan decisions.** If a decision affects multiple docs, update all of them. For example, choosing a database updates both `docs/design/DATA_MODEL.md` and `docs/design/ARCHITECTURE.md`.
5. **Replace placeholders.** When filling in a section, remove the HTML comment placeholder. Sections with remaining comments indicate incomplete design work.
6. **Create a session file at the start of every session.** Name it `docs/sessions/YYYY-MM-DD-session-name.md` using the current date and a descriptive slug (e.g., `2026-03-16-data-model-design.md`). Log context, decisions made, changes made, and open items throughout the session.
7. **Update the session file as you go.** Don't backfill at the end — capture decisions and changes in real time, just like the design docs.

### Rules for regressions

1. **Log every bug.** When a bug is found during prototyping or testing, add a numbered entry to `docs/design/REGRESSION.md` with description, root cause, fix, and a test case to prevent recurrence.
2. **Never close without a test case.** Every regression entry must include how to verify the fix holds. These accumulate into the required test cases section.
3. **Reference regressions in session files.** If a bug is found during a session, note it in both the session file and `REGRESSION.md`.

### Rules for prototyping (when we get there)

1. **Build from the docs.** All implementation must trace back to the design docs. If something isn't documented, design it first.
2. **Update docs when implementation forces changes.** If prototyping reveals a design flaw, update the design docs before proceeding with the new approach.
3. **Keep CLAUDE.md updated.** Once there are build commands, test commands, or project structure, add them here.

## Engineering Best Practices

### Logging

1. **Structured logging from day one.** Use a structured logger (e.g., pino) — no raw `console.log` in production code.
2. **Log levels matter.** Use `error` for failures requiring attention, `warn` for recoverable issues, `info` for key business events (story created, distributed, verified), `debug` for development detail.
3. **Context in every log.** Include relevant IDs (requestId, artistId, storyId, trackISRC) so logs are traceable across the request lifecycle.
4. **No sensitive data in logs.** Never log passwords, tokens, API keys, or full audio file contents.
5. **Request-level logging.** Every API request gets a unique requestId logged at entry and exit with method, path, status code, and duration.

### Debugging

1. **Errors must be actionable.** Error messages should say what went wrong and include enough context to reproduce. Stack traces in dev, structured error responses in production.
2. **Health check endpoint.** Always have a `GET /health` that reports service status, DB connectivity, and storage connectivity.
3. **Fail fast, fail loud.** If a required service (DB, storage) is unavailable at startup, crash immediately with a clear error — don't silently degrade.

### Testing

1. **Test as you build.** Every new module, route, or service gets tests in the same PR. No "we'll add tests later."
2. **Test pyramid.** Unit tests for business logic and validation. Integration tests for API routes hitting a real (local) database. No mocking the database — use a test database.
3. **Test naming.** Tests describe behavior: `"rejects audio files over 10MB"`, not `"test upload validation"`.
4. **Run tests before committing.** Tests must pass before creating a commit. If tests fail, fix them first.
5. **Regression tests are mandatory.** Every bug logged in REGRESSION.md must have a corresponding test that would catch the bug if it recurred.
6. **Coverage is a guide, not a goal.** Focus on testing critical paths (auth, story creation, distribution) thoroughly rather than chasing a coverage number.

### Feature development workflow

1. **Branch per feature.** Every feature, fix, or chore gets its own branch (`feature/*`, `fix/*`, `chore/*`). Never work directly on `main`.
2. **Small, focused PRs.** One logical change per PR. If a feature is large, break it into stacked PRs (e.g., `feature/auth-schema` → `feature/auth-routes` → `feature/auth-tests`).
3. **PR checklist:**
   - Tests pass
   - Linting passes
   - Session file updated with what was built and any decisions made
   - Design docs updated if the implementation changed anything
   - REGRESSION.md updated if any bugs were found and fixed
   - Commit messages explain *why*
4. **Merge to main via PR only.** Squash merge to keep main history clean. Delete the feature branch after merge.

### Session & regression logging for continuous improvement

1. **Session files are engineering journals.** Beyond decisions, log: what was built, what patterns worked well, what was harder than expected, and what you'd do differently. This builds institutional knowledge.
2. **Tag learnings in session files.** When a better approach is discovered (a library, a pattern, a config choice), note it under a `## Learnings` section so future sessions can reference it.
3. **Regression entries drive architecture.** If the same category of bug appears more than twice, add a `## Patterns` section to REGRESSION.md noting the systemic issue and the architectural fix applied.
4. **Review regressions before building related features.** Before starting work on a module, check REGRESSION.md for past bugs in that area.
5. **Session files reference PRs.** When a PR is created during a session, link it in the session file. When a PR is merged, note it.
