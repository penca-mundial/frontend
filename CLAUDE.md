# Penca Mundial — Frontend

Vite + React 19 + TypeScript SPA para la plataforma de predicciones del Mundial 2026.

## Stack

- React 19, TypeScript strict
- Vite 5 con pnpm
- React Router 7
- TanStack Query (server state) + React Context (auth)
- Tailwind CSS 4 + shadcn/ui
- React Hook Form + Zod
- Axios (cookies httpOnly cross-origin)
- date-fns + date-fns-tz
- Vitest + Testing Library + MSW

## Architectural principles

This project is built to evolve. The constraints below exist so that adding a feature, replacing a backend endpoint, or onboarding a new contributor never requires undoing decisions we already made. If you find yourself fighting them, pause and raise it — it's likely we have to update the principles, not bypass them.

### Open/Closed: extensible to change

Code is **open for extension, closed for modification**. When a feature changes or a new consumer appears, we extend by composing or adding — not by editing what already works. Concretely:

- **Extract a component to its own file as soon as a second consumer is predictable — not when the third actually arrives.** The cost of a new file is trivial; the cost of finding and unifying drift between copies is large.
- **Prefer composition over conditional bloat.** If a component grows two unrelated modes joined by `if (variant === ...)`, those are two components hiding in one.
- **Props are a contract.** Never silently break an existing prop's meaning. Add new optional props for new behaviors; deprecate old ones explicitly.

### SOLID applied to React

- **Single Responsibility (S):** each component does one thing. A page composes; a feature component renders a domain concept; a UI primitive renders a styled atom.
- **Open/Closed (O):** see above. Components accept `children`, render-props, or polymorphic props (`asChild`) for extension points.
- **Liskov Substitution (L):** variants of a component (`<Button variant="ghost">` vs `<Button variant="default">`) must behave compatibly — same accessibility, same focus behavior, same event surface.
- **Interface Segregation (I):** don't force a consumer to know props it doesn't use. If "compact mode" and "full mode" need different props, those are two components.
- **Dependency Inversion (D):** depend on abstractions (types, hooks, API clients), not concrete implementations. Never call `fetch` directly from a component — go through `src/api/`.

### GRASP

- **Information Expert:** data lives in the component that owns it. If a parent passes 5 callbacks to manipulate a child's state, the state belongs in the child.
- **High Cohesion / Low Coupling:** files in `src/features/<domain>/` know about their domain. They don't import from another domain — if they need to, the shared piece moves to `src/components/` or to a shared hook.
- **Pure Fabrication:** utility components (`Button`, `Logo`, `Skeleton`) and helper hooks (`useMediaQuery`) don't map to domain concepts. They exist to avoid duplication and to abstract platform details.
- **Indirection:** API calls, navigation, and time go through helpers (`src/api/`, `useNavigate`, `formatKickoff`). Never reach the platform directly from a component.

### React patterns we follow

In addition to the lower-level rules in "Convenciones de código" below:

- **Composition over inheritance.** React doesn't do component inheritance; compose.
- **Hooks for stateful and side-effectful logic.** Extract a custom hook when the same effect-shaped logic appears in two components.
- **Props down, events up.** Don't `useContext` for data that only crosses one level.
- **Locality of state.** Lift state up only when two siblings genuinely need to share it. Don't lift "just in case".
- **No prop-drilling beyond 2 levels.** Past 2 hops, use `useContext` or rethink.
- **Don't write 200-line components.** ~150 lines is a smell; extract.
- **No `useState` for derived values.** If `B = f(A)`, compute B with `useMemo`, don't store and synchronize it.
- **Mobile-first responsive via Tailwind utilities** (`sm:`, `md:`, `hidden md:block`). No JavaScript-based screen-size conditionals.
- **Semantic HTML and accessibility from day 1.** `<button>` not `<div onClick>`. `<h1>` once per page, `<h2>` for sections. `aria-label` on icon-only controls. `aria-hidden="true"` on decorative icons.

### When the AC and the codebase disagree, stop

If an acceptance criterion can't be implemented as written without violating these principles (e.g. it asks for a conditional that should be a new component, or for data that doesn't exist on the backend) — **STOP** and report on the ticket. Document the tension, propose a deviation with rationale, and wait. Don't silently work around the AC, and don't silently bypass the principles. The decision trail matters more than speed. This extends the "SÍ pedí permiso si: conflicto no trivial con código existente" rule below with the principles as the second criterion for tension.

