# Contributing to AgentFlow

Thank you for your interest! This guide covers how to set up the project, submit changes, and follow our conventions.

## Development setup

```bash
# Requirements: Node 22+, pnpm 11+
git clone https://github.com/your-username/agentflow.git
cd agentflow
pnpm install
pnpm prisma generate
cp .env.example .env    # add your AI_API_KEY
pnpm dev                # http://localhost:3000
```

## Project structure

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages and API routes |
| `src/components/agentflow/` | All canvas UI components |
| `src/lib/` | Schema, execution engine, AI factory, validation, templates |
| `src/store/` | Zustand store for canvas state |
| `prisma/schema.prisma` | Database models (SQLite via better-sqlite3) |

## Making changes

1. **Fork** the repo and create a branch: `git checkout -b feat/your-feature`
2. **Make your changes** — keep PRs focused on one concern
3. **Type-check**: `pnpm tsc --noEmit`
4. **Lint**: `pnpm lint`
5. **Build**: `pnpm build`
6. Open a **Pull Request** against `main`

CI runs lint + type-check + build on every PR automatically.

## Code conventions

- **TypeScript** everywhere — no `any` without a comment explaining why
- **No comments** on obvious code — only add comments for non-obvious constraints or workarounds
- **No premature abstractions** — three similar implementations are fine; abstract only when the pattern is stable
- **Component files** stay under `src/components/agentflow/` — one component per file
- **API routes** use `better-sqlite3` directly via `getDb()` — no ORM queries at runtime
- **CSS variables** only — no hardcoded colors in components (use `var(--text)`, `var(--indigo)`, etc.)

## Adding a new node type

1. Add the type to `NODE_TYPES` in `src/components/agentflow/constants.ts`
2. Add default data to `NODE_DEFAULTS` in `src/store/useFlowStore.ts`
3. Add a `computeChips` case in `useFlowStore.ts`
4. Add a config component in `PropertiesPanel.tsx` and register it in `ConfigBody`
5. Add an executor in `src/lib/execution/runner.ts` if the node participates in execution
6. Add validation rules in `src/lib/validation/canvas.ts` if needed
7. Document the fields in `docs/schema.md`

## Reporting issues

Please open a GitHub Issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser / OS / Node version

## Commit style

```
feat: add human-loop notification channel
fix: prevent validation loop in Canvas useEffect
docs: update schema.md with state_node fields
```

Use the imperative mood (`add`, `fix`, `update`) — not `added`, `fixed`.
