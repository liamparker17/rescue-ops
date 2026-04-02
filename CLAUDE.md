# rescue-ops — CLAUDE.md

## What This Is
A Turborepo monorepo with three Next.js 15 portfolio apps demonstrating a business rescue management platform for South African practitioners.

## Architecture
- `apps/financial-triage` (port 3001) — Day 1 financial diagnosis dashboard
- `apps/operations` (port 3002) — Operational task management
- `apps/creditor-pipeline` (port 3003) — Creditor negotiation Kanban
- `packages/database` — Shared Prisma schema + client (Neon PostgreSQL)
- `packages/shared` — Audit, encryption, pagination, formatters, API helpers

## Commands
- `npm run dev` — Start all three apps
- `npm run dev:triage` / `dev:ops` / `dev:pipeline` — Start individual app
- `npm run db:push` — Push schema to database
- `npm run db:seed` — Seed demo data (Mpumalanga Steel Fabricators)
- `npm run build` — Build all apps
- `npm run test` — Run all tests

## Domain Rules
- All money stored as **cents (Int)**. Use `formatZAR()` for display.
- Expense-type opening balances are **monthly run-rates**, NOT balance sheet items. Exclude from solvency calculations.
- Task auto-numbering uses atomic `$transaction` with Serializable isolation. Never read-then-write.
- Contact email/phone encrypted with AES-256-GCM. Requires `ENCRYPTION_KEY` env var.
- Audit trail on every mutation. No auth — tracks IP/userAgent only.
- Cross-app links disabled gracefully when env var is absent.
- SA locale: ZAR currency, dd/mm/yyyy dates, `en-ZA` formatting.

## Patterns
- API routes: Zod validation → business logic → audit log → response
- Pagination: `{ data, pagination: { page, limit, total, totalPages, hasMore } }`
- Error handling: ZodError→400, NotFound→404, P2002→409, P2025→404, default→500+Sentry
- PDFs: @react-pdf/renderer with `printPdf()` helper (dynamic import → blob → new window)
- ESM config for PDF: `esmExternals: "loose"` + `webpack.resolve.alias.canvas = false`

## Tech Stack
Next.js 15, TypeScript 5 (strict), Prisma, Neon PostgreSQL, Tailwind CSS, Recharts, @react-pdf/renderer, Zod, Sentry, Vitest, Turborepo