### Before opening a PR

Beyond the tests / lint / typecheck the workflow already requires:

- [ ] Each new component does one thing.
- [ ] No duplicated code — if you copy 5+ lines, extract.
- [ ] Primitives reused (`Button`, `Logo`, etc.), not recreated.
- [ ] Semantic HTML: heading hierarchy correct, `<button>` not `<div onClick>`, ARIA where appropriate.
- [ ] Mobile-first responsive via Tailwind utilities.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test --run` all green.
- [ ] If you deviated from the AC, the deviation is documented on the ticket.

## Convenciones de código

- Todo el código, identificadores y comentarios en **inglés**.
- Strings que ve el usuario final en **español**.
- TypeScript **strict**: no `any`, no `as` sin justificar.
- Imports usan alias `@/` que mapea a `src/`.
- No `localStorage` para auth — la sesión vive en cookies httpOnly.
- Forms: schema Zod primero, tipos derivados con `z.infer<...>`, validación via `zodResolver`.

## Estructura

```
src/
  api/                          # Clientes HTTP por dominio
    client.ts                   # Axios base con interceptors
    auth.api.ts, matches.api.ts, ...
  components/
    ui/                         # shadcn/ui primitives (no tocar a mano)
    layout/                     # AppShell, Header, Footer, *Route guards
  features/<domain>/            # Una carpeta por dominio
    components/
    hooks/
    schemas.ts                  # Zod schemas
    types.ts                    # TS types del dominio
  pages/
    public/                     # /login, /signup, /, etc.
    onboarding/                 # /onboarding/username
    app/                        # /app/* (requieren auth)
    admin/                      # /admin/* (requieren admin)
  hooks/                        # Hooks compartidos
  contexts/AuthContext.tsx
  lib/                          # cn, date, timezone, queryClient
  types/                        # api.ts, domain.ts
  router.tsx                    # Toda la definición de rutas
```

## Comandos

```bash
pnpm install
pnpm dev                # http://localhost:5173
pnpm build              # Output a dist/
pnpm test               # Vitest run
pnpm test:watch
pnpm lint
pnpm format
pnpm typecheck
```

## Variables de entorno

- `VITE_API_URL` — base URL del backend (incluye `/api/v1`)

---

# JIRA workflow

El proyecto está en `https://86santiago.atlassian.net`, proyecto **SCRUM**. Todo el backlog está cargado. Trabajás ticket por ticket, sin PM ni reviewer.

## Convenciones de ticket

- Cada ticket tiene un campo `External Issue ID` con formato `task-NNN` — esa es la referencia primaria.
- Backlog agrupado en 11 epics (`epic-phase-0` a `epic-phase-10`).
- Descripción tiene: `Context`, `Scope`, `Out of scope`, `Implementation notes`, `Files`, `Acceptance criteria`, `Dependencies`.
- Las `Dependencies` referencian otros `task-NNN`. Respetalas.

## Workflow para cada ticket

1. **Encontrar la próxima tarea**: la de menor `External Issue ID` con `labels = "frontend"` que esté `To Do` y con deps en `Done`.
2. **Mover a `In Progress`** con `transitionJiraIssue`.
3. **Crear branch**: `feature/task-NNN-slug-corto` desde `main` actualizado.
4. **Implementar el Scope completo**:
   - Crear/modificar todos los archivos listados en `Files`.
   - Cumplir cada `Acceptance criteria`.
5. **Tests**: agregar tests según pide el ticket. `pnpm test --run` todo verde.
6. **Lint + typecheck**: `pnpm lint && pnpm typecheck`, todo verde.
7. **Commit** con Conventional Commits:
   - `<type>(<scope>): <description>\n\nRefs SCRUM-NNN`
8. **Push** + `gh pr create` + `gh pr merge --squash --auto` (o merge directo).
9. **Comentar en el ticket** con link al commit.
10. **Mover el ticket a `Done`**.
11. **Pasar a la siguiente tarea**.

## Reglas importantes

- **NO pidas permiso** si los AC están claros.
- **SÍ pedí permiso** si:
  - Una dep no está cumplida.
  - Conflicto no trivial con código existente.
  - Decisión arquitectural fuera del ticket.
