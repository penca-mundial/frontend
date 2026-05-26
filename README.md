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

## Forms

Forms use [React Hook Form](https://react-hook-form.com) with [Zod](https://zod.dev)
for schema validation, wired together via `@hookform/resolvers`. Always define
the Zod schema first, derive the TypeScript type from it, and validate with
`zodResolver` — never keep validated inputs in component state.

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Schema first.
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

// 2. Derive the type from the schema.
type LoginValues = z.infer<typeof loginSchema>

function LoginForm() {
  // 3. Validate with zodResolver.
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit((values) => {
    // `values` is typed as LoginValues
  })

  // Render with the shadcn `Form` primitives from `@/components/ui/form`.
}
```

Conventions:

- Schema first; types via `z.infer<typeof schema>` (don't hand-write form types).
- Pair with the shadcn `Form`/`FormField` components in `@/components/ui/form`.

## Deployment

The app deploys to [Vercel](https://vercel.com), which auto-detects Vite
(build `pnpm build`, output `dist/`).

### One-time setup

1. In the Vercel dashboard: **Add New → Project** and import this GitHub repo.
2. Framework preset **Vite** is auto-detected (build command `pnpm build`,
   output directory `dist`).
3. Add the **`VITE_API_URL`** environment variable with a value per
   environment:
   - **Production** → the production backend, e.g. `https://api.penca.app/api/v1`
   - **Preview** → the staging backend, e.g. `https://staging-api.penca.app/api/v1`
4. Deploy.

After this one-time setup, pushes to `main` auto-deploy to production and every
PR gets a preview deployment.

### SPA routing

`vercel.json` rewrites all unmatched paths to `index.html` so client-side
routes (React Router) resolve correctly on deep links and page refreshes.
Static assets are served first, so the rewrite only affects app routes.

## Environment variables

See `.env.example`.

## Project tracking

[JIRA board](https://86santiago.atlassian.net/jira/software/projects/SCRUM/boards/1)

## License

Private.
