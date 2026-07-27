# Birth Prep Board

Interactive web app for birth preparation: weekly timeline with
progress tracking, categorized checklists, budget tracker.
Personal/family tool for now, possibly public later. UI language: Ukrainian.

## Stack
- Next.js 16 (App Router, TypeScript, src/ dir, "@/*" alias)
- Tailwind CSS v4 + shadcn/ui
- Supabase (cloud free tier): Postgres + Auth + sync across devices
- Package manager: pnpm ONLY

## Commands
- pnpm dev          # dev server, localhost:3000
- pnpm build        # production build — run before considering a task done
- pnpm lint         # eslint

## Architecture decisions
- Core screen: timeline by pregnancy weeks with progress bar
  and "focus of the week" block
- Sections: dashboard, documents, hospital bag, baby items, home,
  medical, budget, people & logistics, postpartum
- Auth required (no localStorage-only mode), data synced via Supabase
- Checklist items with prices feed the budget tracker

## Conventions
- Server Components by default; "use client" only when needed
- Data access only through src/lib/supabase/ — no direct client calls
  scattered in components
- Never expose SUPABASE_SERVICE_ROLE_KEY to client code
- Spec lives in docs/spec.md — read it before implementing features