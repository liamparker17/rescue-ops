# rescue-ops — Handover Document

**Date:** 2026-04-02
**From:** Claude Code (Opus)
**To:** Codex or next agent
**Status:** Code complete, deployment blocked

---

## What's Done

The entire rescue-ops monorepo is fully scaffolded, builds cleanly, and the database is seeded with demo data. **Zero code work remains.**

### Git State
- **10 commits** on `master` branch
- **Repo:** https://github.com/liamparker17/rescue-ops
- All code pushed to GitHub

### Project Structure (verified working)
```
rescue-ops/
├── apps/
│   ├── financial-triage/   (port 3001) — 23 files, builds clean
│   ├── operations/         (port 3002) — 22 files, builds clean
│   └── creditor-pipeline/  (port 3003) — 22 files, builds clean
├── packages/
│   ├── database/           — Prisma schema + client + seed script
│   └── shared/             — audit, encryption, pagination, formatters, api-helpers
├── turbo.json, package.json, CLAUDE.md, .env
└── docs/superpowers/specs/ + plans/
```

### Database (Neon — LIVE and seeded)
- **Project:** `holy-tooth-29406935` on Neon (aws-eu-central-1)
- **Connection:** `postgresql://neondb_owner:npg_IQzUJhHkK5o6@ep-old-flower-agiry36h.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require`
- **Schema pushed:** All 10 models created
- **Seeded:** 1 org, 10 contacts, 20 opening balances, 10 tasks, 8 creditors, 21 communications

### Encryption Key (in .env)
```
bda29fd2f825d90804179b1b3b6ce927ac83f4ae857a318ba175875cf751b5eb
```

### Tests
- 9/9 Vitest formatter tests passing (`packages/shared/formatters.test.ts`)

---

## What's NOT Done — Vercel Deployment

All three apps need to be deployed to Vercel. Multiple CLI approaches failed:

### What Was Tried (all failed)
1. **Deploy from app directory with `installCommand: "cd ../.. && npm install"`** — Vercel's build environment doesn't have the monorepo root when deploying from a subdirectory. Error: `npm error Tracker "idealTree" already exists`
2. **Deploy from monorepo root** — Same issue, the cached project settings still had the old installCommand
3. **`vercel build --prod` (prebuilt deploy)** — Windows symlink error: `EPERM: operation not permitted, symlink`
4. **Deleted and recreated projects** — The installCommand from `vercel.json` gets auto-detected and cached

### What Should Work

**Option A: Vercel Dashboard (recommended, 5 minutes)**

The GitHub repo is already connected to the `rescue-ops-triage` Vercel project. For each app:

1. Go to https://vercel.com/liamparker17s-projects
2. Open each project (rescue-ops-triage, rescue-ops-operations, rescue-ops-pipeline)
3. Go to Settings → General → Root Directory
4. Set to `apps/financial-triage`, `apps/operations`, or `apps/creditor-pipeline` respectively
5. Go to Settings → Environment Variables
6. Add `DATABASE_URL` and `ENCRYPTION_KEY` (values above) for Production
7. Trigger a redeploy from the Deployments tab

The three Vercel projects already exist:
- `rescue-ops-triage` (Git connected to liamparker17/rescue-ops)
- `rescue-ops-operations` (not yet Git connected)
- `rescue-ops-pipeline` (not yet Git connected)

For operations and pipeline, you'll need to connect them to the same GitHub repo first (Settings → Git → Connect), then set the root directory.

**Option B: Vercel API (programmatic)**

Use the Vercel REST API to PATCH each project's `rootDirectory` setting:

```bash
# Get token from Vercel dashboard → Settings → Tokens
VERCEL_TOKEN="<token>"
TEAM_ID="team_NFDcIuXZduFnHxAaQoATyhFc"

# For each project, update root directory:
curl -X PATCH "https://api.vercel.com/v9/projects/rescue-ops-triage?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory": "apps/financial-triage", "framework": "nextjs"}'

curl -X PATCH "https://api.vercel.com/v9/projects/rescue-ops-operations?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory": "apps/operations", "framework": "nextjs"}'

curl -X PATCH "https://api.vercel.com/v9/projects/rescue-ops-pipeline?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory": "apps/creditor-pipeline", "framework": "nextjs"}'
```

Then connect Git and add env vars for operations + pipeline:
```bash
# Connect Git for remaining projects
curl -X POST "https://api.vercel.com/v9/projects/rescue-ops-operations/link?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "github", "repo": "liamparker17/rescue-ops"}'

# Same for pipeline...

# Then push a commit to trigger all three builds
cd "/c/Users/liamp/OneDrive/Desktop/Portfolio/OPS projects/rescue-ops"
git commit --allow-empty -m "trigger: deploy all apps"
git push
```

**Option C: Deploy prebuilt from Linux/Mac**

The `vercel build --prod && vercel deploy --prebuilt --prod` approach works on Linux/Mac (no Windows symlink issue). If Codex runs on Linux, this approach will work:

```bash
cd apps/financial-triage
vercel link --yes --project rescue-ops-triage
vercel pull --yes --environment production
vercel build --prod
vercel deploy --prebuilt --prod
# Repeat for operations and pipeline
```

---

## After Deployment — Cross-App Links

Once all three apps are deployed, update the env vars on each Vercel project to set the cross-app URLs:

| Project | Env Var | Value |
|---|---|---|
| rescue-ops-triage | `NEXT_PUBLIC_PIPELINE_URL` | `https://<pipeline-domain>.vercel.app` |
| rescue-ops-operations | `NEXT_PUBLIC_TRIAGE_URL` | `https://<triage-domain>.vercel.app` |
| rescue-ops-operations | `NEXT_PUBLIC_PIPELINE_URL` | `https://<pipeline-domain>.vercel.app` |
| rescue-ops-pipeline | `NEXT_PUBLIC_TRIAGE_URL` | `https://<triage-domain>.vercel.app` |

Then redeploy each app for the env vars to take effect.

---

## Local Dev (works right now)

```bash
cd "/c/Users/liamp/OneDrive/Desktop/Portfolio/OPS projects/rescue-ops"
npm run dev
# Opens all 3 apps: localhost:3001, :3002, :3003
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `packages/database/prisma/schema.prisma` | All 10 models, 5 enums |
| `packages/database/prisma/seed.ts` | Demo data seeder |
| `packages/shared/index.ts` | All shared utility exports |
| `apps/financial-triage/app/api/triage/route.ts` | Pre-computed dashboard endpoint |
| `apps/operations/app/api/tasks/route.ts` | Task CRUD with atomic auto-numbering |
| `apps/creditor-pipeline/app/api/creditors/route.ts` | Creditor CRUD |
| `apps/creditor-pipeline/components/KanbanBoard.tsx` | 6-column Kanban |
| `docs/superpowers/specs/2026-04-02-rescue-ops-design.md` | Full approved spec |
| `docs/superpowers/plans/2026-04-02-rescue-ops-plan.md` | Implementation plan |
| `CLAUDE.md` | Domain rules and patterns |

---

## Version Notes

- **Prisma 6** (not 7) — Prisma 7 changed config approach, 6 works fine
- **Tailwind CSS 3** (not 4) — v4 uses CSS-first config incompatible with postcss plugin approach
- **`en-ZA` locale** uses spaces as thousands separator and commas as decimal separator in `toLocaleString` — formatter tests account for this
