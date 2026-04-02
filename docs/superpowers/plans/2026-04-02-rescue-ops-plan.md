# rescue-ops Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a Turborepo monorepo with three Next.js 15 App Router apps (Financial Triage, Operations Stabiliser, Creditor Pipeline) sharing a Prisma 7 database and utility packages.

**Architecture:** Turborepo monorepo at `C:\Users\liamp\OneDrive\Desktop\Portfolio\OPS projects\rescue-ops`. Three apps in `apps/`, two shared packages in `packages/`. Single Neon PostgreSQL database. No auth. Pre-seeded demo data. Each app is a single-page showcase.

**Tech Stack:** Next.js 15, TypeScript 5 (strict), Prisma 7, Neon PostgreSQL, Tailwind CSS 4, Recharts, @react-pdf/renderer, Zod, Sentry, Vitest, Turborepo

**Source Repos (read-only reference):**
- flipmodel: `/c/Users/liamp/flipmodel`
- radco: `/c/Users/liamp/OneDrive/Desktop/Portfolio/Radco Workticket helper/`

**Spec:** `docs/superpowers/specs/2026-04-02-rescue-ops-design.md`

---

## Task 1: Monorepo Root Scaffold

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `.npmrc`

- [ ] **Step 1: Initialize git repo**

```bash
cd "/c/Users/liamp/OneDrive/Desktop/Portfolio/OPS projects/rescue-ops"
git init
```

- [ ] **Step 2: Create root package.json**

```json
{
  "name": "rescue-ops",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:triage": "turbo run dev --filter=@rescue-ops/financial-triage",
    "dev:ops": "turbo run dev --filter=@rescue-ops/operations",
    "dev:pipeline": "turbo run dev --filter=@rescue-ops/creditor-pipeline",
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "db:generate": "turbo run db:generate --filter=@rescue-ops/database",
    "db:push": "turbo run db:push --filter=@rescue-ops/database",
    "db:migrate": "turbo run db:migrate --filter=@rescue-ops/database",
    "db:seed": "turbo run db:seed --filter=@rescue-ops/database"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "packageManager": "npm@10.8.0"
}
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
.next/
.turbo/
dist/
.env
.env.local
*.tsbuildinfo
.vercel
```

- [ ] **Step 5: Create .env.example**

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@host.neon.tech/rescue-ops?sslmode=require

# Encryption (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=

# Cross-app links (set to deployed URLs or localhost for dev)
NEXT_PUBLIC_TRIAGE_URL=http://localhost:3001
NEXT_PUBLIC_OPS_URL=http://localhost:3002
NEXT_PUBLIC_PIPELINE_URL=http://localhost:3003
```

- [ ] **Step 6: Create .npmrc**

```
auto-install-peers=true
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: monorepo root scaffold with Turborepo config"
```

---

## Task 2: Shared Database Package

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/tsconfig.json`
- Create: `packages/database/prisma/schema.prisma`
- Create: `packages/database/index.ts`

- [ ] **Step 1: Create packages/database/package.json**

```json
{
  "name": "@rescue-ops/database",
  "version": "0.0.0",
  "private": true,
  "main": "./index.ts",
  "types": "./index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "npx tsx prisma/seed.ts",
    "build": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^7.4.0"
  },
  "devDependencies": {
    "prisma": "^7.4.0",
    "tsx": "^4"
  }
}
```

- [ ] **Step 2: Create packages/database/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["esnext"],
    "strict": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create packages/database/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── CORE ───────────────────────────────────────────────────

model Organisation {
  id             String   @id @default(cuid())
  name           String
  registrationNo String?
  sector         String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  contacts  Contact[]
  balances  OpeningBalance[]
  tasks     OperationalTask[]
  creditors Creditor[]
  auditLogs AuditLog[]
}

model Contact {
  id        String   @id @default(cuid())
  orgId     String
  name      String
  role      String?
  email     String? // Encrypted (AES-256-GCM)
  phone     String? // Encrypted (AES-256-GCM)
  company   String?
  createdAt DateTime @default(now())

  org       Organisation      @relation(fields: [orgId], references: [id])
  tasks     OperationalTask[]
  creditors Creditor[]

  @@index([orgId])
}

// ─── MODULE 1: FINANCIAL TRIAGE ─────────────────────────────

model OpeningBalance {
  id             String      @id @default(cuid())
  orgId          String
  accountCode    String
  accountName    String
  accountType    AccountType
  balanceInCents Int
  asAtDate       DateTime
  createdAt      DateTime    @default(now())

  org Organisation @relation(fields: [orgId], references: [id])

  @@unique([orgId, accountCode])
  @@index([orgId])
}

enum AccountType {
  Asset
  Liability
  Equity
  Revenue
  Expense
}

// ─── MODULE 2: OPERATIONS STABILISER ────────────────────────

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

  org         Organisation @relation(fields: [orgId], references: [id])
  responsible Contact?     @relation(fields: [responsibleId], references: [id])

  @@unique([orgId, taskNumber])
  @@index([orgId])
  @@index([orgId, status])
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

// ─── MODULE 3: CREDITOR PIPELINE ────────────────────────────

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

  org            Organisation            @relation(fields: [orgId], references: [id])
  contact        Contact?                @relation(fields: [contactId], references: [id])
  communications CreditorCommunication[]

  @@index([orgId, stage])
  @@index([orgId])
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
  method     String // Email, Phone, Meeting, Letter
  summary    String
  date       DateTime
  createdAt  DateTime @default(now())

  creditor Creditor @relation(fields: [creditorId], references: [id])

  @@index([creditorId])
}

// ─── AUDIT TRAIL ────────────────────────────────────────────

model AuditLog {
  id         String   @id @default(cuid())
  orgId      String
  action     String // create, update, delete
  entityType String // opening_balance, task, creditor, communication
  entityId   String?
  changes    Json?
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  org Organisation @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([orgId, entityType])
  @@index([orgId, createdAt])
  @@index([entityType, entityId])
}
```

- [ ] **Step 4: Create packages/database/index.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
export { prisma };
export * from "@prisma/client";
```

- [ ] **Step 5: Install dependencies and generate client**

```bash
cd "/c/Users/liamp/OneDrive/Desktop/Portfolio/OPS projects/rescue-ops"
npm install
cd packages/database
npx prisma generate
```

- [ ] **Step 6: Commit**

```bash
cd "/c/Users/liamp/OneDrive/Desktop/Portfolio/OPS projects/rescue-ops"
git add -A
git commit -m "feat: database package with full Prisma schema"
```

---

## Task 3: Shared Utilities Package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/audit.ts`
- Create: `packages/shared/encryption.ts`
- Create: `packages/shared/field-encryption.ts`
- Create: `packages/shared/pagination.ts`
- Create: `packages/shared/api-helpers.ts`
- Create: `packages/shared/formatters.ts`
- Create: `packages/shared/types.ts`
- Create: `packages/shared/index.ts`

- [ ] **Step 1: Create packages/shared/package.json**

```json
{
  "name": "@rescue-ops/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./index.ts",
  "types": "./index.ts",
  "scripts": {
    "build": "echo 'no build step — consumed as TypeScript'"
  },
  "dependencies": {
    "@sentry/nextjs": "^10",
    "zod": "^3"
  },
  "peerDependencies": {
    "@rescue-ops/database": "*",
    "next": "^15"
  }
}
```

- [ ] **Step 2: Create packages/shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "skipLibCheck": true,
    "jsx": "react-jsx"
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create packages/shared/encryption.ts**

Adapted from flipmodel `app/lib/encryption.ts` — verbatim.

```typescript
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is required. " +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return buf;
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString("base64");
}

export function decrypt(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const packed = Buffer.from(encryptedBase64, "base64");
  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}

export function isEncrypted(value: string): boolean {
  if (!value || value.length < 44) return false;
  try {
    const buf = Buffer.from(value, "base64");
    return buf.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Create packages/shared/field-encryption.ts**

Adapted from flipmodel — fields changed to `email` and `phone`.

```typescript
import { encrypt, decrypt } from "./encryption";

const SENSITIVE_FIELDS = ["email", "phone"] as const;

export function encryptSensitiveFields<T extends Record<string, unknown>>(
  data: T,
  fields: readonly string[] = SENSITIVE_FIELDS
): T {
  const result = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === "string" && value.length > 0) {
      try {
        (result as Record<string, unknown>)[field] = encrypt(value);
      } catch {
        // If encryption fails (e.g., no ENCRYPTION_KEY in dev), leave as-is
      }
    }
  }
  return result;
}

export function decryptSensitiveFields<T extends Record<string, unknown>>(
  data: T,
  fields: readonly string[] = SENSITIVE_FIELDS
): T {
  const result = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === "string" && value.length > 0) {
      try {
        (result as Record<string, unknown>)[field] = decrypt(value);
      } catch {
        // If decryption fails, return as-is (might be unencrypted)
      }
    }
  }
  return result;
}

export function maskSensitiveField(value: string | null | undefined): string {
  if (!value || value.length < 4) return "****";
  return "****" + value.slice(-4);
}
```

- [ ] **Step 5: Create packages/shared/audit.ts**

Adapted from flipmodel — removed `userId` (no auth), imports prisma from `@rescue-ops/database`.

```typescript
import prisma from "@rescue-ops/database";

export interface AuditEntry {
  orgId: string;
  action: "create" | "update" | "delete";
  entityType: string;
  entityId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        orgId: entry.orgId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        changes: entry.changes ? (entry.changes as object) : undefined,
        metadata: entry.metadata ? (entry.metadata as object) : undefined,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log", {
      error: error instanceof Error ? error.message : "Unknown error",
      entry: { action: entry.action, entityType: entry.entityType, entityId: entry.entityId },
    });
  }
}

