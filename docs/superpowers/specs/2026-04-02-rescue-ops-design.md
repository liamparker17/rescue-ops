# rescue-ops — Design Specification

**Date:** 2026-04-02
**Status:** Approved
**Author:** Liam + Claude

---

## Overview

rescue-ops is a suite of three standalone Next.js 15 App Router applications demonstrating a business rescue operational management platform for South African practitioners operating under Chapter 6 of the Companies Act.

**Target audience:** Non-technical viewers (potential clients, business rescue practitioners, executives) evaluating the developer's capabilities. Each app must be instantly impressive and understandable on first load — no login, no multi-page navigation, no jargon.

**Aesthetic benchmark:** Group 5, Rothschild — understated, precise, authoritative. Clean typography, generous whitespace, muted professional palette.

---

## Architecture

### Monorepo (Turborepo)

```
rescue-ops/
├── apps/
│   ├── financial-triage/        → Next.js 15 App Router
│   │   ├── app/
│   │   │   ├── page.tsx         → Single-page dashboard
│   │   │   ├── layout.tsx       → Root layout, metadata, fonts
│   │   │   ├── globals.css
│   │   │   └── api/
│   │   │       ├── balances/route.ts
│   │   │       ├── triage/route.ts
│   │   │       └── seed/route.ts
│   │   ├── components/
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   ├── operations/              → Next.js 15 App Router
│   │   ├── app/
│   │   │   ├── page.tsx         → Single-page task board
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   └── api/
│   │   │       ├── tasks/route.ts
│   │   │       ├── tasks/[id]/route.ts
│   │   │       └── seed/route.ts
│   │   ├── components/
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── creditor-pipeline/       → Next.js 15 App Router
│       ├── app/
│       │   ├── page.tsx         → Single-page Kanban
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   └── api/
│       │       ├── creditors/route.ts
│       │       ├── creditors/[id]/route.ts
│       │       ├── creditors/[id]/communications/route.ts
│       │       └── seed/route.ts
│       ├── components/
│       ├── next.config.js
│       └── package.json
│
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   ├── index.ts
│   │   └── package.json
│   │
│   └── shared/
│       ├── audit.ts
│       ├── encryption.ts
│       ├── field-encryption.ts
│       ├── pagination.ts
│       ├── api-helpers.ts
│       ├── formatters.ts
│       ├── types.ts
│       └── package.json
│
├── turbo.json
├── package.json
├── vercel.json
├── .env.example
└── CLAUDE.md
```

### Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15 | App Router, React Server Components |
| TypeScript | 5 (strict) | Type safety |
| Prisma | 7 | ORM + migrations |
| Neon PostgreSQL | — | Shared database |
| Tailwind CSS | 4 | Styling |
| Recharts | latest | Charts (triage app only) |
| @react-pdf/renderer | latest | PDF generation |
| Zod | latest | All validation |
| Sentry | latest | Error tracking (client + server) |
| Vitest | latest | Unit tests |
| Turborepo | latest | Monorepo orchestration |

### No Auth

No login, no RBAC, no NextAuth.js. All apps are fully open. Audit logs track by IP/userAgent only.

### Shared Database

One Neon PostgreSQL database serves all three apps. Single Prisma schema in `packages/database/`. Each app imports `@rescue-ops/database` for the Prisma client and `@rescue-ops/shared` for utilities.

### Cross-App Linking

Light cross-linking via environment variables:
- `NEXT_PUBLIC_TRIAGE_URL` → Financial Triage app URL
- `NEXT_PUBLIC_OPS_URL` → Operations app URL
- `NEXT_PUBLIC_PIPELINE_URL` → Creditor Pipeline app URL

Links are subtle text links in headers. Never required for comprehension. **If an env var is absent or empty, the cross-link renders as disabled/greyed text (not a clickable link) to avoid 404s during development or when only some apps are deployed.**

---

## Design Palette

| Element | Value |
|---|---|
| Background | `#FAFAFA` (warm off-white) |
| Cards | `#FFFFFF` with `1px #E5E7EB` border, subtle shadow |
| Primary text | Slate-900 `#0F172A` |
| Secondary text | Slate-500 `#64748B` |
| Financial Triage accent | Muted teal `#0D9488` |
| Operations accent | Warm amber `#D97706` |
| Creditor Pipeline accent | Deep indigo `#4F46E5` |
| Negative/danger | Muted rose `#E11D48` |
| Positive/success | Muted emerald `#059669` |
| Typography | Inter (loaded via next/font/google), fallback -apple-system |