- **Tests rotos** → NO commitees hasta arreglar.

## Stack-specific gotchas

- **shadcn/ui**: no modifiques los archivos en `components/ui/` a mano — son generados. Si necesitás otro primitive, corré `pnpm dlx shadcn@latest add <name>`.
- **Cookies cross-origin**: `axios` ya tiene `withCredentials: true`. No agregues `Authorization` headers manuales.
- **Forms**: siempre RHF + Zod. No uses estado interno para inputs validados.
- **Querys**: TanStack Query con keys array (ej. `['matches', filters]`). En mutaciones, `queryClient.invalidateQueries` después del success.
- **Date/Time**: parsear desde ISO 8601 UTC del backend y mostrar en timezone de usuario con `formatInTimeZone`. Nunca `new Date()` para formatear server data.
- **Tailwind 4**: usa `@import 'tailwindcss';` en globals.css. No hay `tailwind.config.js` con `content: []` — los archivos se detectan auto.
- **React 19**: usá `use(promise)` y server components patterns cuando aplique. No usar refs como cache.

## Archivos clave

- `src/api/client.ts` — Axios con interceptors. Toda llamada HTTP pasa por acá.
- `src/contexts/AuthContext.tsx` — fuente de verdad para `currentUser`.
- `src/router.tsx` — todas las rutas. Cuando agregues una página, importala acá.
- `src/lib/cn.ts` — `clsx` + `tailwind-merge`. Usalo para combinar clases condicionales.

## PR description hygiene (reiteración explícita)

When running `gh pr create`, the body of the PR MUST NOT contain any of:

- `🤖 Generated with [Claude Code](...)` (or any variant)
- `Generated with Claude Code` (in any form)
- `Co-Authored-By: Claude` (or similar)
- Any reference to Anthropic, Claude, or the tool that produced the code.

If `gh pr create --fill` would otherwise auto-include such text (e.g. from the commit body), use `gh pr create --title "<title>" --body "<body>"` explicitly with hand-crafted body content that contains only:

1. A 1-2 sentence summary of what was implemented.
2. A bulleted list of key changes.
3. The JIRA reference: `Refs SCRUM-NNN`.

Nothing else. No tool attribution. No emoji branding.

## World Cup 2026 — knockout phases

The 2026 World Cup has 48 teams (not 32), so knockout stages are:
**Dieciseisavos** (round_of_32) → Octavos (round_of_16) → Cuartos → Semis → 3er puesto → Final.

Any UI mentioning "the first knockout phase" must say "Dieciseisavos", not "Octavos". The backend enum value is `round_of_32`.

Translations from enum to Spanish (rioplatense):
- group_stage   → "Fase de grupos"
- round_of_32   → "Dieciseisavos"
- round_of_16   → "Octavos"
- quarter_final → "Cuartos"
- semi_final    → "Semifinal"
- third_place   → "Tercer puesto"
- final         → "Final"

## OAuth initiate — must be POST, not GET

Devise + omniauth-rails_csrf_protection (loaded by the backend) requires that OAuth initiation requests be POST, not GET. Routes:
- POST  `/users/auth/google_oauth2`           → starts the flow
- GET   `/users/auth/google_oauth2/callback`  → handles Google's redirect back

The GoogleSignInButton must therefore use a `<form method="POST">` pointing at the backend, not an `<a href>` link. The browser handles the POST natively and follows the redirect to Google.

## Local environment setup

The repo ships with `.env.example`. Every developer (and Claude Code sandbox) must copy it to `.env` before running `pnpm dev`:

```bash
cp .env.example .env
```

Without `.env`, Vite leaves `VITE_API_URL` undefined and axios falls back to same-origin requests (which hit the frontend dev server itself, returning 404). This is the most common cause of unexplained 404s during local development.

## Backend not running — symptoms

If signup, login, or any auth request returns a generic error like "Algo salió mal":
1. Check the browser DevTools → Network tab for the actual status code.
2. If status is 404 to `localhost:5173/...`, your `.env` is missing or `VITE_API_URL` is wrong.
3. If status is 500, look at the backend logs (`docker compose logs -f app`).
4. If status is network error (no response), the backend is not running. Start it with `docker compose up -d` in the backend folder.

The "Algo salió mal" generic toast is a known UX issue — backend errors should surface their specific message. Tracked for Phase 9 (Polish).