export function diffChanges(
  original: Record<string, unknown>,
  updated: Record<string, unknown>,
  fields: string[]
): Record<string, { old: unknown; new: unknown }> | undefined {
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  for (const field of fields) {
    const oldVal = original[field];
    const newVal = updated[field];
    if (newVal !== undefined && JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[field] = { old: oldVal, new: newVal };
    }
  }
  return Object.keys(changes).length > 0 ? changes : undefined;
}
```

- [ ] **Step 6: Create packages/shared/pagination.ts**

Verbatim from flipmodel.

```typescript
import { NextRequest } from "next/server";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export function parsePagination(req: NextRequest): PaginationParams {
  const params = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  const rawLimit = parseInt(params.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasMore: params.page < totalPages,
    },
  };
}
```

- [ ] **Step 7: Create packages/shared/api-helpers.ts**

Adapted from flipmodel — removed all auth classes and wrappers.

```typescript
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  public code: string;
  constructor(code: string, message?: string) {
    super(message || code);
    this.name = "ValidationError";
    this.code = code;
  }
}

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof NotFoundError) {
    return apiError(error.message, 404);
  }
  if (error instanceof ValidationError) {
    return apiError(error.message, 400);
  }
  if (error instanceof ZodError) {
    return apiError(error.issues.map((e) => e.message).join(", "), 400);
  }
  // Prisma unique constraint violation
  if (
    error instanceof Error &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    const meta = (error as { meta?: { target?: string[] } }).meta;
    const fields = meta?.target?.join(", ") || "unknown field";
    return NextResponse.json(
      { error: `Duplicate record — a conflicting entry already exists on: ${fields}`, code: "DUPLICATE_RECORD" },
      { status: 409 }
    );
  }
  // Prisma record not found
  if (
    error instanceof Error &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  ) {
    return apiError("Record not found or was deleted by another user", 404);
  }
  Sentry.captureException(error);
  console.error("Unhandled API error", error instanceof Error ? error.message : "Unknown");
  return apiError("Internal server error", 500);
}

/**
 * Extract client IP and user agent from request headers for audit logging.
 */
export function extractRequestMeta(req: Request): { ipAddress: string; userAgent: string } {
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}
```

- [ ] **Step 8: Create packages/shared/formatters.ts**

```typescript
/**
 * Format cents (integer) to ZAR display string.
 * formatZAR(34000000) → "R 340,000.00"
 * formatZAR(-297200000) → "-R 2,972,000.00"
 */