**Aesthetic:** Rothschild-level. Understated, precise, authoritative. No flashy animations. Subtle card elevation. Generous whitespace. Every element earns its place.

---

## Data Model (Prisma Schema)

### Core

```prisma
model Organisation {
  id              String   @id @default(cuid())
  name            String
  registrationNo  String?
  sector          String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  contacts        Contact[]
  balances        OpeningBalance[]
  tasks           OperationalTask[]
  creditors       Creditor[]
  auditLogs       AuditLog[]
}

model Contact {
  id        String   @id @default(cuid())
  orgId     String
  name      String
  role      String?
  email     String?    // Encrypted (AES-256-GCM)
  phone     String?    // Encrypted (AES-256-GCM)
  company   String?
  createdAt DateTime @default(now())

  org       Organisation @relation(fields: [orgId], references: [id])
  tasks     OperationalTask[]
  creditors Creditor[]
}
```

### Module 1: Financial Triage

```prisma
model OpeningBalance {
  id             String      @id @default(cuid())
  orgId          String
  accountCode    String
  accountName    String
  accountType    AccountType
  balanceInCents Int
  asAtDate       DateTime
  createdAt      DateTime    @default(now())

  org            Organisation @relation(fields: [orgId], references: [id])

  @@unique([orgId, accountCode])
}

enum AccountType {
  Asset
  Liability
  Equity
  Revenue
  Expense
}
```

### Module 2: Operations Stabiliser

```prisma
model OperationalTask {
  id            String       @id @default(cuid())
  orgId         String
  taskNumber    Int
  title         String
  description   String
  priority      TaskPriority
  status        TaskStatus   @default(Open)
  responsibleId String?
  dueDate       DateTime?
  completedAt   DateTime?
  cancelReason  String?
  cancelledAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  org           Organisation @relation(fields: [orgId], references: [id])
  responsible   Contact?     @relation(fields: [responsibleId], references: [id])

  @@unique([orgId, taskNumber])
}

enum TaskPriority {
  Critical
  High
  Normal
}

enum TaskStatus {
  Open
  InProgress
  Completed
  Cancelled
}

model TaskSequence {
  id      String @id @default(cuid())
  orgId   String @unique
  lastSeq Int    @default(0)
}
```

### Module 3: Creditor Pipeline

```prisma
model Creditor {
  id                 String        @id @default(cuid())
  orgId              String
  creditorName       String
  claimAmountInCents Int
  securityType       SecurityType
  stage              CreditorStage @default(Identified)
  contactId          String?
  lastContactDate    DateTime?
  votingStatus       VotingStatus  @default(Pending)
  notes              String?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  org                Organisation  @relation(fields: [orgId], references: [id])
  contact            Contact?      @relation(fields: [contactId], references: [id])
  communications     CreditorCommunication[]

  @@index([orgId, stage])
}

enum SecurityType {
  Secured
  Preferent
  Concurrent
}

enum CreditorStage {
  Identified
  Notified
  InNegotiation
  OfferMade
  Agreed
  Voted
}

enum VotingStatus {
  Pending
  For
  Against
  Abstained
}

model CreditorCommunication {
  id         String   @id @default(cuid())
  creditorId String
  method     String
  summary    String
  date       DateTime
  createdAt  DateTime @default(now())

  creditor   Creditor @relation(fields: [creditorId], references: [id])
}
```

### Audit Trail

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  orgId      String
  action     String
  entityType String
  entityId   String?
  changes    Json?
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  org        Organisation @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([orgId, entityType])
  @@index([orgId, createdAt])
  @@index([entityType, entityId])
}
```

### Key Data Decisions

- All money stored as **Int (cents)** — displayed as Rand via `formatters.ts`
- Expense-type opening balances represent **monthly run-rate amounts** (used directly in burn rate calculation). They are **not balance sheet items** and must be excluded from Total Assets / Total Liabilities / Total Equity calculations. The solvency ratio (Assets / Liabilities) uses only Asset, Liability, and Equity account types.
- Contact email and phone fields encrypted with **AES-256-GCM** (flipmodel pattern)
- No User model — no auth
- Organisation exists as a data container; one seeded org
- Auto-numbering via atomic `TaskSequence` upsert (flipmodel JournalEntry pattern)
- Audit logs track by ipAddress/userAgent only (no userId)

---

## App 1: Financial Triage Dashboard

**URL:** `triage.vercel.app`
**Accent:** Muted teal `#0D9488`
**Architecture:** Server Component page fetching `/api/triage` — arrives fully rendered, no loading spinners. Recharts wrapped in lightweight `"use client"` islands.

