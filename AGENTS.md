<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Klasiki Admin — Project Context

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui (Mira style preset)
- Icons: @hugeicons/react + @hugeicons/core-free-icons
- Data fetching: TanStack Query
- Forms: React Hook Form + Zod
- Charts: Recharts

## Brand tokens (see app/globals.css)

- Primary/accent: saddle tan (#8A5A34)
- Background: bone white (#F5F2EC)
- Foreground: ink black (#0E0D0C)
- No dark mode — light theme only

## Conventions

- Single admin user for now — no multi-role auth
- Auth via httpOnly cookie set by the NestJS backend, checked in middleware.ts
- API base URL comes from NEXT_PUBLIC_API_URL env var
- NEXT_PUBLIC_SKIP_AUTH=true in .env.local disables the auth guard for local dev without a live backend

## Backend

- Separate repo, built by backend friend in NestJS
- No payment gateway — COD only, confirmation via bKash