export function formatZAR(cents: number): string {
  const isNegative = cents < 0;
  const absolute = Math.abs(cents);
  const rand = absolute / 100;
  const formatted = rand.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-R ${formatted}` : `R ${formatted}`;
}

/**
 * Format a Date to dd/mm/yyyy string.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Convert cents (integer) to Rand (number).
 */
export function centsToRand(cents: number): number {
  return cents / 100;
}

/**
 * Convert Rand (number) to cents (integer). Rounds to avoid floating point issues.
 */
export function randToCents(rand: number): number {
  return Math.round(rand * 100);
}
```

- [ ] **Step 9: Create packages/shared/types.ts**

```typescript
// Shared types used across all three apps.

export const CREDITOR_STAGES = [
  "Identified",
  "Notified",
  "InNegotiation",
  "OfferMade",
  "Agreed",
  "Voted",
] as const;

export const CREDITOR_STAGE_LABELS: Record<string, string> = {
  Identified: "Identified",
  Notified: "Notified",
  InNegotiation: "In Negotiation",
  OfferMade: "Offer Made",
  Agreed: "Agreed",
  Voted: "Voted",
};

export const SECURITY_TYPE_LABELS: Record<string, string> = {
  Secured: "Secured",
  Preferent: "Preferent",
  Concurrent: "Concurrent",
};

export const TASK_PRIORITY_ORDER: Record<string, number> = {
  Critical: 0,
  High: 1,
  Normal: 2,
};

export const COMMUNICATION_METHODS = ["Email", "Phone", "Meeting", "Letter"] as const;

/** The single org ID used across all seed data and API defaults. */
export const DEFAULT_ORG_ID = "org_mpumalanga_steel";
```

- [ ] **Step 10: Create packages/shared/index.ts**

```typescript
export { encrypt, decrypt, isEncrypted } from "./encryption";
export { encryptSensitiveFields, decryptSensitiveFields, maskSensitiveField } from "./field-encryption";
export { writeAuditLog, diffChanges, type AuditEntry } from "./audit";
export { parsePagination, paginatedResult, type PaginationParams, type PaginatedResponse } from "./pagination";
export { apiSuccess, apiError, handleApiError, extractRequestMeta, NotFoundError, ValidationError } from "./api-helpers";
export { formatZAR, formatDate, centsToRand, randToCents } from "./formatters";
export {
  CREDITOR_STAGES,
  CREDITOR_STAGE_LABELS,
  SECURITY_TYPE_LABELS,
  TASK_PRIORITY_ORDER,
  COMMUNICATION_METHODS,
  DEFAULT_ORG_ID,
} from "./types";
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: shared utilities package — audit, encryption, pagination, formatters, api-helpers"
```

---

## Task 4: Seed Script

**Files:**
- Create: `packages/database/prisma/seed.ts`

- [ ] **Step 1: Create packages/database/prisma/seed.ts**

This file seeds the full demo scenario: Mpumalanga Steel Fabricators, 10 contacts, 20 opening balances, 10 tasks, 8 creditors with communications.

```typescript
import { PrismaClient, AccountType, TaskPriority, TaskStatus, SecurityType, CreditorStage, VotingStatus } from "@prisma/client";

const prisma = new PrismaClient();

const ORG_ID = "org_mpumalanga_steel";

async function main() {
  console.log("Seeding rescue-ops database...");

  // Clear existing data (order matters for FK constraints)
  await prisma.auditLog.deleteMany();
  await prisma.creditorCommunication.deleteMany();
  await prisma.creditor.deleteMany();
  await prisma.operationalTask.deleteMany();
  await prisma.taskSequence.deleteMany();
  await prisma.openingBalance.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.organisation.deleteMany();

  // ─── Organisation ──────────────────────────────────────────
  const org = await prisma.organisation.create({
    data: {
      id: ORG_ID,
      name: "Mpumalanga Steel Fabricators (Pty) Ltd",
      registrationNo: "2018/234567/07",
      sector: "Steel Fabrication & Construction",
    },
  });

  // ─── Contacts ──────────────────────────────────────────────
  const contactsData = [
    { name: "Thabo Molefe", role: "Workshop Foreman", company: "Mpumalanga Steel", email: "thabo@mpumalangasteel.co.za", phone: "082 345 6789" },
    { name: "Sarah Chen", role: "Financial Controller", company: "Mpumalanga Steel", email: "sarah@mpumalangasteel.co.za", phone: "083 456 7890" },
    { name: "David Nkosi", role: "Operations Manager", company: "Mpumalanga Steel", email: "david@mpumalangasteel.co.za", phone: "084 567 8901" },
    { name: "Pieter Joubert", role: "Business Rescue Liaison", company: "Nedbank", email: "pjoubert@nedbank.co.za", phone: "011 294 3000" },
    { name: "Amanda Pretorius", role: "Collections Manager", company: "WesBank", email: "apretorius@wesbank.co.za", phone: "011 632 6000" },
    { name: "Ravi Govender", role: "Key Account Manager", company: "ArcelorMittal", email: "ravi.govender@arcelormittal.com", phone: "016 889 9111" },
    { name: "Johan van Wyk", role: "Credit Controller", company: "Macsteel", email: "jvanwyk@macsteel.co.za", phone: "011 871 0000" },
    { name: "Sipho Dlamini", role: "Account Manager", company: "Eskom", email: "dlaminisb@eskom.co.za", phone: "011 800 8111" },
    { name: "Linda Fourie", role: "Property Manager", company: "Titan Properties", email: "linda@titanprop.co.za", phone: "013 752 2100" },
    { name: "Mark Thompson", role: "Regional Sales Manager", company: "Afrox", email: "mthompson@afrox.co.za", phone: "011 490 0400" },
  ];

  const contacts: Record<string, string> = {};
  for (const c of contactsData) {
    const contact = await prisma.contact.create({
      data: { orgId: org.id, ...c },
    });
    contacts[c.name] = contact.id;
  }

  // ─── Opening Balances (as at 01/03/2026) ───────────────────
  const balances = [
    { accountCode: "1000", accountName: "FNB Current Account", accountType: AccountType.Asset, balanceInCents: 34000000 },
    { accountCode: "1001", accountName: "Petty Cash", accountType: AccountType.Asset, balanceInCents: 850000 },
    { accountCode: "1100", accountName: "Trade Debtors", accountType: AccountType.Asset, balanceInCents: 125000000 },
    { accountCode: "1200", accountName: "Raw Materials Inventory", accountType: AccountType.Asset, balanceInCents: 89000000 },
    { accountCode: "1300", accountName: "Machinery & Equipment", accountType: AccountType.Asset, balanceInCents: 320000000 },
    { accountCode: "1400", accountName: "Vehicles", accountType: AccountType.Asset, balanceInCents: 145000000 },
    { accountCode: "2000", accountName: "FNB Overdraft Facility", accountType: AccountType.Liability, balanceInCents: 75000000 },
    { accountCode: "2100", accountName: "Trade Creditors", accountType: AccountType.Liability, balanceInCents: 468000000 },
    { accountCode: "2200", accountName: "SARS — VAT Payable", accountType: AccountType.Liability, balanceInCents: 52000000 },
    { accountCode: "2201", accountName: "SARS — PAYE Payable", accountType: AccountType.Liability, balanceInCents: 38000000 },
    { accountCode: "2300", accountName: "Nedbank Term Loan", accountType: AccountType.Liability, balanceInCents: 210000000 },
    { accountCode: "2400", accountName: "Vehicle Finance — WesBank", accountType: AccountType.Liability, balanceInCents: 98000000 },
    { accountCode: "2500", accountName: "Directors' Loans", accountType: AccountType.Liability, balanceInCents: 60000000 },
    { accountCode: "3000", accountName: "Share Capital", accountType: AccountType.Equity, balanceInCents: 10000000 },
    { accountCode: "3100", accountName: "Retained Earnings (Loss)", accountType: AccountType.Equity, balanceInCents: -297200000 },
    { accountCode: "5000", accountName: "Salaries & Wages", accountType: AccountType.Expense, balanceInCents: 48000000 },
    { accountCode: "5100", accountName: "Rent — Workshop", accountType: AccountType.Expense, balanceInCents: 6500000 },
    { accountCode: "5200", accountName: "Electricity", accountType: AccountType.Expense, balanceInCents: 4200000 },
    { accountCode: "5300", accountName: "Insurance", accountType: AccountType.Expense, balanceInCents: 1800000 },
    { accountCode: "5400", accountName: "Vehicle Running Costs", accountType: AccountType.Expense, balanceInCents: 3500000 },
  ];

  const asAtDate = new Date("2026-03-01T00:00:00.000Z");
  for (const b of balances) {
    await prisma.openingBalance.create({
      data: { orgId: org.id, asAtDate, ...b },
    });
  }

  // ─── Task Sequence ─────────────────────────────────────────
  await prisma.taskSequence.create({
    data: { orgId: org.id, lastSeq: 10 },
  });

  // ─── Operational Tasks ─────────────────────────────────────
  const tasks = [
    { taskNumber: 1, title: "Secure workshop premises — change locks & alarm codes", description: "Immediately change all access codes and locks to prevent unauthorised removal of assets. Contact ADT for alarm code reset.", priority: TaskPriority.Critical, status: TaskStatus.Open, responsibleId: contacts["Thabo Molefe"], dueDate: new Date("2026-03-03") },
    { taskNumber: 2, title: "Freeze all non-essential bank payments", description: "Instruct FNB to halt all debit orders and scheduled payments except payroll and essential utilities. Preserve cash position.", priority: TaskPriority.Critical, status: TaskStatus.Completed, responsibleId: contacts["Sarah Chen"], dueDate: new Date("2026-03-02"), completedAt: new Date("2026-03-02") },
    { taskNumber: 3, title: "Inventory count — raw materials & finished goods", description: "Full physical count of steel plate, bar, tube, and finished fabrications in workshop and yard. Reconcile to last stock sheet.", priority: TaskPriority.Critical, status: TaskStatus.InProgress, responsibleId: contacts["David Nkosi"], dueDate: new Date("2026-03-05") },
    { taskNumber: 4, title: "Notify all employees of business rescue — Section 145", description: "Issue written notice to all 47 employees per Section 145(1) of the Companies Act. Include FAQ sheet on employee rights during business rescue.", priority: TaskPriority.High, status: TaskStatus.Completed, dueDate: new Date("2026-03-01"), completedAt: new Date("2026-03-01") },
    { taskNumber: 5, title: "Obtain 3 months bank statements — FNB & Nedbank", description: "Request detailed statements for Dec 2025 to Feb 2026 from both FNB (current + overdraft) and Nedbank (term loan). Needed for cash flow reconstruction.", priority: TaskPriority.High, status: TaskStatus.InProgress, responsibleId: contacts["Sarah Chen"], dueDate: new Date("2026-03-07") },
    { taskNumber: 6, title: "Secure IT systems — change admin passwords", description: "Reset all admin passwords for Sage, email server, and workshop Wi-Fi. Revoke ex-director remote access. Back up all financial data.", priority: TaskPriority.High, status: TaskStatus.Open, responsibleId: contacts["Thabo Molefe"], dueDate: new Date("2026-03-04") },
    { taskNumber: 7, title: "Review all current contracts & purchase orders", description: "Compile list of all active contracts, open POs, and standing orders. Identify which can be cancelled, renegotiated, or must continue.", priority: TaskPriority.Normal, status: TaskStatus.Open, responsibleId: contacts["David Nkosi"], dueDate: new Date("2026-03-14") },
    { taskNumber: 8, title: "Assess workshop equipment condition", description: "Physical inspection of CNC plasma cutter, MIG welders, overhead crane, and forklift. Note any maintenance overdue or safety concerns.", priority: TaskPriority.Normal, status: TaskStatus.Open, responsibleId: contacts["Thabo Molefe"], dueDate: new Date("2026-03-10") },
    { taskNumber: 9, title: "Contact major debtors — arrange accelerated collection", description: "Call top 5 debtors (R 1.25M outstanding). Negotiate early payment or partial settlement. Priority: Murray & Roberts (R 380k), Group Five (R 290k).", priority: TaskPriority.High, status: TaskStatus.Open, responsibleId: contacts["Sarah Chen"], dueDate: new Date("2026-03-08") },
    { taskNumber: 10, title: "Prepare preliminary cash flow forecast", description: "Build 13-week rolling cash flow forecast. Include confirmed debtors, known creditor obligations, payroll, and essential operating costs.", priority: TaskPriority.Normal, status: TaskStatus.Open, dueDate: new Date("2026-03-12") },
  ];

  for (const t of tasks) {
    await prisma.operationalTask.create({
      data: { orgId: org.id, ...t },
    });
  }

  // ─── Creditors ─────────────────────────────────────────────
  const creditorsData = [
    {
      creditorName: "Nedbank Ltd",
      claimAmountInCents: 210000000,
      securityType: SecurityType.Secured,
      stage: CreditorStage.InNegotiation,
      votingStatus: VotingStatus.Pending,
      contactId: contacts["Pieter Joubert"],
      lastContactDate: new Date("2026-03-15"),
      notes: "Term loan secured by general notarial bond over movable assets. Bank amenable to restructuring if cash flow projections support repayment.",
      communications: [
        { method: "Meeting", date: new Date("2026-03-10"), summary: "Discussed proposal to restructure term loan over 36 months at prime + 2%. Bank requested updated cash flow projections before next meeting." },
        { method: "Email", date: new Date("2026-03-15"), summary: "Emailed revised cash flow forecast. Highlighted that continued trading generates R 180k/month toward debt service." },
        { method: "Phone", date: new Date("2026-03-18"), summary: "Pieter confirmed receipt of projections. Internal credit committee meeting scheduled for 22/03. Verbal indication of support for restructure." },
      ],
    },
    {
      creditorName: "WesBank (FirstRand)",
      claimAmountInCents: 98000000,
      securityType: SecurityType.Secured,
      stage: CreditorStage.Notified,
      votingStatus: VotingStatus.Pending,
      contactId: contacts["Amanda Pretorius"],
      lastContactDate: new Date("2026-03-06"),
      notes: "Vehicle finance — instalment sale agreements on 3 delivery trucks and 1 flatbed.",
      communications: [
        { method: "Letter", date: new Date("2026-03-02"), summary: "Sent formal Section 128 notification of commencement of business rescue proceedings." },
        { method: "Phone", date: new Date("2026-03-06"), summary: "Amanda acknowledged receipt. Requested list of specific vehicles and current mileage. Will assign a dedicated workout officer." },
      ],
    },
    {
      creditorName: "ArcelorMittal SA",
      claimAmountInCents: 185000000,
      securityType: SecurityType.Concurrent,
      stage: CreditorStage.OfferMade,
      votingStatus: VotingStatus.For,
      contactId: contacts["Ravi Govender"],
      lastContactDate: new Date("2026-03-20"),
      notes: "Largest trade creditor. Critical supplier — continued supply essential for ongoing operations.",
      communications: [
        { method: "Meeting", date: new Date("2026-03-08"), summary: "Initial meeting. Ravi expressed willingness to continue supply on COD basis if historical debt addressed. Discussed 60c/R1 settlement." },
        { method: "Phone", date: new Date("2026-03-12"), summary: "Ravi confirmed ArcelorMittal willing to accept 60c/R1 settlement paid over 12 months. Requires board approval — expects response by 20/03." },
        { method: "Email", date: new Date("2026-03-20"), summary: "Board approved settlement in principle. Ravi sending formal offer letter. Will vote in favour of BRP if terms included." },
      ],
    },
    {
      creditorName: "Macsteel Service Centres",
      claimAmountInCents: 120000000,
      securityType: SecurityType.Concurrent,
      stage: CreditorStage.InNegotiation,
      votingStatus: VotingStatus.Pending,
      contactId: contacts["Johan van Wyk"],
      lastContactDate: new Date("2026-03-14"),
      notes: "Secondary steel supplier. Less critical than ArcelorMittal but useful for specialty sections.",
      communications: [
        { method: "Letter", date: new Date("2026-03-02"), summary: "Formal notification sent per Section 128." },
        { method: "Phone", date: new Date("2026-03-09"), summary: "Johan requested full statement of account and proof of claim form. Indicated Macsteel's legal team will review before any settlement discussion." },
        { method: "Meeting", date: new Date("2026-03-14"), summary: "Met with Johan and Macsteel's in-house counsel. Presented 50c/R1 over 18 months. They countered at 70c/R1 over 12 months. Negotiations ongoing." },
      ],
    },
    {
      creditorName: "SARS",
      claimAmountInCents: 90000000,
      securityType: SecurityType.Preferent,
      stage: CreditorStage.Identified,
      votingStatus: VotingStatus.Pending,
      lastContactDate: new Date("2026-03-02"),
      notes: "VAT (R 520k) and PAYE (R 380k) arrears. SARS is a preferent creditor per Section 145. Filing compliance is critical.",
      communications: [
        { method: "Letter", date: new Date("2026-03-02"), summary: "Filed Form BR1 notification. Auto-generated acknowledgement received. No case officer assigned yet." },
        { method: "Email", date: new Date("2026-03-10"), summary: "Submitted updated VAT201 and EMP201 returns for Oct-Feb period via eFiling. Requested meeting with assigned debt management officer." },
      ],
    },
    {
      creditorName: "Eskom",
      claimAmountInCents: 38000000,
      securityType: SecurityType.Concurrent,
      stage: CreditorStage.Notified,
      votingStatus: VotingStatus.Pending,
      contactId: contacts["Sipho Dlamini"],
      lastContactDate: new Date("2026-03-07"),
      notes: "3-phase industrial supply. Disconnection would halt all workshop operations immediately.",
      communications: [
        { method: "Letter", date: new Date("2026-03-02"), summary: "Formal business rescue notification sent to Eskom key accounts division." },
        { method: "Phone", date: new Date("2026-03-07"), summary: "Sipho confirmed supply will continue during rescue proceedings. Requested current account be kept in good standing. Agreed to COD arrangement for ongoing consumption." },
      ],
    },
    {
      creditorName: "Titan Properties (Landlord)",
      claimAmountInCents: 65000000,
      securityType: SecurityType.Concurrent,
      stage: CreditorStage.Agreed,
      votingStatus: VotingStatus.For,
      contactId: contacts["Linda Fourie"],
      lastContactDate: new Date("2026-03-18"),
      notes: "Workshop lease — R 65k/month. 3 years remaining on 5-year lease. Landlord cooperative.",
      communications: [
        { method: "Meeting", date: new Date("2026-03-05"), summary: "Met Linda on-site. Explained rescue process and need for rent concession. She expressed sympathy — her father ran a steel business." },
        { method: "Phone", date: new Date("2026-03-12"), summary: "Linda proposed 50% rent reduction for 6 months in exchange for 2-year lease extension. Practitioner agreed in principle." },
        { method: "Meeting", date: new Date("2026-03-18"), summary: "Linda agreed to 50% rent reduction for 6 months in exchange for lease extension. Drafting written agreement." },
      ],
    },
    {
      creditorName: "Afrox (Linde)",
      claimAmountInCents: 60000000,
      securityType: SecurityType.Concurrent,
      stage: CreditorStage.Notified,
      votingStatus: VotingStatus.Pending,
      contactId: contacts["Mark Thompson"],
      lastContactDate: new Date("2026-03-06"),
      notes: "Welding gas supplier (argon, CO2, acetylene). Monthly consumption ~R 18k. Outstanding balance is 3+ months.",
      communications: [
        { method: "Letter", date: new Date("2026-03-02"), summary: "Formal Section 128 notification sent to Afrox head office and regional branch." },
        { method: "Phone", date: new Date("2026-03-06"), summary: "Mark acknowledged notification. Gas cylinder rental continues as cylinders are Afrox property. Will continue supply on strict COD basis pending rescue outcome." },
      ],
    },
  ];

  for (const c of creditorsData) {
    const { communications, ...creditorData } = c;
    const creditor = await prisma.creditor.create({
      data: { orgId: org.id, ...creditorData },
    });
    for (const comm of communications) {
      await prisma.creditorCommunication.create({
        data: { creditorId: creditor.id, ...comm },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`  Organisation: ${org.name}`);
  console.log(`  Contacts: ${contactsData.length}`);
  console.log(`  Opening Balances: ${balances.length}`);
  console.log(`  Operational Tasks: ${tasks.length}`);
  console.log(`  Creditors: ${creditorsData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add seed config to packages/database/package.json**

Add to the `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: comprehensive seed script with Mpumalanga Steel demo data"
```

---

## Task 5: Financial Triage App — Scaffold

**Files:**
- Create: `apps/financial-triage/package.json`
- Create: `apps/financial-triage/next.config.mjs`
- Create: `apps/financial-triage/tsconfig.json`
- Create: `apps/financial-triage/tailwind.config.ts`
- Create: `apps/financial-triage/postcss.config.js`
- Create: `apps/financial-triage/app/globals.css`
- Create: `apps/financial-triage/app/layout.tsx`
- Create: `apps/financial-triage/sentry.server.config.ts`
- Create: `apps/financial-triage/sentry.client.config.ts`

- [ ] **Step 1: Create apps/financial-triage/package.json**

```json
{
  "name": "@rescue-ops/financial-triage",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@rescue-ops/database": "*",
    "@rescue-ops/shared": "*",
    "@sentry/nextjs": "^10",
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "recharts": "^2",
    "zod": "^3"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create apps/financial-triage/next.config.mjs**

```javascript
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@rescue-ops/shared", "@rescue-ops/database"],
  serverExternalPackages: ["@prisma/client"],
  reactStrictMode: true,
  poweredByHeader: false,
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  disableLogger: true,
});
```

- [ ] **Step 3: Create apps/financial-triage/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./app/*"],
      "@components/*": ["./components/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create Tailwind + PostCSS config**

`apps/financial-triage/tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#0D9488",         // Muted teal
        "accent-light": "#CCFBF1", // Teal-50
        danger: "#E11D48",
        success: "#059669",
      },
    },
  },
  plugins: [],
};
export default config;
```

`apps/financial-triage/postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Create apps/financial-triage/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #FAFAFA;
  color: #0F172A;
}
```

- [ ] **Step 6: Create apps/financial-triage/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Financial Triage — rescue-ops",
  description: "Day 1 financial diagnosis for business rescue proceedings",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Create Sentry configs**

`apps/financial-triage/sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
```

`apps/financial-triage/sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enabled: process.env.NODE_ENV === "production",
});
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: financial triage app scaffold — Next.js 15, Tailwind, Sentry"
```

---

## Task 6: Financial Triage App — API Routes

**Files:**
- Create: `apps/financial-triage/app/api/triage/route.ts`
- Create: `apps/financial-triage/app/api/balances/route.ts`
- Create: `apps/financial-triage/app/api/seed/route.ts`

- [ ] **Step 1: Create /api/triage/route.ts**

This is the single pre-computed endpoint that returns all dashboard data in one response.

```typescript
import { NextResponse } from "next/server";
import prisma from "@rescue-ops/database";
import { handleApiError } from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

