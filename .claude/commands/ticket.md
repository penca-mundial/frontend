---
description: Execute one SCRUM ticket end-to-end up to an open PR — recon-gate, In Progress, branch, implement (regression-test-first + real smoke), push, PR, report. STOPS at the PR; never merges.
argument-hint: "SCRUM-NNN"
---

You are executing **one** ticket: `$ARGUMENTS` (a `SCRUM-NNN` key).

This is the codified team ritual. Follow it in order. The deliverable is an **open PR with a STOP** — you do **not** merge. Adhere to `CLAUDE.md` ("JIRA workflow", "Architectural principles", "Reglas de trabajo", "Convenciones del proyecto").

## 🚫 HARD RULE — never merge here

> **The PR is the end of this command.** Code review is not enough: **NOTHING is merged until Santiago's explicit VISUAL OK.** Merge + Done is a **separate step, invoked on its own, only with explicit human OK** — never chained onto step (m) of this command. (That separate step is: squash-merge with subject `"…(#PR)"` + `--delete-branch` → transition to **Done** (id `41`) → report the final squash SHA.)

If you ever feel the pull to "just merge it too" — stop. That is a different, human-gated command.

## Workflow

**a. Re-read the ticket.** `getJiraIssue` (markdown) for `$ARGUMENTS`. Understand every Acceptance Criteria, Scope, Out-of-scope, Dependencies.

**b. RECON-GATE (before any UI).** Confirm the **real** backend contracts the UI will consume — routes, params, request/response shape — by reading the backend repo (sibling `../backend`: controllers, serializers/blueprints, services, request specs). Do **not** build UI on assumed contracts.
   - If a required endpoint is **missing**, or the response shape **doesn't match** what the ticket needs (e.g. no creator field, an array where a single object was assumed) → **STOP and report**. A backend ticket gets chained (as with `owner_username`/SCRUM-281). Report what's missing and the expected shape; do the non-blocked parts only if they're cleanly separable.

**c. Sync main.** `git checkout main && git pull --ff-only`.

**d. Move the ticket + assign.** Transition `$ARGUMENTS` to **In Progress** and **self-assign** it. Always.

**e. Branch.** `feat/scrum-NNN-<slug>` from the freshly-pulled main.

**f. Implement.** SOLID/GRASP, Open/Closed, mobile-first — and the project's conventions (see CLAUDE.md "Convenciones del proyecto"). Reuse primitives; don't recreate them. **STOP-and-report before editing shared / high-blast-radius files** (API client, router/route guards, design-system primitives, shared hooks) — see CLAUDE.md "Reglas de trabajo".

**g. Tests — regression-test-first.** Vitest.
   - For a **fix**: write the test first and confirm it **FAILS** against the code *without* the fix; then apply the fix and make it green.
   - Tests reflect **production data** (e.g. numeric backend ids), not just string mocks — string mocks have masked real bugs.
   - Run the repo's real verification until green: **`pnpm lint && pnpm typecheck && pnpm test`** (and `pnpm build`).

**h. SMOKE TEST — real.** Exercise the UI against the **local backend (:3000)**, not just unit tests with mocks. Use the running backend (seed/create the data you need via `docker compose exec -T app bin/rails runner`), drive the real flow (headless Chrome via the `/tmp` puppeteer-core harness), confirm the contract and persistence, and **clean up the smoke data** when closing. Note: the dev server's origin must be CORS-allowed by the backend (use `:5173`).

**i. Commit.** Conventional Commits; the message **footer ends with `Refs SCRUM-NNN`**. **No tool attribution** anywhere (no "Generated with…", no "Co-Authored-By: Claude", no mention of Anthropic/Claude/the tool) — see CLAUDE.md "PR description hygiene".

**j. Push + open ONE PR.** `gh pr create --title … --body …` (hand-written body: 1–2 line summary, key changes, `Refs SCRUM-NNN`; nothing else).

**k. Screenshots (if the ticket has UI).** Attach **desktop + mobile** screenshots to the report. Visual iterations accumulate **on the same branch** (don't open a new PR per tweak).

**l. Comment on the ticket.** `addCommentToJiraIssue`: PR link, short summary, the branch SHA. **Document AC deviations** explicitly (original AC superseded / final AC shipped / reason).

**m. STOP.** Report SHA + PR + smoke result (+ screenshots). **Do not merge.** Wait for the human visual OK, which arrives as a separate command.

## When to STOP and ask (vs. keep going)

STOP and report at: the recon-gate (missing/mismatched backend contract); before touching a shared/high-blast-radius file; an AC that can't be met as written without violating the architectural principles; missing credentials/env. Otherwise keep going — don't ask permission for cosmetic choices.
