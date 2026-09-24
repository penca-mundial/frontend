# Magic Penca — Frontend

[![CI](https://github.com/penca-mundial/frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/penca-mundial/frontend/actions/workflows/ci.yml)

> Single-page app for **Magic Penca**, a World Cup 2026 prediction game ("penca") where friends
> predicted match results, competed in private groups, and climbed live leaderboards.

**Status:** 🏆 Ran live during the 2026 FIFA World Cup — now decommissioned and open-sourced as a portfolio piece.
The hosted app has been shut down; this repository is preserved to show the code and UI.

This is the **frontend SPA**. It talks to the companion Rails API in
[`penca-mundial/backend`](https://github.com/penca-mundial/backend).

---

## What it is

Magic Penca is a football prediction platform. Users sign in with Google or email, predict scores
for every World Cup match and a full knockout bracket, join private groups by invite code, and watch
global and per-group leaderboards update as real results come in.

This repo is the **React + TypeScript client**: a responsive, mobile-first SPA that consumes the
backend's JSON API and renders the whole experience — auth, prediction forms, live match views,
brackets, group management, user profiles, and animated rankings.

## Architecture

```
   React SPA (this repo)  ──HTTPS / JSON──▶  Rails API  ──▶  PostgreSQL
        Vercel                               Render            Neon
          │
          ├── TanStack Query  → server state, caching, background refetch
          ├── React Router 7  → routing + auth-guarded routes
          ├── Google Sign-In  → OAuth handled by the API, session cookie
          └── Cloudinary      → unsigned avatar uploads
```

- **Feature-based structure** (`src/features/*`: `auth`, `predictions`, `groups`, `rankings`,
  `matches`, `tournament-predictions`, `users`, …) — each feature owns its components, hooks and
  API calls.
- **Server state via TanStack Query** — no global client store; caching, invalidation and
  background refetch keep the UI in sync with live match data.
- **Typed API layer** (`src/api`) with a shared Axios client, credentialed requests for the session
  cookie, and Zod-validated response shapes.
- **Forms** built with React Hook Form + Zod resolvers for typed validation.
- **UI** built on Tailwind CSS v4 with Radix UI primitives (shadcn/ui style), `lucide-react` icons,
  and `cva` + `tailwind-merge` for variant-driven components.
- **Tested** with Vitest + Testing Library, with the network mocked by **MSW** so tests exercise the
  real data-fetching code against fake HTTP responses.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Routing | React Router 7 |
| Server state | TanStack Query v5 |
| HTTP | Axios (credentialed) |
| Forms / validation | React Hook Form + Zod |
| Styling / UI | Tailwind CSS v4, Radix UI (shadcn/ui style), lucide-react |
| Dates | date-fns + date-fns-tz |
| Testing | Vitest, Testing Library, MSW |
| Tooling | pnpm, ESLint, Prettier |
| Hosting | Vercel |

## Running it locally

Requires **Node 22+** and **pnpm**. The [backend](https://github.com/penca-mundial/backend) must be
running on http://localhost:3000.

```bash
git clone https://github.com/penca-mundial/frontend.git
cd frontend
cp .env.example .env.local   # set VITE_API_URL (Cloudinary vars optional, only for avatar upload)
pnpm install
pnpm dev
```

App runs at http://localhost:5173.

### Scripts

```bash
pnpm dev          # dev server
pnpm build        # type-check + production build
pnpm preview      # preview the production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest
pnpm test:coverage
```

## Configuration

Vite exposes only `VITE_*` variables to the client — see [`.env.example`](.env.example):

- `VITE_API_URL` — base URL of the backend API.
- `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET` — for the (unsigned) avatar upload;
  optional. These are public by design — Vite bakes them into the client bundle, so they must never
  hold secret values.

## License

Personal portfolio project. Not affiliated with FIFA or football-data.org.