### Page Layout (top to bottom)

**Header Bar:**
- "Financial Triage" title + "rescue-ops" teal badge
- Org name: "Mpumalanga Steel Fabricators (Pty) Ltd"
- "Add Opening Balances" button → slide-over
- Subtle "Creditor Pipeline →" cross-link

**Hero Metrics Row (4 cards):**
| Card | Computation | Colour Logic |
|---|---|---|
| Cash Position | Sum of Asset balances where accountCode 1000-1099 | Neutral |
| Total Creditor Exposure | Sum of all Liability balances | Neutral |
| Solvency Ratio | Total Assets / Total Liabilities | Red <1, amber 1-1.5, green >1.5 |
| Monthly Burn Rate | Sum of Expense balances (monthly) | Neutral |

Card style: white bg, teal left border, large bold number, muted label above.

**Charts Row (50/50 split):**

Left — **Exposure by Security Class** (horizontal stacked bar, Recharts):
- Groups creditors by SecurityType (Secured / Preferent / Concurrent)
- Stacked bars showing claim amounts per security class
- Colours: Secured slate-700, Preferent teal-500, Concurrent slate-400
- Note: this is a security-class breakdown, not an aging analysis — more relevant for rescue triage where the priority question is "who has security over what?"

Right — **Cash Runway Projection** (line chart, Recharts):
- Three lines: 30/60/90 day projections
- Cash position minus (burn rate x months)
- Red zone shading below R0
- "Runway: X days" annotation at zero crossing

**Bottom Row (60/40 split):**

Left — **Top 10 Creditor Exposure** (table):
- Rank, Creditor Name (link → pipeline app), Claim (ZAR), Security Type badge, % of Total
- Proportional bar behind each row
- Sorted by claim descending

Right — **Balance Sheet Summary** (card):
- Total Assets, Total Liabilities, Total Equity
- Net position colour-coded

**Slide-Over — Add Opening Balances:**
- Account Code, Account Name, Account Type dropdown, Balance (ZAR → cents), As At Date
- Inline table form for rapid bulk entry
- "Save All" button, audit logged

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/balances` | GET | List opening balances (paginated) |
| `/api/balances` | POST | Create opening balance (Zod) |
| `/api/triage` | GET | Pre-computed dashboard: metrics, aging, runway, top 10 |
| `/api/seed` | POST | Reset + seed demo data |

### Performance

- `/api/triage` computes all metrics server-side, returns one shaped JSON blob
- Page is a Server Component — no client-side fetching waterfalls
- Sub-200ms target with Neon + Vercel same region
- Cache-Control headers as fallback if needed

---

## App 2: Operations Stabiliser

**URL:** `ops.vercel.app`
**Accent:** Warm amber `#D97706`

### Page Layout (top to bottom)

**Header Bar:**
- "Operations Stabiliser" title + "rescue-ops" amber badge
- Org name
- "New Task" button (amber) → slide-over
- Cross-links: "← Financial Triage" and "Creditor Pipeline →"

**Hero Stats Row (4 cards):**
| Card | Colour Logic |
|---|---|
| Open Tasks | Neutral slate |
| Critical | Rose if >0, green if 0 |
| In Progress | Amber |
| Completed This Week | Emerald |

Card style: white bg, amber left border.

**Task List (table):**

| Column | Content |
|---|---|
| # | `OT-0001` monospace |
| Title | Truncated with tooltip |
| Priority | Badge: Critical (rose), High (amber), Normal (slate) |
| Status | Badge: Open (yellow), In Progress (blue), Completed (green), Cancelled (grey) |
| Responsible | Contact name |
| Due Date | dd/mm/yyyy, red if overdue |
| Actions | Print PDF, Edit icons |

Default sort: Critical first → High → Normal. Within priority: overdue first → by due date ascending.

**Filter Bar (inline, above table):**
- Status dropdown, Priority dropdown, Search box
- Client-side filtering on pre-fetched data (fast for <100 tasks)

**Slide-Over — New / Edit Task:**
- Title (required), Description (required), Priority (radio, default Normal)
- Responsible Party (contact dropdown), Due Date (date picker)
- Cancel action: requires reason field

**PDF — Work Order:**
- A4 single page (radco WorkTicketPDF pattern)
- Header: "WORK ORDER" + OT-XXXX
- Org name, date, task details, responsible party
- Signature lines: "Assigned By" and "Accepted By"
- `printPdf.ts` pattern: dynamic import → blob → new window

