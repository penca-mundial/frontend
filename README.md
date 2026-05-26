# Penca Mundial — Frontend

SPA for the World Cup 2026 prediction platform.

## Stack

- React 19 + TypeScript
- Vite
- React Router 7
- TanStack Query
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- date-fns + date-fns-tz
- pnpm

## Setup

```bash
git clone git@github.com:penca-mundial/frontend.git
cd frontend
cp .env.example .env.local  # fill in values
pnpm install
pnpm dev
```

App runs at http://localhost:5173

Backend must be running on http://localhost:3000.

## Scripts

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm preview      # preview production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest
```

## Deployment

Pushes to `main` auto-deploy to Vercel. PRs get preview deployments.

## Environment variables

See `.env.example`.

## Project tracking

[JIRA board](https://86santiago.atlassian.net/jira/software/projects/SCRUM/boards/1)

## License

Private.
