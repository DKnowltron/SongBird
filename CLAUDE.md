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

## Development Environment

- **Dev Container**: Debian-based with Node.js 22 and Claude Code pre-installed
- **Required env var**: `ANTHROPIC_API_KEY` (passed from host via devcontainer)
- **Editor extensions**: GitLens, Prettier (configured in devcontainer)

## Design Documents (mandatory)

All design work lives in `docs/`. These files are the source of truth and must be kept current.

| File | Purpose |
|------|---------|
| `docs/DESIGN.md` | Vision, core experience, features, non-goals |
| `docs/ARCHITECTURE.md` | Tech stack, components, dependencies, deployment |
| `docs/DATA_MODEL.md` | Entities, relationships, storage |
| `docs/DECISIONS.md` | Decision log with context and rationale |
| `docs/API.md` | Endpoints, request/response shapes, external integrations |
| `docs/REGRESSION.md` | Bugs found, root causes, fixes, and required test cases |
| `docs/sessions/` | Per-session logs named `YYYY-MM-DD-session-name.md` |

### Rules for design sessions

1. **Read before writing.** Before any design discussion, read the relevant doc(s) to understand current state. Do not contradict or duplicate existing decisions without explicitly noting the change.
2. **Update docs during the conversation.** When a design decision is made, update the relevant doc immediately — do not wait until the end of the session.
3. **Log every significant decision.** Any choice between alternatives (tech stack, architecture pattern, data model shape, API style) gets an entry in `docs/DECISIONS.md` with context, alternatives, and rationale.
4. **No orphan decisions.** If a decision affects multiple docs, update all of them. For example, choosing a database updates both `DATA_MODEL.md` and `ARCHITECTURE.md`.
5. **Replace placeholders.** When filling in a section, remove the HTML comment placeholder. Sections with remaining comments indicate incomplete design work.
6. **Create a session file at the start of every session.** Name it `docs/sessions/YYYY-MM-DD-session-name.md` using the current date and a descriptive slug (e.g., `2026-03-16-data-model-design.md`). Log context, decisions made, changes made, and open items throughout the session.
7. **Update the session file as you go.** Don't backfill at the end — capture decisions and changes in real time, just like the design docs.

### Rules for regressions

1. **Log every bug.** When a bug is found during prototyping or testing, add a numbered entry to `docs/REGRESSION.md` with description, root cause, fix, and a test case to prevent recurrence.
2. **Never close without a test case.** Every regression entry must include how to verify the fix holds. These accumulate into the required test cases section.
3. **Reference regressions in session files.** If a bug is found during a session, note it in both the session file and `REGRESSION.md`.

### Rules for prototyping (when we get there)

1. **Build from the docs.** All implementation must trace back to the design docs. If something isn't documented, design it first.
2. **Update docs when implementation forces changes.** If prototyping reveals a design flaw, update the design docs before proceeding with the new approach.
3. **Keep CLAUDE.md updated.** Once there are build commands, test commands, or project structure, add them here.