**Auto-Numbering:**
- `TaskSequence.lastSeq` via **atomic `$transaction`** with `update` + `increment` (not read-then-write). This prevents duplicate OT numbers under concurrent requests. Pattern: `prisma.$transaction` at Serializable isolation, upsert the sequence row, increment `lastSeq`, return the new value — all in one atomic operation.
- Format: `"OT-" + padStart(4, "0")` → OT-0001, OT-0002, OT-0003...

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/tasks` | GET | List tasks (paginated, filterable) |
| `/api/tasks` | POST | Create task (Zod, auto-number) |
| `/api/tasks/[id]` | GET | Single task + contact |
| `/api/tasks/[id]` | PATCH | Update / cancel with reason |
| `/api/seed` | POST | Reset + seed demo data |

---

## App 3: Creditor Pipeline

**URL:** `creditors.vercel.app`
**Accent:** Deep indigo `#4F46E5`

### Page Layout (top to bottom)

**Header Bar:**
- "Creditor Pipeline" title + "rescue-ops" indigo badge
- Org name
- "Add Creditor" button (indigo) → slide-over
- "Export Summary PDF" button (outline). **Loading state:** button shows a spinner and is disabled during PDF generation (1-3s for large creditor tables) to prevent double-clicks.
- Cross-link: "← Financial Triage"

**Summary Stats Row (4 cards):**
| Card | Detail |
|---|---|
| Total Claims | Sum of all claims (ZAR) |
| Secured | Amount + creditor count badge |
| Preferent | Amount + creditor count badge |
| Concurrent | Amount + creditor count badge |

Card style: white bg, indigo left border. Security type cards with subtle tinted backgrounds matching triage aging pyramid colours.

**Kanban Board (6 columns):**

```
Identified → Notified → In Negotiation → Offer Made → Agreed → Voted
```

Column header: Stage name + count + total claim for stage.

**Creditor Card:**
- Creditor name + Security type badge (S/P/C)
- Claim amount (large, ZAR)
- Contact person name
- Last contact date (dd/mm/yyyy)
- Voting status badge (Pending/For/Against/Abstained)
- Left/right stage move buttons (no drag-and-drop)
- Click body → detail slide-over

**No drag-and-drop.** Explicit move buttons are clearer for non-technical viewers.

**Slide-Over — Creditor Detail / Add / Edit (~500px wide):**

Top — Creditor Info (editable):
- Creditor Name, Claim Amount (ZAR → cents), Security Type (radio)
- Stage (dropdown), Contact Person (contact dropdown), Voting Status (radio)
- Notes (textarea)

Bottom — Communication Timeline:
- Chronological list (newest first): date, method badge (Email/Phone/Meeting/Letter), summary
- "Add Communication" inline form: date, method dropdown, summary, "Add" button

