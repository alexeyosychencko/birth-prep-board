# Birth Prep Board

Interactive web app for birth preparation: weekly timeline with
progress tracking, categorized checklists, budget tracker.
Personal/family tool for now, possibly public later. UI language: Ukrainian.

## Stack
- Next.js 16 (App Router, TypeScript, src/ dir, "@/*" alias)
- Tailwind CSS v4 + shadcn/ui (Base UI, not Radix, base-maia style)
- hugeicons (@hugeicons/core-free-icons, free/MIT)
- Figtree (font)
- next-themes
- Supabase (cloud free tier): Postgres + Auth + sync across devices
- Package manager: pnpm ONLY

## Commands
- pnpm dev          # dev server, localhost:3000
- pnpm build        # production build — run before considering a task done
- pnpm lint         # eslint
- pnpm typecheck    # tsc --noEmit
- pnpm test         # vitest

## Task triage

- First action on any request is classification, not file reading.
- If the prompt already names concrete files, concrete changes, and the
  reasoning behind them — that's a ready-made plan. Execute directly.
  Don't launch Explore, don't call write-plan, don't re-plan what's
  already specified.
- Research or planning is justified when: scope is undefined ("add
  feature X"), no files are named, or there's a real choice between
  multiple approaches.
- The criterion is how specific the instruction is, not how many files
  are touched. Five described edits across five files need no research;
  one vague task in one file does.
- Unsure which category a task falls into? Ask one question. Don't
  research "just in case".

## Architecture decisions
- Core screen: timeline by pregnancy weeks with progress bar
  and "focus of the week" block
- Sections: dashboard, documents, hospital bag, baby items, home,
  medical, budget, people & logistics, postpartum
- Checklist items with prices feed the budget tracker

## Project phases

- Phase 1 (current): local data only. Entire MVP works without a
  backend. Not building: auth, onboarding, invite codes, sharing.
  One hardcoded household.
- Phase 2: Supabase — schema, RLS, migrations, auth, onboarding.

Rule: don't propose wiring up Supabase until Phase 1 is closed.
If a task looks like it can't be solved without a backend, say so
— don't start it.

## Conventions
- Server Components by default; "use client" only when needed
- Data access only through the repository contract — see
  .claude/rules/data-layer.md
- Never expose SUPABASE_SERVICE_ROLE_KEY to client code
- Spec lives in docs/spec.md — read it before implementing features
- Pure functions (formatting, calculations, constants) live in src/lib/,
  without "use client" and without 'server-only'. A client module holds
  components and hooks, not utilities — otherwise the server can't call
  them, and the breakage only surfaces the first time that branch runs.

## Subagents

- devil — plans, specs, DB schema, BEFORE code is written.
- reviewer — written code and diffs, AFTER implementation.

Both read-only, invoked explicitly by me. Don't pull them in
yourself without being asked.