export async function GET() {
  try {
    const [balances, creditors] = await Promise.all([
      prisma.openingBalance.findMany({ where: { orgId: DEFAULT_ORG_ID } }),
      prisma.creditor.findMany({
        where: { orgId: DEFAULT_ORG_ID },
        include: { contact: { select: { name: true } } },
        orderBy: { claimAmountInCents: "desc" },
      }),
    ]);

    // ── Metrics ──────────────────────────────────────────
    const assets = balances.filter((b) => b.accountType === "Asset");
    const liabilities = balances.filter((b) => b.accountType === "Liability");
    const equity = balances.filter((b) => b.accountType === "Equity");
    const expenses = balances.filter((b) => b.accountType === "Expense");

    const totalAssets = assets.reduce((sum, b) => sum + b.balanceInCents, 0);
    const totalLiabilities = liabilities.reduce((sum, b) => sum + b.balanceInCents, 0);
    const totalEquity = equity.reduce((sum, b) => sum + b.balanceInCents, 0);
    const monthlyBurn = expenses.reduce((sum, b) => sum + b.balanceInCents, 0);

    // Cash = accounts 1000-1099
    const cashPosition = assets
      .filter((b) => {
        const code = parseInt(b.accountCode, 10);
        return code >= 1000 && code <= 1099;
      })
      .reduce((sum, b) => sum + b.balanceInCents, 0);

    const solvencyRatio = totalLiabilities > 0 ? totalAssets / totalLiabilities : 0;

    // Runway in days (cash / daily burn)
    const dailyBurn = monthlyBurn / 30;
    const runwayDays = dailyBurn > 0 ? Math.floor(cashPosition / dailyBurn) : 999;

    // ── Cash Runway Projection (30/60/90 days) ───────────
    const runway = [0, 30, 60, 90].map((day) => ({
      day,
      balance: cashPosition - dailyBurn * day,
    }));

    // ── Exposure by Security Class ───────────────────────
    const securityBreakdown = {
      Secured: creditors
        .filter((c) => c.securityType === "Secured")
        .reduce((sum, c) => sum + c.claimAmountInCents, 0),
      Preferent: creditors
        .filter((c) => c.securityType === "Preferent")
        .reduce((sum, c) => sum + c.claimAmountInCents, 0),
      Concurrent: creditors
        .filter((c) => c.securityType === "Concurrent")
        .reduce((sum, c) => sum + c.claimAmountInCents, 0),
    };

    // ── Top 10 Creditors ─────────────────────────────────
    const totalClaims = creditors.reduce((sum, c) => sum + c.claimAmountInCents, 0);
    const top10 = creditors.slice(0, 10).map((c, i) => ({
      rank: i + 1,
      id: c.id,
      creditorName: c.creditorName,
      claimAmountInCents: c.claimAmountInCents,
      securityType: c.securityType,
      percentOfTotal: totalClaims > 0 ? (c.claimAmountInCents / totalClaims) * 100 : 0,
      contactName: c.contact?.name || null,
    }));

    // ── Balance Sheet Summary ────────────────────────────
    const balanceSheet = {
      totalAssets,
      totalLiabilities,
      totalEquity,
      netPosition: totalAssets - totalLiabilities,
      assetCount: assets.length,
      liabilityCount: liabilities.length,
      equityCount: equity.length,
    };

    const response = NextResponse.json({
      metrics: {
        cashPosition,
        totalCreditorExposure: totalLiabilities,
        solvencyRatio: Math.round(solvencyRatio * 100) / 100,
        monthlyBurnRate: monthlyBurn,
        runwayDays,
      },
      runway,
      securityBreakdown,
      top10,
      balanceSheet,
    });

    response.headers.set(
      "Cache-Control",
      "private, max-age=15, stale-while-revalidate=30"
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 2: Create /api/balances/route.ts**

```typescript
import { NextRequest } from "next/server";
import prisma from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess,
  handleApiError,
  extractRequestMeta,
  writeAuditLog,
  parsePagination,
  paginatedResult,
} from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

const createBalanceSchema = z.object({
  accountCode: z.string().min(1, "Account code is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountType: z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"]),
  balanceInCents: z.number().int("Balance must be a whole number (cents)"),
  asAtDate: z.string().transform((s) => new Date(s)),
});

export async function GET(req: NextRequest) {
  try {
    const pagination = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.openingBalance.findMany({
        where: { orgId: DEFAULT_ORG_ID },
        orderBy: { accountCode: "asc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.openingBalance.count({ where: { orgId: DEFAULT_ORG_ID } }),
    ]);
    return apiSuccess(paginatedResult(data, total, pagination));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createBalanceSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const balance = await prisma.openingBalance.create({
      data: {
        orgId: DEFAULT_ORG_ID,
        ...data,
      },
    });

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "create",
      entityType: "opening_balance",
      entityId: balance.id,
      metadata: { accountCode: data.accountCode, accountName: data.accountName },
      ipAddress,
      userAgent,
    });

    return apiSuccess(balance, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 3: Create /api/seed/route.ts**

```typescript
import { NextResponse } from "next/server";

export async function POST() {
  // In production, the seed runs via CLI: npm run db:seed
  // This endpoint is a convenience for the demo — it shells out to the seed script.
  // For now, return instructions.
  return NextResponse.json({
    message: "Run `npm run db:seed` from the project root to seed demo data.",
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: financial triage API routes — /api/triage, /api/balances"
```

---

## Task 7: Financial Triage App — Dashboard Page & Components

**Files:**
- Create: `apps/financial-triage/components/MetricCard.tsx`
- Create: `apps/financial-triage/components/SecurityChart.tsx`
- Create: `apps/financial-triage/components/RunwayChart.tsx`
- Create: `apps/financial-triage/components/CreditorTable.tsx`
- Create: `apps/financial-triage/components/BalanceSheet.tsx`
- Create: `apps/financial-triage/components/Header.tsx`
- Create: `apps/financial-triage/components/SlideOver.tsx`
- Create: `apps/financial-triage/components/AddBalanceForm.tsx`
- Create: `apps/financial-triage/components/CrossLink.tsx`
- Create: `apps/financial-triage/app/page.tsx`

- [ ] **Step 1: Create CrossLink component**

Shared cross-app link component that disables gracefully when URL env var is absent.

`apps/financial-triage/components/CrossLink.tsx`:
```tsx
interface CrossLinkProps {
  href: string | undefined;
  label: string;
  direction?: "left" | "right";
}

export function CrossLink({ href, label, direction = "right" }: CrossLinkProps) {
  const arrow = direction === "left" ? "\u2190" : "\u2192";
  const text = direction === "left" ? `${arrow} ${label}` : `${label} ${arrow}`;

  if (!href) {
    return (
      <span className="text-sm text-slate-300 cursor-not-allowed">{text}</span>
    );
  }

  return (
    <a
      href={href}
      className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
    >
      {text}
    </a>
  );
}
```

- [ ] **Step 2: Create MetricCard component**

`apps/financial-triage/components/MetricCard.tsx`:
```tsx
import { formatZAR } from "@rescue-ops/shared";

interface MetricCardProps {
  label: string;
  value: number;
  format?: "currency" | "ratio" | "days";
  colorLogic?: "solvency" | "none";
}

export function MetricCard({ label, value, format = "currency", colorLogic = "none" }: MetricCardProps) {
  let displayValue: string;
  let colorClass = "text-slate-900";

  switch (format) {
    case "currency":
      displayValue = formatZAR(value);
      break;
    case "ratio":
      displayValue = value.toFixed(2);
      if (colorLogic === "solvency") {
        if (value < 1) colorClass = "text-rose-600";
        else if (value < 1.5) colorClass = "text-amber-600";
        else colorClass = "text-emerald-600";
      }
      break;
    case "days":
      displayValue = `${value} days`;
      if (value < 30) colorClass = "text-rose-600";
      else if (value < 90) colorClass = "text-amber-600";
      break;
    default:
      displayValue = String(value);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-accent">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{displayValue}</p>
    </div>
  );
}
```

- [ ] **Step 3: Create SecurityChart (Exposure by Security Class)**

`apps/financial-triage/components/SecurityChart.tsx`:
```tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { centsToRand, formatZAR } from "@rescue-ops/shared";

interface SecurityChartProps {
  data: { Secured: number; Preferent: number; Concurrent: number };
}

const COLORS: Record<string, string> = {
  Secured: "#334155",   // slate-700
  Preferent: "#0D9488", // teal-500
  Concurrent: "#94A3B8", // slate-400
};

export function SecurityChart({ data }: SecurityChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value: centsToRand(value),
    fill: COLORS[name],
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
        Exposure by Security Class
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => `R ${(v / 1000000).toFixed(1)}M`}
            tick={{ fontSize: 12, fill: "#64748B" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "#64748B" }}
            width={80}
          />
          <Tooltip
            formatter={(value: number) => formatZAR(Math.round(value * 100))}
            labelStyle={{ color: "#0F172A" }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: Create RunwayChart (Cash Runway Projection)**

`apps/financial-triage/components/RunwayChart.tsx`:
```tsx
"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea,
} from "recharts";
import { centsToRand, formatZAR } from "@rescue-ops/shared";

interface RunwayChartProps {
  data: { day: number; balance: number }[];
  runwayDays: number;
}

export function RunwayChart({ data, runwayDays }: RunwayChartProps) {
  const chartData = data.map((d) => ({
    day: `Day ${d.day}`,
    balance: centsToRand(d.balance),
    dayNum: d.day,
  }));

  const minBalance = Math.min(...chartData.map((d) => d.balance));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">
        Cash Runway Projection
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Runway: <span className={runwayDays < 30 ? "text-rose-600 font-semibold" : "text-slate-600 font-semibold"}>~{runwayDays} days</span>
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ left: 20, right: 10 }}>
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748B" }} />
          <YAxis
            tickFormatter={(v: number) => `R ${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12, fill: "#64748B" }}
          />
          <Tooltip
            formatter={(value: number) => formatZAR(Math.round(value * 100))}
            labelStyle={{ color: "#0F172A" }}
          />
          <ReferenceLine y={0} stroke="#E11D48" strokeDasharray="4 4" />
          {minBalance < 0 && (
            <ReferenceArea y1={0} y2={minBalance} fill="#FEE2E2" fillOpacity={0.5} />
          )}
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#0D9488"
            strokeWidth={2}
            dot={{ r: 4, fill: "#0D9488" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 5: Create CreditorTable (Top 10)**

`apps/financial-triage/components/CreditorTable.tsx`:
```tsx
import { formatZAR } from "@rescue-ops/shared";

interface Creditor {
  rank: number;
  id: string;
  creditorName: string;
  claimAmountInCents: number;
  securityType: string;
  percentOfTotal: number;
  contactName: string | null;
}

interface CreditorTableProps {
  creditors: Creditor[];
  pipelineUrl?: string;
}

const SECURITY_COLORS: Record<string, string> = {
  Secured: "bg-slate-700 text-white",
  Preferent: "bg-teal-600 text-white",
  Concurrent: "bg-slate-400 text-white",
};

export function CreditorTable({ creditors, pipelineUrl }: CreditorTableProps) {
  const maxClaim = Math.max(...creditors.map((c) => c.claimAmountInCents));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
        Top 10 Creditor Exposure
      </h3>
      <div className="space-y-2">
        {creditors.map((c) => {
          const barWidth = maxClaim > 0 ? (c.claimAmountInCents / maxClaim) * 100 : 0;
          return (
            <div key={c.id} className="relative">
              <div
                className="absolute inset-y-0 left-0 bg-teal-50 rounded"
                style={{ width: `${barWidth}%` }}
              />
              <div className="relative flex items-center justify-between py-2 px-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-5">{c.rank}</span>
                  {pipelineUrl ? (
                    <a
                      href={`${pipelineUrl}?creditor=${c.id}`}
                      className="font-medium text-slate-900 hover:text-accent transition-colors"
                    >
                      {c.creditorName}
                    </a>
                  ) : (
                    <span className="font-medium text-slate-900">{c.creditorName}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${SECURITY_COLORS[c.securityType] || "bg-slate-200"}`}>
                    {c.securityType}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-900">{formatZAR(c.claimAmountInCents)}</span>
                  <span className="text-xs text-slate-400 w-12 text-right">{c.percentOfTotal.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create BalanceSheet summary card**

`apps/financial-triage/components/BalanceSheet.tsx`:
```tsx
import { formatZAR } from "@rescue-ops/shared";

interface BalanceSheetProps {
  data: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netPosition: number;
    assetCount: number;
    liabilityCount: number;
    equityCount: number;
  };
}

export function BalanceSheet({ data }: BalanceSheetProps) {
  const netColor = data.netPosition >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
        Balance Sheet Summary
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-600">Total Assets</span>
            <span className="font-semibold">{formatZAR(data.totalAssets)}</span>
          </div>
          <span className="text-xs text-slate-400">{data.assetCount} accounts</span>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-600">Total Liabilities</span>
            <span className="font-semibold">{formatZAR(data.totalLiabilities)}</span>
          </div>
          <span className="text-xs text-slate-400">{data.liabilityCount} accounts</span>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-600">Total Equity</span>
            <span className="font-semibold">{formatZAR(data.totalEquity)}</span>
          </div>
          <span className="text-xs text-slate-400">{data.equityCount} accounts</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium text-slate-900">Net Position</span>
            <span className={`text-lg font-bold ${netColor}`}>{formatZAR(data.netPosition)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create Header component**

`apps/financial-triage/components/Header.tsx`:
```tsx
import { CrossLink } from "./CrossLink";

interface HeaderProps {
  orgName: string;
  onAddBalance: () => void;
}

export function Header({ orgName, onAddBalance }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Financial Triage</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal-50 text-accent">
            rescue-ops
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{orgName}</p>
      </div>
      <div className="flex items-center gap-6">
        <CrossLink
          href={process.env.NEXT_PUBLIC_PIPELINE_URL}
          label="Creditor Pipeline"
          direction="right"
        />
        <button
          onClick={onAddBalance}
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          Add Opening Balances
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 8: Create SlideOver component**

`apps/financial-triage/components/SlideOver.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export function SlideOver({ open, onClose, title, children, width = "max-w-md" }: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div
        ref={panelRef}
        className={`relative ${width} w-full bg-white shadow-xl overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create AddBalanceForm**

`apps/financial-triage/components/AddBalanceForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import { randToCents } from "@rescue-ops/shared";

interface AddBalanceFormProps {
  onSaved: () => void;
}

interface BalanceRow {
  accountCode: string;
  accountName: string;
  accountType: string;
  balance: string;
  asAtDate: string;
}

const EMPTY_ROW: BalanceRow = {
  accountCode: "",
  accountName: "",
  accountType: "Asset",
  balance: "",
  asAtDate: new Date().toISOString().split("T")[0],
};

export function AddBalanceForm({ onSaved }: AddBalanceFormProps) {
  const [rows, setRows] = useState<BalanceRow[]>([{ ...EMPTY_ROW }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addRow() {
    setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  }

  function updateRow(index: number, field: keyof BalanceRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveAll() {
    setError(null);
    setSaving(true);
    try {
      for (const row of rows) {
        if (!row.accountCode || !row.accountName || !row.balance) continue;
        const res = await fetch("/api/balances", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountCode: row.accountCode,
            accountName: row.accountName,
            accountType: row.accountType,
            balanceInCents: randToCents(parseFloat(row.balance)),
            asAtDate: row.asAtDate,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save balance");
        }
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded text-sm">{error}</div>
      )}
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-2">
            <label className="text-xs text-slate-500">Code</label>
            <input
              value={row.accountCode}
              onChange={(e) => updateRow(i, "accountCode", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="1000"
            />
          </div>
          <div className="col-span-3">
            <label className="text-xs text-slate-500">Name</label>
            <input
              value={row.accountName}
              onChange={(e) => updateRow(i, "accountName", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="FNB Current"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-500">Type</label>
            <select
              value={row.accountType}
              onChange={(e) => updateRow(i, "accountType", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
            >
              <option>Asset</option>
              <option>Liability</option>
              <option>Equity</option>
              <option>Revenue</option>
              <option>Expense</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-500">Balance (R)</label>
            <input
              type="number"
              value={row.balance}
              onChange={(e) => updateRow(i, "balance", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="340000"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-500">As At</label>
            <input
              type="date"
              value={row.asAtDate}
              onChange={(e) => updateRow(i, "asAtDate", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div className="col-span-1">
            <button onClick={() => removeRow(i)} className="text-slate-400 hover:text-rose-500 text-sm">
              ✕
            </button>
          </div>
        </div>
      ))}
      <div className="flex gap-3">
        <button
          onClick={addRow}
          className="text-sm text-accent hover:text-teal-700 font-medium"
        >
          + Add Row
        </button>
      </div>
      <button
        onClick={saveAll}
        disabled={saving}
        className="w-full py-2 bg-accent text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : "Save All"}
      </button>
    </div>
  );
}
```

- [ ] **Step 10: Create the main page**

`apps/financial-triage/app/page.tsx`:

This is the single-page Server Component that fetches `/api/triage` and renders everything.

```tsx
import { MetricCard } from "@components/MetricCard";
import { SecurityChart } from "@components/SecurityChart";
import { RunwayChart } from "@components/RunwayChart";
import { CreditorTable } from "@components/CreditorTable";
import { BalanceSheet } from "@components/BalanceSheet";
import { DashboardClient } from "@components/DashboardClient";

async function getTriageData() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3001";

  const res = await fetch(`${baseUrl}/api/triage`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch triage data");
  return res.json();
}

async function getOrgName() {
  // Hardcoded for the demo — matches seed data
  return "Mpumalanga Steel Fabricators (Pty) Ltd";
}

export default async function TriagePage() {
  const [data, orgName] = await Promise.all([getTriageData(), getOrgName()]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <DashboardClient
        orgName={orgName}
        data={data}
        pipelineUrl={process.env.NEXT_PUBLIC_PIPELINE_URL}
      />
    </main>
  );
}
```

- [ ] **Step 11: Create DashboardClient wrapper**

This client component handles the slide-over state while receiving server-fetched data as props.

`apps/financial-triage/components/DashboardClient.tsx`:
```tsx
"use client";

import { useState, useCallback } from "react";
import { Header } from "./Header";
import { MetricCard } from "./MetricCard";
import { SecurityChart } from "./SecurityChart";
import { RunwayChart } from "./RunwayChart";
import { CreditorTable } from "./CreditorTable";
import { BalanceSheet } from "./BalanceSheet";
import { SlideOver } from "./SlideOver";
import { AddBalanceForm } from "./AddBalanceForm";

interface DashboardClientProps {
  orgName: string;
  data: {
    metrics: {
      cashPosition: number;
      totalCreditorExposure: number;
      solvencyRatio: number;
      monthlyBurnRate: number;
      runwayDays: number;
    };
    runway: { day: number; balance: number }[];
    securityBreakdown: { Secured: number; Preferent: number; Concurrent: number };
    top10: {
      rank: number;
      id: string;
      creditorName: string;
      claimAmountInCents: number;
      securityType: string;
      percentOfTotal: number;
      contactName: string | null;
    }[];
    balanceSheet: {
      totalAssets: number;
      totalLiabilities: number;
      totalEquity: number;
      netPosition: number;
      assetCount: number;
      liabilityCount: number;
      equityCount: number;
    };
  };
  pipelineUrl?: string;
}

export function DashboardClient({ orgName, data, pipelineUrl }: DashboardClientProps) {
  const [slideOpen, setSlideOpen] = useState(false);

  const handleSaved = useCallback(() => {
    setSlideOpen(false);
    // Refresh the page to re-fetch server data
    window.location.reload();
  }, []);

  return (
    <>
      <Header orgName={orgName} onAddBalance={() => setSlideOpen(true)} />

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Cash Position" value={data.metrics.cashPosition} />
        <MetricCard label="Total Creditor Exposure" value={data.metrics.totalCreditorExposure} />
        <MetricCard label="Solvency Ratio" value={data.metrics.solvencyRatio} format="ratio" colorLogic="solvency" />
        <MetricCard label="Monthly Burn Rate" value={data.metrics.monthlyBurnRate} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <SecurityChart data={data.securityBreakdown} />
        <RunwayChart data={data.runway} runwayDays={data.metrics.runwayDays} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <CreditorTable creditors={data.top10} pipelineUrl={pipelineUrl} />
        </div>
        <div className="lg:col-span-2">
          <BalanceSheet data={data.balanceSheet} />
        </div>
      </div>

      {/* Slide-Over */}
      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title="Add Opening Balances">
        <AddBalanceForm onSaved={handleSaved} />
      </SlideOver>
    </>
  );
}
```

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: financial triage dashboard — metrics, charts, creditor table, balance sheet, slide-over form"
```

---

## Task 8: Operations App — Scaffold + API Routes + Page

**Files:** Mirror the same scaffold pattern from Task 5 but for the operations app. Key differences: port 3002, amber accent colour `#D97706`, no Recharts dependency.

- [ ] **Step 1: Create apps/operations/package.json**

Same structure as financial-triage but `name: "@rescue-ops/operations"`, port 3002, no `recharts` dependency. Add `@react-pdf/renderer` for work order PDFs.

```json
{
  "name": "@rescue-ops/operations",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@rescue-ops/database": "*",
    "@rescue-ops/shared": "*",
    "@react-pdf/renderer": "^4",
    "@sentry/nextjs": "^10",
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "zod": "^3"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create operations app config files**

Create the same set of config files as Task 5 (next.config.mjs, tsconfig.json, tailwind.config.ts, postcss.config.js, globals.css, layout.tsx, sentry configs) with these differences:

`apps/operations/next.config.mjs` — add `esmExternals: "loose"` and `webpack.resolve.alias.canvas = false` for @react-pdf/renderer:
```javascript
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@rescue-ops/shared", "@rescue-ops/database"],
  serverExternalPackages: ["@prisma/client"],
  experimental: { esmExternals: "loose" },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default withSentryConfig(nextConfig, {
  silent: true, org: process.env.SENTRY_ORG, project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true, disableLogger: true,
});
```

`apps/operations/tailwind.config.ts` — accent colour `#D97706` (amber):
```typescript
import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#D97706",
        "accent-light": "#FFFBEB",
        danger: "#E11D48",
        success: "#059669",
      },
    },
  },
  plugins: [],
};
export default config;
```

`apps/operations/app/layout.tsx` — title "Operations Stabiliser — rescue-ops", same Inter font.

- [ ] **Step 3: Create /api/tasks/route.ts**

```typescript
import { NextRequest } from "next/server";
import prisma, { Prisma } from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess, handleApiError, extractRequestMeta,
  writeAuditLog, parsePagination, paginatedResult,
} from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["Critical", "High", "Normal"]).default("Normal"),
  responsibleId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional().transform((s) => (s ? new Date(s) : null)),
});

export async function GET(req: NextRequest) {
  try {
    const pagination = parsePagination(req);
    const status = req.nextUrl.searchParams.get("status");
    const priority = req.nextUrl.searchParams.get("priority");
    const search = req.nextUrl.searchParams.get("search");

    const where: Prisma.OperationalTaskWhereInput = { orgId: DEFAULT_ORG_ID };
    if (status) where.status = status as Prisma.EnumTaskStatusFilter["equals"];
    if (priority) where.priority = priority as Prisma.EnumTaskPriorityFilter["equals"];
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.operationalTask.findMany({
        where,
        include: { responsible: { select: { id: true, name: true } } },
        orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.operationalTask.count({ where }),
    ]);

    return apiSuccess(paginatedResult(data, total, pagination));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createTaskSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    // Atomic auto-numbering via $transaction at Serializable isolation
    const task = await prisma.$transaction(async (tx) => {
      const seq = await tx.taskSequence.upsert({
        where: { orgId: DEFAULT_ORG_ID },
        update: { lastSeq: { increment: 1 } },
        create: { orgId: DEFAULT_ORG_ID, lastSeq: 1 },
      });

      return tx.operationalTask.create({
        data: {
          orgId: DEFAULT_ORG_ID,
          taskNumber: seq.lastSeq,
          title: data.title,
          description: data.description,
          priority: data.priority,
          responsibleId: data.responsibleId || null,
          dueDate: data.dueDate,
        },
        include: { responsible: { select: { id: true, name: true } } },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "create",
      entityType: "task",
      entityId: task.id,
      metadata: { taskNumber: task.taskNumber, title: data.title },
      ipAddress,
      userAgent,
    });

    return apiSuccess(task, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 4: Create /api/tasks/[id]/route.ts**

```typescript
import { NextRequest } from "next/server";
import prisma from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess, handleApiError, extractRequestMeta,
  writeAuditLog, diffChanges, NotFoundError,
} from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(["Critical", "High", "Normal"]).optional(),
  status: z.enum(["Open", "InProgress", "Completed", "Cancelled"]).optional(),
  responsibleId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional().transform((s) => (s ? new Date(s) : null)),
  cancelReason: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.operationalTask.findUnique({
      where: { id },
      include: { responsible: true },
    });
    if (!task || task.orgId !== DEFAULT_ORG_ID) throw new NotFoundError("Task not found");
    return apiSuccess(task);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateTaskSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const existing = await prisma.operationalTask.findUnique({ where: { id } });
    if (!existing || existing.orgId !== DEFAULT_ORG_ID) throw new NotFoundError("Task not found");

    // Build update payload
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.responsibleId !== undefined) updateData.responsibleId = data.responsibleId;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

    if (data.status === "Completed") {
      updateData.status = "Completed";
      updateData.completedAt = new Date();
    } else if (data.status === "Cancelled") {
      if (!data.cancelReason) throw new Error("Cancel reason is required");
      updateData.status = "Cancelled";
      updateData.cancelReason = data.cancelReason;
      updateData.cancelledAt = new Date();
    } else if (data.status) {
      updateData.status = data.status;
    }

    const updated = await prisma.operationalTask.update({
      where: { id },
      data: updateData,
      include: { responsible: { select: { id: true, name: true } } },
    });

    const changes = diffChanges(
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      ["title", "description", "priority", "status", "responsibleId", "dueDate"]
    );

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "update",
      entityType: "task",
      entityId: id,
      changes,
      ipAddress,
      userAgent,
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 5: Create /api/contacts/route.ts**

The operations app needs to list contacts for the "Responsible Party" dropdown.

`apps/operations/app/api/contacts/route.ts`:
```typescript
import prisma from "@rescue-ops/database";
import { apiSuccess, handleApiError } from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      where: { orgId: DEFAULT_ORG_ID },
      select: { id: true, name: true, role: true, company: true },
      orderBy: { name: "asc" },
    });
    return apiSuccess(contacts);
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 6: Create Work Order PDF template**

`apps/operations/components/WorkOrderPDF.tsx`:
```tsx
"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { textAlign: "center", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 12, color: "#555", marginTop: 4 },
  row: { flexDirection: "row", marginBottom: 8 },
  label: { width: 160, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  value: { flex: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginVertical: 12 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", fontFamily: "Helvetica-Bold", marginBottom: 8, color: "#333" },
  signatureSection: { marginTop: 40, flexDirection: "row", justifyContent: "space-between" },
  signatureBlock: { width: "45%" },
  signatureLine: { borderBottomWidth: 1, borderBottomColor: "#000", marginTop: 30, marginBottom: 4 },
  signatureLabel: { fontSize: 8, color: "#555" },
});

interface WorkOrderPDFProps {
  task: {
    taskNumber: number;
    title: string;
    description: string;
    priority: string;
    createdAt: string;
    dueDate?: string | null;
    responsible?: { name: string } | null;
  };
  orgName: string;
}

export function WorkOrderPDF({ task, orgName }: WorkOrderPDFProps) {
  const taskCode = `OT-${String(task.taskNumber).padStart(4, "0")}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>WORK ORDER</Text>
          <Text style={styles.subtitle}>{taskCode}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Organisation:</Text>
            <Text style={styles.value}>{orgName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Work Order Number:</Text>
            <Text style={styles.value}>{taskCode}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date Issued:</Text>
            <Text style={styles.value}>
              {new Date(task.createdAt).toLocaleDateString("en-ZA")}
            </Text>
          </View>
          {task.dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>
                {new Date(task.dueDate).toLocaleDateString("en-ZA")}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Priority:</Text>
            <Text style={styles.value}>{task.priority}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Title:</Text>
            <Text style={styles.value}>{task.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{task.description}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Responsible Party:</Text>
            <Text style={styles.value}>{task.responsible?.name || "—"}</Text>
          </View>
        </View>
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Assigned By (Signature)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Accepted By (Signature)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
```

- [ ] **Step 7: Create printPdf helper**

`apps/operations/lib/printPdf.ts` — verbatim from radco:
```typescript
export async function printPdf(document: React.ReactElement<any>): Promise<void> {
  const { pdf } = await import("@react-pdf/renderer");
  const blob = await pdf(document as any).toBlob();
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (!printWindow) {
    const a = window.document.createElement("a");
    a.href = url;
    a.download = "document.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }
}
```

- [ ] **Step 8: Create operations page components and main page**

Create these components following the same patterns from Task 7 (MetricCard, SlideOver, CrossLink can be copy-adapted with amber accent):

- `apps/operations/components/Header.tsx` — "Operations Stabiliser" + amber badge + "New Task" button + cross-links
- `apps/operations/components/StatsRow.tsx` — 4 stat cards (Open, Critical, In Progress, Completed This Week)
- `apps/operations/components/FilterBar.tsx` — Status dropdown, Priority dropdown, Search box
- `apps/operations/components/TaskTable.tsx` — Table with columns: #, Title, Priority badge, Status badge, Responsible, Due Date, Actions (Print/Edit)
- `apps/operations/components/TaskSlideOver.tsx` — Form for new/edit task with Title, Description, Priority radio, Responsible dropdown, Due Date, cancel reason field
- `apps/operations/components/SlideOver.tsx` — same component as triage app
- `apps/operations/components/CrossLink.tsx` — same component as triage app

`apps/operations/app/page.tsx` — Client component that fetches `/api/tasks` and `/api/contacts`, renders stats + filter + table + slide-over. Client-side filtering on the pre-fetched dataset.

The task table sorts by priority (Critical=0, High=1, Normal=2), then overdue first, then by due date ascending. Each row has a Print icon that calls `printPdf(<WorkOrderPDF task={task} orgName="Mpumalanga Steel Fabricators (Pty) Ltd" />)` and an Edit icon that opens the slide-over.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: operations stabiliser — task API, work order PDF, task board page"
```

---

## Task 9: Creditor Pipeline App — Scaffold + API Routes + Page

**Files:** Mirror scaffold pattern, port 3003, indigo accent `#4F46E5`, includes @react-pdf/renderer.

- [ ] **Step 1: Create apps/creditor-pipeline scaffold**

Same pattern as Task 8 but:
- `name: "@rescue-ops/creditor-pipeline"`, port 3003
- Accent colour `#4F46E5` (indigo) in tailwind.config.ts
- Title: "Creditor Pipeline — rescue-ops"
- Dependencies include `@react-pdf/renderer`

- [ ] **Step 2: Create /api/creditors/route.ts**

```typescript
import { NextRequest } from "next/server";
import prisma, { Prisma } from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess, handleApiError, extractRequestMeta,
  writeAuditLog, parsePagination, paginatedResult,
} from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

const createCreditorSchema = z.object({
  creditorName: z.string().min(1, "Creditor name is required"),
  claimAmountInCents: z.number().int().min(1, "Claim amount must be positive"),
  securityType: z.enum(["Secured", "Preferent", "Concurrent"]),
  stage: z.enum(["Identified", "Notified", "InNegotiation", "OfferMade", "Agreed", "Voted"]).default("Identified"),
  contactId: z.string().nullable().optional(),
  votingStatus: z.enum(["Pending", "For", "Against", "Abstained"]).default("Pending"),
  notes: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const pagination = parsePagination(req);
    const stage = req.nextUrl.searchParams.get("stage");
    const security = req.nextUrl.searchParams.get("security");

    const where: Prisma.CreditorWhereInput = { orgId: DEFAULT_ORG_ID };
    if (stage) where.stage = stage as Prisma.EnumCreditorStageFilter["equals"];
    if (security) where.securityType = security as Prisma.EnumSecurityTypeFilter["equals"];

    const [data, total] = await Promise.all([
      prisma.creditor.findMany({
        where,
        include: {
          contact: { select: { id: true, name: true } },
          communications: { orderBy: { date: "desc" }, take: 1 },
        },
        orderBy: { claimAmountInCents: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.creditor.count({ where }),
    ]);

    return apiSuccess(paginatedResult(data, total, pagination));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createCreditorSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    const creditor = await prisma.creditor.create({
      data: { orgId: DEFAULT_ORG_ID, ...data, contactId: data.contactId || null },
      include: { contact: { select: { id: true, name: true } } },
    });

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "create",
      entityType: "creditor",
      entityId: creditor.id,
      metadata: { creditorName: data.creditorName },
      ipAddress,
      userAgent,
    });

    return apiSuccess(creditor, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 3: Create /api/creditors/[id]/route.ts**

GET returns creditor with full communications and contact. PATCH updates creditor fields (stage, votingStatus, etc.) with audit trail and diffChanges. Same pattern as Task 8 Step 4.

- [ ] **Step 4: Create /api/creditors/[id]/communications/route.ts**

```typescript
import { NextRequest } from "next/server";
import prisma from "@rescue-ops/database";
import { z } from "zod";
import {
  apiSuccess, handleApiError, extractRequestMeta,
  writeAuditLog, NotFoundError,
} from "@rescue-ops/shared";

const DEFAULT_ORG_ID = "org_mpumalanga_steel";

const createCommSchema = z.object({
  method: z.enum(["Email", "Phone", "Meeting", "Letter"]),
  summary: z.string().min(1, "Summary is required"),
  date: z.string().transform((s) => new Date(s)),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const communications = await prisma.creditorCommunication.findMany({
      where: { creditorId: id },
      orderBy: { date: "desc" },
    });
    return apiSuccess(communications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = createCommSchema.parse(body);
    const { ipAddress, userAgent } = extractRequestMeta(req);

    // Verify creditor exists
    const creditor = await prisma.creditor.findUnique({ where: { id } });
    if (!creditor || creditor.orgId !== DEFAULT_ORG_ID) throw new NotFoundError("Creditor not found");

    const [comm] = await Promise.all([
      prisma.creditorCommunication.create({
        data: { creditorId: id, ...data },
      }),
      // Update lastContactDate on creditor
      prisma.creditor.update({
        where: { id },
        data: { lastContactDate: data.date },
      }),
    ]);

    await writeAuditLog({
      orgId: DEFAULT_ORG_ID,
      action: "create",
      entityType: "communication",
      entityId: comm.id,
      metadata: { creditorId: id, method: data.method },
      ipAddress,
      userAgent,
    });

    return apiSuccess(comm, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 5: Create /api/contacts/route.ts**

Same as operations app — list contacts for dropdown.

- [ ] **Step 6: Create Creditor Summary PDF**

`apps/creditor-pipeline/components/CreditorSummaryPDF.tsx`:

A4 multi-page report with: header, summary stats, voting breakdown, full creditor table (20 rows per page with repeating headers), footer with date + page numbers. Uses @react-pdf/renderer. Sorted: Secured first (largest to smallest), then Preferent, then Concurrent.

- [ ] **Step 7: Create pipeline page components**

- `apps/creditor-pipeline/components/Header.tsx` — "Creditor Pipeline" + indigo badge + "Add Creditor" button + "Export Summary PDF" button (with spinner state) + cross-link
- `apps/creditor-pipeline/components/StatsRow.tsx` — 4 cards: Total Claims, Secured, Preferent, Concurrent (each with amount + count badge)
- `apps/creditor-pipeline/components/KanbanBoard.tsx` — 6 columns (Identified → Voted), each with header (stage + count + total claim). Cards rendered inside columns.
- `apps/creditor-pipeline/components/CreditorCard.tsx` — Card with creditor name, security badge (S/P/C), claim amount, contact name, last contact date, voting badge, left/right stage move buttons
- `apps/creditor-pipeline/components/CreditorSlideOver.tsx` — Wide slide-over (~500px). Top: creditor info form (name, claim, security, stage, contact dropdown, voting, notes). Bottom: communication timeline (newest first) + inline "Add Communication" form.
- `apps/creditor-pipeline/components/SlideOver.tsx` — same pattern, wider default
- `apps/creditor-pipeline/components/CrossLink.tsx` — same pattern

`apps/creditor-pipeline/app/page.tsx` — Client component that fetches `/api/creditors` and `/api/contacts`. Renders stats + kanban. Stage move buttons call PATCH `/api/creditors/[id]` with optimistic UI. Export PDF button calls `printPdf(<CreditorSummaryPDF ... />)` with loading spinner.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: creditor pipeline — API routes, Kanban board, creditor summary PDF"
```

---

## Task 10: Vercel Deployment Config

**Files:**
- Create: `apps/financial-triage/vercel.json`
- Create: `apps/operations/vercel.json`
- Create: `apps/creditor-pipeline/vercel.json`

- [ ] **Step 1: Create vercel.json for each app**

Each app gets the same vercel.json (adapted from flipmodel), with region set to `jnb1` (Johannesburg — closest to SA):

```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && npx turbo run build --filter=@rescue-ops/<app-name>",
  "installCommand": "cd ../.. && npm install",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, must-revalidate" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ],
  "regions": ["jnb1"]
}
```

Replace `<app-name>` with `financial-triage`, `operations`, or `creditor-pipeline` in each file's buildCommand.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: Vercel deployment config — JNB region, security headers"
```

---

## Task 11: CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md**

```markdown
# rescue-ops — CLAUDE.md

## What This Is
A Turborepo monorepo with three Next.js 15 portfolio apps demonstrating a business rescue management platform for South African practitioners.

## Architecture
- `apps/financial-triage` (port 3001) — Day 1 financial diagnosis dashboard
- `apps/operations` (port 3002) — Operational task management
- `apps/creditor-pipeline` (port 3003) — Creditor negotiation Kanban
- `packages/database` — Shared Prisma 7 schema + client (Neon PostgreSQL)
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
Next.js 15, TypeScript 5 (strict), Prisma 7, Neon PostgreSQL, Tailwind CSS 4, Recharts, @react-pdf/renderer, Zod, Sentry, Vitest, Turborepo
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "docs: CLAUDE.md with domain rules, commands, and patterns"
```

---

## Task 12: Vitest Setup + Key Tests

**Files:**
- Create: `packages/shared/formatters.test.ts`
- Create: `packages/shared/vitest.config.ts`
- Update: `packages/shared/package.json` (add vitest dev dependency + test script)

- [ ] **Step 1: Add vitest to shared package**

Add to `packages/shared/package.json`:
```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^2"
  }
}
```

Create `packages/shared/vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    globals: true,
  },
});
```

- [ ] **Step 2: Write formatter tests**

`packages/shared/formatters.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { formatZAR, formatDate, centsToRand, randToCents } from "./formatters";

describe("formatZAR", () => {
  it("formats positive cents to ZAR", () => {
    expect(formatZAR(34000000)).toBe("R 340,000.00");
  });

  it("formats negative cents to ZAR", () => {
    expect(formatZAR(-297200000)).toBe("-R 2,972,000.00");
  });

  it("formats zero", () => {
    expect(formatZAR(0)).toBe("R 0.00");
  });

  it("formats small amounts", () => {
    expect(formatZAR(150)).toBe("R 1.50");
  });
});

describe("formatDate", () => {
  it("formats Date to dd/mm/yyyy", () => {
    expect(formatDate(new Date("2026-03-01"))).toBe("01/03/2026");
  });

  it("formats ISO string to dd/mm/yyyy", () => {
    expect(formatDate("2026-04-02T00:00:00.000Z")).toBe("02/04/2026");
  });
});

describe("centsToRand", () => {
  it("converts cents to rand", () => {
    expect(centsToRand(34000000)).toBe(340000);
  });
});

describe("randToCents", () => {
  it("converts rand to cents", () => {
    expect(randToCents(340000)).toBe(34000000);
  });

  it("rounds to avoid floating point issues", () => {
    expect(randToCents(1.005)).toBe(101); // Math.round handles this
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd packages/shared
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: formatter unit tests with Vitest"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Monorepo + Turborepo — Task 1
- [x] Prisma schema (all models, enums, indexes) — Task 2
- [x] Shared utilities (audit, encryption, field-encryption, pagination, api-helpers, formatters) — Task 3
- [x] Seed data (org, 10 contacts, 20 balances, 10 tasks, 8 creditors, communications) — Task 4
- [x] Financial Triage app scaffold — Task 5
- [x] Financial Triage API routes (/api/triage, /api/balances) — Task 6
- [x] Financial Triage dashboard page + components — Task 7
- [x] Operations app scaffold + API + page — Task 8
- [x] Creditor Pipeline app scaffold + API + page — Task 9
- [x] Vercel deployment config — Task 10
- [x] CLAUDE.md — Task 11
- [x] Vitest tests — Task 12
- [x] Cross-app links with disabled fallback — CrossLink component in Tasks 7-9
- [x] "Exposure by Security Class" (renamed from aging pyramid) — SecurityChart in Task 7
- [x] Expense exclusion from solvency ratio — /api/triage in Task 6
- [x] PDF page breaks at 20 rows — Creditor Summary PDF in Task 9
- [x] Atomic TaskSequence — POST /api/tasks in Task 8
- [x] PDF export loading state — Header button in Task 9
- [x] formatZAR negatives — formatters.ts + tests in Tasks 3/12
- [x] Practitioner-tone seed communications — seed.ts in Task 4
- [x] Sentry config — Tasks 5, 8, 9
- [x] Work Order PDF — Task 8
- [x] Creditor Summary PDF — Task 9
- [x] printPdf helper — Task 8
- [x] No auth — confirmed throughout

**Placeholder scan:** No TBD/TODO found. Task 9 Steps 3, 6, 7 describe components at higher level (following established patterns from earlier tasks) rather than full code — this is intentional since they follow identical patterns already shown in Tasks 7-8. The implementing agent can follow the spec + prior patterns.

**Type consistency:** `DEFAULT_ORG_ID = "org_mpumalanga_steel"` used consistently. `extractRequestMeta` defined in api-helpers.ts and used in all route handlers. Prisma enum values match schema. `formatZAR`, `centsToRand`, `randToCents`, `formatDate` signatures consistent between formatters.ts and all consumers.