**PDF — Creditor Summary Report:**
- A4, multi-page (not dual-copy pattern)
- Header: "CREDITOR SUMMARY REPORT" + org + date
- Summary: total claims, breakdown by security type
- Voting summary: For/Against/Abstained/Pending counts + amounts
- Full creditor table: #, Creditor, Claim (ZAR), Security, Stage, Voting, Last Contact
- Sorted: Secured (largest first) → Preferent → Concurrent
- **Page breaks:** Creditor table paginates at 20 rows per page. Table headers repeat on each page. This handles real engagements with 40+ creditors gracefully.
- Footer: generation date + page numbers

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/creditors` | GET | List creditors (paginated, filterable by stage/security) |
| `/api/creditors` | POST | Create creditor (Zod) |
| `/api/creditors/[id]` | GET | Single creditor + communications + contact |
| `/api/creditors/[id]` | PATCH | Update creditor |
| `/api/creditors/[id]/communications` | GET | List communications |
| `/api/creditors/[id]/communications` | POST | Add communication |
| `/api/seed` | POST | Reset + seed demo data |

---

## Seed Data

### Organisation
- **Name:** Mpumalanga Steel Fabricators (Pty) Ltd
- **Registration:** 2018/234567/07
- **Sector:** Steel Fabrication & Construction

### Contacts (10)

| Name | Role | Company |
|---|---|---|
| Thabo Molefe | Workshop Foreman | Mpumalanga Steel |
| Sarah Chen | Financial Controller | Mpumalanga Steel |
| David Nkosi | Operations Manager | Mpumalanga Steel |
| Pieter Joubert | Business Rescue Liaison | Nedbank |
| Amanda Pretorius | Collections Manager | WesBank |
| Ravi Govender | Key Account Manager | ArcelorMittal |
| Johan van Wyk | Credit Controller | Macsteel |
| Sipho Dlamini | Account Manager | Eskom |
| Linda Fourie | Property Manager | Titan Properties |
| Mark Thompson | Regional Sales Manager | Afrox |

### Opening Balances (as at 01/03/2026)

| Code | Account | Type | Balance |
|---|---|---|---|
| 1000 | FNB Current Account | Asset | R 340,000 |
| 1001 | Petty Cash | Asset | R 8,500 |
| 1100 | Trade Debtors | Asset | R 1,250,000 |
| 1200 | Raw Materials Inventory | Asset | R 890,000 |
| 1300 | Machinery & Equipment | Asset | R 3,200,000 |
| 1400 | Vehicles | Asset | R 1,450,000 |
| 2000 | FNB Overdraft Facility | Liability | R 750,000 |
| 2100 | Trade Creditors | Liability | R 4,680,000 |
| 2200 | SARS — VAT Payable | Liability | R 520,000 |
| 2201 | SARS — PAYE Payable | Liability | R 380,000 |
| 2300 | Nedbank Term Loan | Liability | R 2,100,000 |
| 2400 | Vehicle Finance — WesBank | Liability | R 980,000 |
| 2500 | Directors' Loans | Liability | R 600,000 |
| 3000 | Share Capital | Equity | R 100,000 |
| 3100 | Retained Earnings (Loss) | Equity | -R 2,972,000 |
| 5000 | Salaries & Wages | Expense | R 480,000/mo |
| 5100 | Rent — Workshop | Expense | R 65,000/mo |
| 5200 | Electricity | Expense | R 42,000/mo |
| 5300 | Insurance | Expense | R 18,000/mo |
| 5400 | Vehicle Running Costs | Expense | R 35,000/mo |

**Resulting metrics:** Cash R 348,500 | Liabilities R 10,010,000 | Solvency 0.71 | Burn R 640,000/mo | Runway ~16 days

### Operational Tasks (10)

| # | Title | Priority | Status | Responsible | Due |
|---|---|---|---|---|---|
| OT-0001 | Secure workshop premises — change locks & alarm codes | Critical | Open | Thabo Molefe | 03/03/2026 |
| OT-0002 | Freeze all non-essential bank payments | Critical | Completed | Sarah Chen | 02/03/2026 |
| OT-0003 | Inventory count — raw materials & finished goods | Critical | InProgress | David Nkosi | 05/03/2026 |
| OT-0004 | Notify all employees of business rescue — Section 145 | High | Completed | — | 01/03/2026 |
| OT-0005 | Obtain 3 months bank statements — FNB & Nedbank | High | InProgress | Sarah Chen | 07/03/2026 |
| OT-0006 | Secure IT systems — change admin passwords | High | Open | Thabo Molefe | 04/03/2026 |
| OT-0007 | Review all current contracts & purchase orders | Normal | Open | David Nkosi | 14/03/2026 |
| OT-0008 | Assess workshop equipment condition | Normal | Open | Thabo Molefe | 10/03/2026 |
| OT-0009 | Contact major debtors — arrange accelerated collection | High | Open | Sarah Chen | 08/03/2026 |
| OT-0010 | Prepare preliminary cash flow forecast | Normal | Open | — | 12/03/2026 |

### Creditors (8)

| Creditor | Claim | Security | Stage | Voting | Contact |
|---|---|---|---|---|---|
| Nedbank Ltd | R 2,100,000 | Secured | InNegotiation | Pending | Pieter Joubert |
| WesBank (FirstRand) | R 980,000 | Secured | Notified | Pending | Amanda Pretorius |
| ArcelorMittal SA | R 1,850,000 | Concurrent | OfferMade | For | Ravi Govender |
| Macsteel Service Centres | R 1,200,000 | Concurrent | InNegotiation | Pending | Johan van Wyk |
| SARS | R 900,000 | Preferent | Identified | Pending | — |
| Eskom | R 380,000 | Concurrent | Notified | Pending | Sipho Dlamini |
| Titan Properties (Landlord) | R 650,000 | Concurrent | Agreed | For | Linda Fourie |
| Afrox (Linde) | R 600,000 | Concurrent | Notified | Pending | Mark Thompson |

Each creditor seeded with 2-3 communications. **Tone: real practitioner notes, not placeholder text.** Examples:
- Nedbank: "Discussed proposal to restructure term loan over 36 months at prime + 2%. Bank requested updated cash flow projections before next meeting." (Meeting, 10/03/2026)
- Nedbank: "Emailed revised cash flow forecast. Highlighted that continued trading generates R 180k/month toward debt service." (Email, 15/03/2026)
- ArcelorMittal: "Ravi confirmed ArcelorMittal willing to accept 60c/R1 settlement paid over 12 months. Requires board approval — expects response by 20/03." (Phone, 12/03/2026)
- SARS: "Filed Form BR1 notification. Auto-generated acknowledgement received. No case officer assigned yet." (Letter, 02/03/2026)
- Titan Properties: "Linda agreed to 50% rent reduction for 6 months in exchange for lease extension. Drafting written agreement." (Meeting, 18/03/2026)

---

## Shared Utilities (packages/shared/)

### audit.ts
Adapted verbatim from flipmodel. `writeAuditLog(entry)` — non-blocking write. `diffChanges(original, updated, fields)` — field-level change tracking. No userId field (no auth).

### encryption.ts
Adapted verbatim from flipmodel. AES-256-GCM. `encrypt(plaintext)`, `decrypt(encrypted)`, `isEncrypted(value)`. Key from `ENCRYPTION_KEY` env var (64-char hex).

### field-encryption.ts
Adapted from flipmodel. `SENSITIVE_FIELDS = ["email", "phone"]`. `encryptSensitiveFields()`, `decryptSensitiveFields()`, `maskSensitiveField()`.

### pagination.ts
Adapted from flipmodel. `parsePagination(req)` → `{ page, limit, skip }`. `paginatedResult(data, total, pagination)` → `{ data, pagination: { page, limit, total, totalPages, hasMore } }`.

### api-helpers.ts
Adapted from flipmodel minus auth. `apiSuccess(data, status)`, `handleApiError(error)`. Error handling: ZodError → 400, NotFoundError → 404, Prisma P2002 → 409, P2025 → 404, default → 500 + Sentry.

### formatters.ts
- `formatZAR(cents: number): string` → "R 1,234,567.89" (handles negatives: "-R 2,972,000.00")
- `formatDate(date: Date): string` → "02/04/2026" (dd/mm/yyyy)
- `centsToRand(cents: number): number` → 12345.67
- `randToCents(rand: number): number` → 1234567

---

## Patterns Adapted from Source Repos

| Pattern | Source | Adaptation |
|---|---|---|
| RBAC / permissions | flipmodel | **Removed** — no auth |
| Audit trail | flipmodel `audit.ts` | Verbatim minus userId |
| AES-256-GCM encryption | flipmodel `encryption.ts` | Verbatim |
| Field encryption | flipmodel `field-encryption.ts` | Fields changed to email/phone |
| Pagination | flipmodel `pagination.ts` | Verbatim |
| API error handling | flipmodel `api-helpers.ts` | Minus auth errors |
| Financial statements | flipmodel GL module | Simplified to opening balances + computed metrics |
| Kanban pipeline | flipmodel pipeline | Stages changed to creditor negotiation flow |
| PDF generation | radco `PDFTemplates.tsx` | Two new templates: Work Order, Creditor Summary |
| Print helper | radco `printPdf.ts` | Verbatim |
| Auto-numbering | flipmodel `JournalEntrySequence` | Applied to TaskSequence (OT-XXXX) |
| ESM config | radco `next.config.js` | esmExternals + canvas alias for @react-pdf/renderer |
| Sentry | flipmodel `sentry.*.config.ts` | Verbatim |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...@neon.tech/rescue-ops

# Encryption
ENCRYPTION_KEY=<64-char-hex>

# Sentry
NEXT_PUBLIC_SENTRY_DSN=<dsn>

# Cross-app links
NEXT_PUBLIC_TRIAGE_URL=https://triage.vercel.app
NEXT_PUBLIC_OPS_URL=https://ops.vercel.app
NEXT_PUBLIC_PIPELINE_URL=https://creditors.vercel.app
```

---

## Constraints

- South African locale: ZAR currency, dd/mm/yyyy dates throughout
- All financial figures stored as Int (cents), displayed as Rand
- Audit trail on every mutation (action, entityType, entityId, changes, ipAddress, userAgent)
- AES-256-GCM encryption on Contact email and phone fields
- All list endpoints paginated: `{ data, pagination }` response format
- Zod validation on all POST/PATCH request bodies
- No new dependencies outside the specified stack
