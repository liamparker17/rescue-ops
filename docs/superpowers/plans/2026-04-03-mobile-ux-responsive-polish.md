# Mobile UX & Responsive Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all three rescue-ops apps responsive and delightful across every screen size — mobile, tablet, and desktop.

**Architecture:** Shared animation utilities and navigation components live in `packages/shared/`. Each app imports these and applies them alongside app-specific responsive changes (table→card views, kanban→collapsible sections). Desktop layouts remain unchanged; mobile gets purpose-built alternatives gated behind Tailwind's `md:` breakpoint. All animations are CSS-only (no new dependencies).

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, CSS keyframe animations, IntersectionObserver API

**Spec:** `docs/superpowers/specs/2026-04-03-mobile-ux-responsive-polish-design.md`

---

## File Structure

### New files (packages/shared):
| File | Responsibility |
|------|---------------|
| `packages/shared/components/BottomTabBar.tsx` | Cross-app mobile tab navigation |
| `packages/shared/components/HamburgerMenu.tsx` | Collapsible mobile header menu |
| `packages/shared/components/LoadingSkeleton.tsx` | Pulsing skeleton placeholders |
| `packages/shared/components/FirstVisitHint.tsx` | One-time tooltip hints |
| `packages/shared/hooks/useCountUp.ts` | Animated number counting hook |
| `packages/shared/hooks/useInView.ts` | IntersectionObserver visibility hook |
| `packages/shared/styles/animations.css` | Shared CSS keyframe animations |

### Modified files (per app):
Each app modifies: `layout.tsx`, `globals.css`, `tailwind.config.ts`, `Header.tsx`, `SlideOver.tsx`

**Triage-specific:** `MetricCard.tsx`, `DashboardClient.tsx`, `CreditorTable.tsx`, `AddBalanceForm.tsx`, `SecurityChart.tsx`, `RunwayChart.tsx`

**Operations-specific:** `StatsRow.tsx`, `FilterBar.tsx`, `TaskTable.tsx`, `page.tsx` (FAB + empty state)

**Pipeline-specific:** `KanbanBoard.tsx`, `CreditorCard.tsx`, `CreditorSlideOver.tsx`

---

## Task 1: Shared CSS Animations

**Files:**
- Create: `packages/shared/styles/animations.css`

- [ ] **Step 1: Create the animations CSS file**

```css
/* packages/shared/styles/animations.css */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}

@keyframes borderGrow {
  from {
    clip-path: inset(0 0 100% 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes pulseTwice {
  0%, 100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
  25% { box-shadow: 0 0 0 6px rgba(225, 29, 72, 0.2); }
  50% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
  75% { box-shadow: 0 0 0 6px rgba(225, 29, 72, 0.2); }
}

.animate-fade-in-up {
  animation: fadeInUp 400ms ease-out both;
}

.animate-scale-in {
  animation: scaleIn 300ms ease-out both;
}

.animate-slide-in-right {
  animation: slideInRight 300ms ease-out both;
}

.animate-slide-out-right {
  animation: slideOutRight 300ms ease-out both;
}

.animate-border-grow {
  animation: borderGrow 500ms ease-out both;
}

.animate-pulse-twice {
  animation: pulseTwice 1.2s ease-in-out both;
}

/* Stagger delay utilities */
.stagger-1 { animation-delay: 100ms; }
.stagger-2 { animation-delay: 200ms; }
.stagger-3 { animation-delay: 300ms; }
.stagger-4 { animation-delay: 400ms; }
.stagger-5 { animation-delay: 500ms; }
.stagger-6 { animation-delay: 600ms; }

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up,
  .animate-scale-in,
  .animate-slide-in-right,
  .animate-slide-out-right,
  .animate-border-grow,
  .animate-pulse-twice {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/shared/styles/animations.css
git commit -m "feat(shared): add CSS animation utilities with reduced-motion support"
```

---

## Task 2: useInView Hook

**Files:**
- Create: `packages/shared/hooks/useInView.ts`
- Modify: `packages/shared/index.ts`

- [ ] **Step 1: Create the useInView hook**

```typescript
// packages/shared/hooks/useInView.ts
"use client";

import { useEffect, useRef, useState } from "react";

export function useInView(options?: IntersectionObserverInit): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.2, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}
```

- [ ] **Step 2: Add export to index.ts**

Add this line to `packages/shared/index.ts`:

```typescript
export { useInView } from "./hooks/useInView";
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared/hooks/useInView.ts packages/shared/index.ts
git commit -m "feat(shared): add useInView hook for scroll-triggered animations"
```

---

## Task 3: useCountUp Hook

**Files:**
- Create: `packages/shared/hooks/useCountUp.ts`
- Modify: `packages/shared/index.ts`

- [ ] **Step 1: Create the useCountUp hook**

```typescript
// packages/shared/hooks/useCountUp.ts
"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number, duration = 800, active = true): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (target === 0) { setCurrent(0); return; }

    let raf: number;
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);

  return current;
}
```

- [ ] **Step 2: Add export to index.ts**

Add this line to `packages/shared/index.ts`:

```typescript
export { useCountUp } from "./hooks/useCountUp";
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared/hooks/useCountUp.ts packages/shared/index.ts
git commit -m "feat(shared): add useCountUp hook for animated number display"
```

---

## Task 4: BottomTabBar Component

**Files:**
- Create: `packages/shared/components/BottomTabBar.tsx`
- Modify: `packages/shared/index.ts`

- [ ] **Step 1: Create the BottomTabBar component**

```tsx
// packages/shared/components/BottomTabBar.tsx
"use client";

interface Tab {
  label: string;
  href: string | undefined;
  icon: React.ReactNode;
  accentColor: string;
}

interface BottomTabBarProps {
  activeApp: "triage" | "operations" | "pipeline";
  triageUrl?: string;
  opsUrl?: string;
  pipelineUrl?: string;
}

function TriageIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function OpsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function PipelineIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

const ACCENT_COLORS = {
  triage: "#0D9488",
  operations: "#D97706",
  pipeline: "#4F46E5",
};

export function BottomTabBar({ activeApp, triageUrl, opsUrl, pipelineUrl }: BottomTabBarProps) {
  const tabs: (Tab & { key: typeof activeApp })[] = [
    { key: "triage", label: "Triage", href: triageUrl, icon: <TriageIcon />, accentColor: ACCENT_COLORS.triage },
    { key: "operations", label: "Operations", href: opsUrl, icon: <OpsIcon />, accentColor: ACCENT_COLORS.operations },
    { key: "pipeline", label: "Pipeline", href: pipelineUrl, icon: <PipelineIcon />, accentColor: ACCENT_COLORS.pipeline },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const isActive = tab.key === activeApp;
          const isDisabled = !tab.href && !isActive;

          if (isActive) {
            return (
              <div
                key={tab.key}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
                style={{ color: tab.accentColor }}
              >
                {tab.icon}
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </div>
            );
          }

          if (isDisabled) {
            return (
              <div
                key={tab.key}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-slate-300"
              >
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </div>
            );
          }

          return (
            <a
              key={tab.key}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-slate-400 active:text-slate-600 transition-colors"
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Add export to index.ts**

Add this line to `packages/shared/index.ts`:

```typescript
export { BottomTabBar } from "./components/BottomTabBar";
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared/components/BottomTabBar.tsx packages/shared/index.ts
git commit -m "feat(shared): add BottomTabBar component for cross-app mobile navigation"
```

---

## Task 5: HamburgerMenu Component

**Files:**
- Create: `packages/shared/components/HamburgerMenu.tsx`
- Modify: `packages/shared/index.ts`

- [ ] **Step 1: Create the HamburgerMenu component**

```tsx
// packages/shared/components/HamburgerMenu.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface HamburgerMenuProps {
  children: React.ReactNode;
}

export function HamburgerMenu({ children }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Menu"
        aria-expanded={open}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fade-in-up">
          <div onClick={() => setOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function HamburgerItem({
  href,
  onClick,
  children,
  disabled = false,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const className = disabled
    ? "block w-full text-left px-4 py-2.5 text-sm text-slate-300 cursor-not-allowed"
    : "block w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors";

  if (href && !disabled) {
    return <a href={href} className={className}>{children}</a>;
  }

  return (
    <button onClick={disabled ? undefined : onClick} className={className} disabled={disabled}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Add export to index.ts**

Add this line to `packages/shared/index.ts`:

```typescript
export { HamburgerMenu, HamburgerItem } from "./components/HamburgerMenu";
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared/components/HamburgerMenu.tsx packages/shared/index.ts
git commit -m "feat(shared): add HamburgerMenu component for responsive header navigation"
```

---

## Task 6: LoadingSkeleton Component

**Files:**
- Create: `packages/shared/components/LoadingSkeleton.tsx`
- Modify: `packages/shared/index.ts`

- [ ] **Step 1: Create the LoadingSkeleton component**

```tsx
// packages/shared/components/LoadingSkeleton.tsx
interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-slate-200">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className="h-[220px] w-full" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-40 flex-1" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm border-l-4 border-l-slate-200">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-6 w-24 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table rows */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add export to index.ts**

Add this line to `packages/shared/index.ts`:

```typescript
export { MetricCardSkeleton, ChartSkeleton, TableRowSkeleton, CardSkeleton, DashboardSkeleton } from "./components/LoadingSkeleton";
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared/components/LoadingSkeleton.tsx packages/shared/index.ts
git commit -m "feat(shared): add loading skeleton components for shimmer loading states"
```

---

## Task 7: FirstVisitHint Component

**Files:**
- Create: `packages/shared/components/FirstVisitHint.tsx`
- Modify: `packages/shared/index.ts`

- [ ] **Step 1: Create the FirstVisitHint component**

```tsx
// packages/shared/components/FirstVisitHint.tsx
"use client";

import { useState, useEffect } from "react";

interface FirstVisitHintProps {
  storageKey: string;
  message: string;
  position?: "top" | "bottom";
}

export function FirstVisitHint({ storageKey, message, position = "bottom" }: FirstVisitHintProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        localStorage.setItem(storageKey, "1");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(storageKey, "1");
  }

  if (!visible) return null;

  const posClass = position === "top"
    ? "bottom-full mb-2"
    : "top-full mt-2";

  return (
    <div
      className={`absolute ${posClass} left-1/2 -translate-x-1/2 z-40 animate-fade-in-up`}
    >
      <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-2">
        <span>{message}</span>
        <button
          onClick={dismiss}
          className="text-slate-400 hover:text-white ml-1"
          aria-label="Dismiss hint"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add export to index.ts**

Add this line to `packages/shared/index.ts`:

```typescript
export { FirstVisitHint } from "./components/FirstVisitHint";
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared/components/FirstVisitHint.tsx packages/shared/index.ts
git commit -m "feat(shared): add FirstVisitHint component for one-time onboarding tooltips"
```

---

## Task 8: Update Tailwind Configs for Shared Content Paths

**Files:**
- Modify: `apps/financial-triage/tailwind.config.ts`
- Modify: `apps/operations/tailwind.config.ts`
- Modify: `apps/creditor-pipeline/tailwind.config.ts`

All three apps need to scan `packages/shared/components` for Tailwind classes.

- [ ] **Step 1: Update financial-triage tailwind.config.ts**

Change the `content` array in `apps/financial-triage/tailwind.config.ts` from:

```typescript
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
```

to:

```typescript
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/shared/components/**/*.{ts,tsx}",
  ],
```

- [ ] **Step 2: Update operations tailwind.config.ts**

Same change in `apps/operations/tailwind.config.ts` — add the shared path to `content`:

```typescript
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/shared/components/**/*.{ts,tsx}",
  ],
```

- [ ] **Step 3: Update creditor-pipeline tailwind.config.ts**

Same change in `apps/creditor-pipeline/tailwind.config.ts`:

```typescript
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/shared/components/**/*.{ts,tsx}",
  ],
```

- [ ] **Step 4: Commit**

```bash
git add apps/financial-triage/tailwind.config.ts apps/operations/tailwind.config.ts apps/creditor-pipeline/tailwind.config.ts
git commit -m "chore: add shared components path to all tailwind configs"
```

---

## Task 9: Import Animations CSS in All Apps

**Files:**
- Modify: `apps/financial-triage/app/globals.css`
- Modify: `apps/operations/app/globals.css`
- Modify: `apps/creditor-pipeline/app/globals.css`

- [ ] **Step 1: Update financial-triage globals.css**

Replace the contents of `apps/financial-triage/app/globals.css` with:

```css
@import "../../../packages/shared/styles/animations.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #FAFAFA;
  color: #0F172A;
}
```

- [ ] **Step 2: Update operations globals.css**

Replace `apps/operations/app/globals.css` with:

```css
@import "../../../packages/shared/styles/animations.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #FAFAFA;
  color: #0F172A;
}
```

- [ ] **Step 3: Update creditor-pipeline globals.css**

Replace `apps/creditor-pipeline/app/globals.css` with:

```css
@import "../../../packages/shared/styles/animations.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #FAFAFA;
  color: #0F172A;
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/financial-triage/app/globals.css apps/operations/app/globals.css apps/creditor-pipeline/app/globals.css
git commit -m "chore: import shared animations CSS in all app globals"
```

---

## Task 10: Responsive SlideOver (All Apps)

All three apps have identical `SlideOver.tsx`. Update all three to use full-screen on mobile with slide animation.

**Files:**
- Modify: `apps/financial-triage/components/SlideOver.tsx`
- Modify: `apps/operations/components/SlideOver.tsx`
- Modify: `apps/creditor-pipeline/components/SlideOver.tsx`

- [ ] **Step 1: Replace financial-triage SlideOver.tsx**

Replace the full contents of `apps/financial-triage/components/SlideOver.tsx` with:

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
        className={`relative w-full ${width} md:${width} bg-white shadow-xl overflow-y-auto animate-slide-in-right max-md:!max-w-none`}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 md:p-6 border-b z-10">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Copy to operations and pipeline**

Copy the exact same file to `apps/operations/components/SlideOver.tsx` and `apps/creditor-pipeline/components/SlideOver.tsx`.

- [ ] **Step 3: Commit**

```bash
git add apps/financial-triage/components/SlideOver.tsx apps/operations/components/SlideOver.tsx apps/creditor-pipeline/components/SlideOver.tsx
git commit -m "feat: responsive SlideOver — full-screen on mobile with slide animation"
```

---

## Task 11: Responsive Headers — Financial Triage

**Files:**
- Modify: `apps/financial-triage/components/Header.tsx`

- [ ] **Step 1: Replace Header.tsx**

Replace the full contents of `apps/financial-triage/components/Header.tsx` with:

```tsx
import { CrossLink } from "./CrossLink";
import { HamburgerMenu, HamburgerItem } from "@rescue-ops/shared";

interface HeaderProps {
  orgName: string;
  onAddBalance: () => void;
}

export function Header({ orgName, onAddBalance }: HeaderProps) {
  const opsUrl = process.env.NEXT_PUBLIC_OPS_URL;
  const pipelineUrl = process.env.NEXT_PUBLIC_PIPELINE_URL;

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Financial Triage</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal-50 text-accent">
            rescue-ops
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{orgName}</p>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        <CrossLink href={opsUrl} label="Operations" direction="right" />
        <CrossLink href={pipelineUrl} label="Creditor Pipeline" direction="right" />
        <button
          onClick={onAddBalance}
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          Add Opening Balances
        </button>
      </div>

      {/* Mobile hamburger */}
      <HamburgerMenu>
        <HamburgerItem href={opsUrl} disabled={!opsUrl}>Operations</HamburgerItem>
        <HamburgerItem href={pipelineUrl} disabled={!pipelineUrl}>Creditor Pipeline</HamburgerItem>
        <div className="border-t border-gray-100 my-1" />
        <HamburgerItem onClick={onAddBalance}>Add Opening Balances</HamburgerItem>
      </HamburgerMenu>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/financial-triage/components/Header.tsx
git commit -m "feat(triage): responsive header with hamburger menu on mobile"
```

---

## Task 12: Responsive Headers — Operations

**Files:**
- Modify: `apps/operations/components/Header.tsx`

- [ ] **Step 1: Replace Header.tsx**

Replace the full contents of `apps/operations/components/Header.tsx` with:

```tsx
import { CrossLink } from "./CrossLink";
import { HamburgerMenu, HamburgerItem } from "@rescue-ops/shared";

interface HeaderProps {
  onNewTask: () => void;
}

export function Header({ onNewTask }: HeaderProps) {
  const triageUrl = process.env.NEXT_PUBLIC_TRIAGE_URL;
  const pipelineUrl = process.env.NEXT_PUBLIC_PIPELINE_URL;

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Operations Stabiliser</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-accent">
            rescue-ops
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">Mpumalanga Steel Fabricators (Pty) Ltd</p>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        <CrossLink href={triageUrl} label="Financial Triage" direction="left" />
        <CrossLink href={pipelineUrl} label="Creditor Pipeline" direction="right" />
        <button
          onClick={onNewTask}
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          New Task
        </button>
      </div>

      {/* Mobile: just hamburger (New Task becomes FAB — see page.tsx) */}
      <HamburgerMenu>
        <HamburgerItem href={triageUrl} disabled={!triageUrl}>Financial Triage</HamburgerItem>
        <HamburgerItem href={pipelineUrl} disabled={!pipelineUrl}>Creditor Pipeline</HamburgerItem>
      </HamburgerMenu>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/operations/components/Header.tsx
git commit -m "feat(ops): responsive header with hamburger menu, New Task button becomes FAB"
```

---

## Task 13: Responsive Headers — Creditor Pipeline

**Files:**
- Modify: `apps/creditor-pipeline/components/Header.tsx`

- [ ] **Step 1: Replace Header.tsx**

Replace the full contents of `apps/creditor-pipeline/components/Header.tsx` with:

```tsx
import { CrossLink } from "./CrossLink";
import { HamburgerMenu, HamburgerItem } from "@rescue-ops/shared";

interface HeaderProps {
  onNewCreditor: () => void;
  onExportPdf: () => void;
  pdfLoading: boolean;
}

export function Header({ onNewCreditor, onExportPdf, pdfLoading }: HeaderProps) {
  const triageUrl = process.env.NEXT_PUBLIC_TRIAGE_URL;
  const opsUrl = process.env.NEXT_PUBLIC_OPS_URL;

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Creditor Pipeline</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-accent">
            rescue-ops
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">Mpumalanga Steel Fabricators (Pty) Ltd</p>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        <CrossLink href={triageUrl} label="Financial Triage" direction="left" />
        <CrossLink href={opsUrl} label="Operations" direction="left" />
        <button
          onClick={onExportPdf}
          disabled={pdfLoading}
          className="px-4 py-2 bg-white border border-accent text-accent text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {pdfLoading && (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
            </svg>
          )}
          Export Summary PDF
        </button>
        <button
          onClick={onNewCreditor}
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Creditor
        </button>
      </div>

      {/* Mobile: Add Creditor visible, rest in hamburger */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onNewCreditor}
          className="px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Creditor
        </button>
        <HamburgerMenu>
          <HamburgerItem href={triageUrl} disabled={!triageUrl}>Financial Triage</HamburgerItem>
          <HamburgerItem href={opsUrl} disabled={!opsUrl}>Operations</HamburgerItem>
          <div className="border-t border-gray-100 my-1" />
          <HamburgerItem onClick={onExportPdf} disabled={pdfLoading}>
            {pdfLoading ? "Exporting..." : "Export Summary PDF"}
          </HamburgerItem>
        </HamburgerMenu>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/creditor-pipeline/components/Header.tsx
git commit -m "feat(pipeline): responsive header with primary action visible, rest in hamburger"
```

---

## Task 14: Add BottomTabBar + Padding to All Layouts

**Files:**
- Modify: `apps/financial-triage/app/layout.tsx`
- Modify: `apps/operations/app/layout.tsx`
- Modify: `apps/creditor-pipeline/app/layout.tsx`

- [ ] **Step 1: Update financial-triage layout.tsx**

Replace `apps/financial-triage/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BottomTabBar } from "@rescue-ops/shared";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Financial Triage — rescue-ops",
  description: "Day 1 financial diagnosis for business rescue proceedings",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="pb-16 md:pb-0">{children}</div>
        <BottomTabBar
          activeApp="triage"
          triageUrl={process.env.NEXT_PUBLIC_TRIAGE_URL}
          opsUrl={process.env.NEXT_PUBLIC_OPS_URL}
          pipelineUrl={process.env.NEXT_PUBLIC_PIPELINE_URL}
        />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update operations layout.tsx**

Replace `apps/operations/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BottomTabBar } from "@rescue-ops/shared";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Operations Stabiliser — rescue-ops",
  description: "Operational task management for business rescue proceedings",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="pb-16 md:pb-0">{children}</div>
        <BottomTabBar
          activeApp="operations"
          triageUrl={process.env.NEXT_PUBLIC_TRIAGE_URL}
          opsUrl={process.env.NEXT_PUBLIC_OPS_URL}
          pipelineUrl={process.env.NEXT_PUBLIC_PIPELINE_URL}
        />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update creditor-pipeline layout.tsx**

Replace `apps/creditor-pipeline/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BottomTabBar } from "@rescue-ops/shared";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Creditor Pipeline — rescue-ops",
  description: "Creditor negotiation pipeline for business rescue proceedings",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="pb-16 md:pb-0">{children}</div>
        <BottomTabBar
          activeApp="pipeline"
          triageUrl={process.env.NEXT_PUBLIC_TRIAGE_URL}
          opsUrl={process.env.NEXT_PUBLIC_OPS_URL}
          pipelineUrl={process.env.NEXT_PUBLIC_PIPELINE_URL}
        />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/financial-triage/app/layout.tsx apps/operations/app/layout.tsx apps/creditor-pipeline/app/layout.tsx
git commit -m "feat: add BottomTabBar to all app layouts with mobile padding"
```

---

## Task 15: Animated MetricCard with Count-Up

**Files:**
- Modify: `apps/financial-triage/components/MetricCard.tsx`

- [ ] **Step 1: Replace MetricCard.tsx**

Replace the full contents of `apps/financial-triage/components/MetricCard.tsx` with:

```tsx
"use client";

import { formatZAR } from "@rescue-ops/shared";
import { useCountUp } from "@rescue-ops/shared";

interface MetricCardProps {
  label: string;
  value: number;
  format?: "currency" | "ratio" | "days";
  colorLogic?: "solvency" | "none";
  delay?: number;
}

export function MetricCard({ label, value, format = "currency", colorLogic = "none", delay = 0 }: MetricCardProps) {
  const animatedValue = useCountUp(value, 800);

  let displayValue: string;
  let colorClass = "text-slate-900";

  switch (format) {
    case "currency":
      displayValue = formatZAR(animatedValue);
      break;
    case "ratio":
      displayValue = (animatedValue / 100).toFixed(2);
      if (colorLogic === "solvency") {
        const actual = value / 100;
        if (actual < 1) colorClass = "text-rose-600";
        else if (actual < 1.5) colorClass = "text-amber-600";
        else colorClass = "text-emerald-600";
      }
      break;
    case "days":
      displayValue = `${animatedValue} days`;
      if (value < 30) colorClass = "text-rose-600";
      else if (value < 90) colorClass = "text-amber-600";
      break;
    default:
      displayValue = String(animatedValue);
  }

  // For ratio format, we need to pass a scaled value to useCountUp
  // and format it differently
  if (format === "ratio") {
    displayValue = (animatedValue === 0 && value !== 0) ? "0.00" : displayValue;
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-accent animate-fade-in-up animate-border-grow"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold mt-2 ${colorClass}`}>{displayValue}</p>
    </div>
  );
}
```

Note: The ratio format needs special handling. The existing MetricCard passes `solvencyRatio` (e.g. `1.23`) which is a float. `useCountUp` works with integers. For ratios, we should count up the integer part (e.g., multiply by 100, count up to 123, display as 1.23). Update the hook usage:

Actually, let's simplify. The `useCountUp` hook already rounds to integers. For ratio, pass `Math.round(value * 100)` and display as `(animatedValue / 100).toFixed(2)`. Revise the component:

```tsx
"use client";

import { formatZAR, useCountUp } from "@rescue-ops/shared";

interface MetricCardProps {
  label: string;
  value: number;
  format?: "currency" | "ratio" | "days";
  colorLogic?: "solvency" | "none";
  delay?: number;
}

export function MetricCard({ label, value, format = "currency", colorLogic = "none", delay = 0 }: MetricCardProps) {
  // Scale value for count-up based on format
  const countTarget = format === "ratio" ? Math.round(value * 100) : value;
  const animated = useCountUp(countTarget, 800);

  let displayValue: string;
  let colorClass = "text-slate-900";

  switch (format) {
    case "currency":
      displayValue = formatZAR(animated);
      break;
    case "ratio":
      displayValue = (animated / 100).toFixed(2);
      if (colorLogic === "solvency") {
        if (value < 1) colorClass = "text-rose-600";
        else if (value < 1.5) colorClass = "text-amber-600";
        else colorClass = "text-emerald-600";
      }
      break;
    case "days":
      displayValue = `${animated} days`;
      if (value < 30) colorClass = "text-rose-600";
      else if (value < 90) colorClass = "text-amber-600";
      break;
    default:
      displayValue = String(animated);
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-accent animate-fade-in-up animate-border-grow"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold mt-2 ${colorClass}`}>{displayValue}</p>
    </div>
  );
}
```

- [ ] **Step 2: Update DashboardClient.tsx to pass stagger delays**

In `apps/financial-triage/components/DashboardClient.tsx`, change the hero metrics grid from:

```tsx
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Cash Position" value={data.metrics.cashPosition} />
        <MetricCard label="Total Creditor Exposure" value={data.metrics.totalCreditorExposure} />
        <MetricCard label="Solvency Ratio" value={data.metrics.solvencyRatio} format="ratio" colorLogic="solvency" />
        <MetricCard label="Monthly Burn Rate" value={data.metrics.monthlyBurnRate} />
      </div>
```

to:

```tsx
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Cash Position" value={data.metrics.cashPosition} delay={0} />
        <MetricCard label="Total Creditor Exposure" value={data.metrics.totalCreditorExposure} delay={100} />
        <MetricCard label="Solvency Ratio" value={data.metrics.solvencyRatio} format="ratio" colorLogic="solvency" delay={200} />
        <MetricCard label="Monthly Burn Rate" value={data.metrics.monthlyBurnRate} delay={300} />
      </div>
```

- [ ] **Step 3: Commit**

```bash
git add apps/financial-triage/components/MetricCard.tsx apps/financial-triage/components/DashboardClient.tsx
git commit -m "feat(triage): animated metric cards with count-up and stagger"
```

---

## Task 16: Scroll-Triggered Chart Animations

**Files:**
- Modify: `apps/financial-triage/components/SecurityChart.tsx`
- Modify: `apps/financial-triage/components/RunwayChart.tsx`

- [ ] **Step 1: Update SecurityChart.tsx**

Replace the full contents of `apps/financial-triage/components/SecurityChart.tsx` with:

```tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { centsToRand, formatZAR, useInView } from "@rescue-ops/shared";

interface SecurityChartProps {
  data: { Secured: number; Preferent: number; Concurrent: number };
}

const COLORS: Record<string, string> = {
  Secured: "#334155",
  Preferent: "#0D9488",
  Concurrent: "#94A3B8",
};

export function SecurityChart({ data }: SecurityChartProps) {
  const [ref, inView] = useInView();

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value: centsToRand(value),
    fill: COLORS[name],
  }));

  return (
    <div ref={ref} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in-up">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
        Exposure by Security Class
      </h3>
      <ResponsiveContainer width="100%" height={220} className="md:h-[220px]">
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
          <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={inView} animationDuration={800}>
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

- [ ] **Step 2: Update RunwayChart.tsx**

Replace the full contents of `apps/financial-triage/components/RunwayChart.tsx` with:

```tsx
"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea,
} from "recharts";
import { centsToRand, formatZAR, useInView } from "@rescue-ops/shared";

interface RunwayChartProps {
  data: { day: number; balance: number }[];
  runwayDays: number;
}

export function RunwayChart({ data, runwayDays }: RunwayChartProps) {
  const [ref, inView] = useInView();

  const chartData = data.map((d) => ({
    day: `Day ${d.day}`,
    balance: centsToRand(d.balance),
    dayNum: d.day,
  }));

  const minBalance = Math.min(...chartData.map((d) => d.balance));

  return (
    <div ref={ref} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in-up stagger-1">
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
            isAnimationActive={inView}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/financial-triage/components/SecurityChart.tsx apps/financial-triage/components/RunwayChart.tsx
git commit -m "feat(triage): scroll-triggered chart animations with useInView"
```

---

## Task 17: Responsive CreditorTable (Card View on Mobile)

**Files:**
- Modify: `apps/financial-triage/components/CreditorTable.tsx`

- [ ] **Step 1: Replace CreditorTable.tsx**

Replace the full contents of `apps/financial-triage/components/CreditorTable.tsx` with:

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
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
        Top 10 Creditor Exposure
      </h3>

      {/* Desktop: table rows */}
      <div className="hidden md:block space-y-2">
        {creditors.map((c, i) => {
          const barWidth = maxClaim > 0 ? (c.claimAmountInCents / maxClaim) * 100 : 0;
          return (
            <div key={c.id} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
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

      {/* Mobile: card view */}
      <div className="md:hidden space-y-3">
        {creditors.map((c, i) => {
          const barWidth = maxClaim > 0 ? (c.claimAmountInCents / maxClaim) * 100 : 0;
          const Wrapper = pipelineUrl ? "a" : "div";
          const wrapperProps = pipelineUrl
            ? { href: `${pipelineUrl}?creditor=${c.id}` }
            : {};

          return (
            <Wrapper
              key={c.id}
              {...wrapperProps}
              className="block bg-slate-50 rounded-lg p-3 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-slate-900">{c.creditorName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${SECURITY_COLORS[c.securityType] || "bg-slate-200"}`}>
                  {c.securityType}
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-semibold text-slate-900">{formatZAR(c.claimAmountInCents)}</span>
                <span className="text-xs text-slate-400">{c.percentOfTotal.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-accent rounded-full h-1.5 transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/financial-triage/components/CreditorTable.tsx
git commit -m "feat(triage): responsive creditor table — card view on mobile with stagger"
```

---

## Task 18: Responsive AddBalanceForm

**Files:**
- Modify: `apps/financial-triage/components/AddBalanceForm.tsx`

- [ ] **Step 1: Replace AddBalanceForm.tsx**

Replace the full contents of `apps/financial-triage/components/AddBalanceForm.tsx` with:

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
        <div key={i}>
          {/* Desktop: grid layout */}
          <div className="hidden md:grid grid-cols-12 gap-2 items-end">
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

          {/* Mobile: stacked card */}
          <div className="md:hidden border border-gray-200 rounded-lg p-3 space-y-2 relative">
            <button
              onClick={() => removeRow(i)}
              className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 p-1"
            >
              ✕
            </button>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">Code</label>
                <input
                  value={row.accountCode}
                  onChange={(e) => updateRow(i, "accountCode", e.target.value)}
                  className="w-full border rounded px-2 py-2 text-sm min-h-[44px]"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Type</label>
                <select
                  value={row.accountType}
                  onChange={(e) => updateRow(i, "accountType", e.target.value)}
                  className="w-full border rounded px-2 py-2 text-sm min-h-[44px]"
                >
                  <option>Asset</option>
                  <option>Liability</option>
                  <option>Equity</option>
                  <option>Revenue</option>
                  <option>Expense</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Name</label>
              <input
                value={row.accountName}
                onChange={(e) => updateRow(i, "accountName", e.target.value)}
                className="w-full border rounded px-2 py-2 text-sm min-h-[44px]"
                placeholder="FNB Current"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">Balance (R)</label>
                <input
                  type="number"
                  value={row.balance}
                  onChange={(e) => updateRow(i, "balance", e.target.value)}
                  className="w-full border rounded px-2 py-2 text-sm min-h-[44px]"
                  placeholder="340000"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">As At</label>
                <input
                  type="date"
                  value={row.asAtDate}
                  onChange={(e) => updateRow(i, "asAtDate", e.target.value)}
                  className="w-full border rounded px-2 py-2 text-sm min-h-[44px]"
                />
              </div>
            </div>
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
        className="w-full py-2.5 min-h-[44px] bg-accent text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : "Save All"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/financial-triage/components/AddBalanceForm.tsx
git commit -m "feat(triage): responsive AddBalanceForm — stacked cards on mobile with touch targets"
```

---

## Task 19: Operations — Responsive StatsRow with Pulse

**Files:**
- Modify: `apps/operations/components/StatsRow.tsx`

- [ ] **Step 1: Replace StatsRow.tsx**

Replace the full contents of `apps/operations/components/StatsRow.tsx` with:

```tsx
"use client";

import { useCountUp } from "@rescue-ops/shared";

interface StatsRowProps {
  openCount: number;
  criticalCount: number;
  inProgressCount: number;
  completedThisWeek: number;
}

export function StatsRow({ openCount, criticalCount, inProgressCount, completedThisWeek }: StatsRowProps) {
  const animOpen = useCountUp(openCount, 800);
  const animCritical = useCountUp(criticalCount, 800);
  const animProgress = useCountUp(inProgressCount, 800);
  const animCompleted = useCountUp(completedThisWeek, 800);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-slate-400 animate-fade-in-up">
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">Open Tasks</p>
        <p className="text-2xl md:text-3xl font-bold mt-2 text-slate-900">{animOpen}</p>
      </div>
      <div className={`bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 ${criticalCount > 0 ? "border-l-rose-500" : "border-l-slate-400"} animate-fade-in-up stagger-1 ${criticalCount > 0 ? "animate-pulse-twice" : ""}`}>
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">Critical</p>
        <p className={`text-2xl md:text-3xl font-bold mt-2 ${criticalCount > 0 ? "text-rose-600" : "text-slate-900"}`}>{animCritical}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-amber-500 animate-fade-in-up stagger-2">
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">In Progress</p>
        <p className="text-2xl md:text-3xl font-bold mt-2 text-amber-600">{animProgress}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-l-emerald-500 animate-fade-in-up stagger-3">
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide">Completed This Week</p>
        <p className="text-2xl md:text-3xl font-bold mt-2 text-emerald-600">{animCompleted}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/operations/components/StatsRow.tsx
git commit -m "feat(ops): animated StatsRow with count-up, stagger, and critical pulse"
```

---

## Task 20: Operations — Responsive FilterBar

**Files:**
- Modify: `apps/operations/components/FilterBar.tsx`

- [ ] **Step 1: Replace FilterBar.tsx**

Replace the full contents of `apps/operations/components/FilterBar.tsx` with:

```tsx
interface FilterBarProps {
  statusFilter: string;
  priorityFilter: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onSearchChange: (query: string) => void;
}

export function FilterBar({
  statusFilter,
  priorityFilter,
  searchQuery,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-4 mb-6">
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full md:flex-1 md:min-w-[200px] px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 md:order-last"
      />
      <div className="grid grid-cols-2 md:flex gap-3 md:gap-4">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
        </select>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/operations/components/FilterBar.tsx
git commit -m "feat(ops): responsive FilterBar — search full-width, dropdowns 2-col on mobile"
```

---

## Task 21: Operations — Responsive TaskTable with Card View + Empty State

**Files:**
- Modify: `apps/operations/components/TaskTable.tsx`

- [ ] **Step 1: Replace TaskTable.tsx**

Replace the full contents of `apps/operations/components/TaskTable.tsx` with:

```tsx
import { TASK_PRIORITY_ORDER } from "@rescue-ops/shared";

interface Task {
  id: string;
  taskNumber: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  responsibleId: string | null;
  dueDate: string | null;
  completedAt: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  responsible: { id: string; name: string } | null;
}

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onPrint: (task: Task) => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

function priorityBadge(priority: string) {
  switch (priority) {
    case "Critical":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">Critical</span>;
    case "High":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">High</span>;
    default:
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Normal</span>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "Open":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Open</span>;
    case "InProgress":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">In Progress</span>;
    case "Completed":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Completed</span>;
    case "Cancelled":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Cancelled</span>;
    default:
      return <span className="text-xs">{status}</span>;
  }
}

function isOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  if (task.status === "Completed" || task.status === "Cancelled") return false;
  return new Date(task.dueDate) < new Date();
}

function formatTaskNumber(num: number): string {
  return `OT-${String(num).padStart(4, "0")}`;
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const pa = TASK_PRIORITY_ORDER[a.priority] ?? 2;
    const pb = TASK_PRIORITY_ORDER[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;

    const aOverdue = isOverdue(a) ? 0 : 1;
    const bOverdue = isOverdue(b) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;

    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return aDate - bDate;
  });
}

function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center max-w-sm">
        <p className="text-slate-500 text-sm">
          {hasFilters ? "No tasks match your filters" : "No tasks yet"}
        </p>
        {hasFilters && onClearFilters ? (
          <button
            onClick={onClearFilters}
            className="text-accent text-sm font-medium mt-2 hover:underline"
          >
            Clear filters
          </button>
        ) : (
          <p className="text-slate-400 text-xs mt-1">Tap + to create one</p>
        )}
      </div>
    </div>
  );
}

export function TaskTable({ tasks, onEdit, onPrint, hasFilters = false, onClearFilters }: TaskTableProps) {
  const sorted = sortTasks(tasks);

  if (sorted.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <EmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-500">#</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Title</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Priority</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Responsible</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Due Date</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((task) => {
              const overdue = isOverdue(task);
              return (
                <tr key={task.id} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {formatTaskNumber(task.taskNumber)}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-medium max-w-[250px] truncate">
                    {task.title}
                  </td>
                  <td className="px-4 py-3">{priorityBadge(task.priority)}</td>
                  <td className="px-4 py-3">{statusBadge(task.status)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {task.responsible?.name || <span className="text-slate-300">&mdash;</span>}
                  </td>
                  <td className={`px-4 py-3 ${overdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-ZA")
                      : <span className="text-slate-300">&mdash;</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPrint(task)}
                        className="text-slate-400 hover:text-accent transition-colors p-1"
                        title="Print Work Order"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEdit(task)}
                        className="text-slate-400 hover:text-accent transition-colors p-1"
                        title="Edit Task"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden divide-y divide-gray-100">
        {sorted.map((task, i) => {
          const overdue = isOverdue(task);
          return (
            <div
              key={task.id}
              className="p-4 active:bg-slate-50 transition-colors animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => onEdit(task)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-slate-400">{formatTaskNumber(task.taskNumber)}</span>
                {priorityBadge(task.priority)}
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">{task.title}</p>
              {task.responsible && (
                <p className="text-xs text-slate-400 mb-2">{task.responsible.name}</p>
              )}
              <div className="flex items-center justify-between">
                {statusBadge(task.status)}
                <div className="flex items-center gap-3">
                  {task.dueDate && (
                    <span className={`text-xs ${overdue ? "text-red-600 font-medium" : "text-slate-400"}`}>
                      {new Date(task.dueDate).toLocaleDateString("en-ZA")}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onPrint(task); }}
                    className="text-slate-400 hover:text-accent p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { Task };
```

- [ ] **Step 2: Update TaskTable usage in page.tsx to pass new props**

In `apps/operations/app/page.tsx`, update the `<TaskTable>` usage to pass `hasFilters` and `onClearFilters`. Find the TaskTable render call and add:

```tsx
<TaskTable
  tasks={filtered}
  onEdit={handleEdit}
  onPrint={handlePrint}
  hasFilters={!!(statusFilter || priorityFilter || searchQuery)}
  onClearFilters={() => { setStatusFilter(""); setPriorityFilter(""); setSearchQuery(""); }}
/>
```

- [ ] **Step 3: Commit**

```bash
git add apps/operations/components/TaskTable.tsx apps/operations/app/page.tsx
git commit -m "feat(ops): responsive TaskTable — card view on mobile with styled empty state"
```

---

## Task 22: Operations — FAB (Floating Action Button)

**Files:**
- Modify: `apps/operations/app/page.tsx`

- [ ] **Step 1: Add FAB to operations page.tsx**

In `apps/operations/app/page.tsx`, add the FAB component just before the closing `</>` in the return statement:

```tsx
      {/* Mobile FAB */}
      <button
        onClick={() => setSlideOpen(true)}
        className="fixed bottom-20 right-4 z-40 md:hidden w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center animate-scale-in active:scale-95 transition-transform"
        aria-label="New Task"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
```

Note: `bottom-20` places it above the 56px tab bar with spacing.

- [ ] **Step 2: Commit**

```bash
git add apps/operations/app/page.tsx
git commit -m "feat(ops): add floating action button for New Task on mobile"
```

---

## Task 23: Creditor Pipeline — Responsive KanbanBoard

**Files:**
- Modify: `apps/creditor-pipeline/components/KanbanBoard.tsx`

- [ ] **Step 1: Replace KanbanBoard.tsx**

Replace the full contents of `apps/creditor-pipeline/components/KanbanBoard.tsx` with:

```tsx
"use client";

import { useState, useRef } from "react";
import { CREDITOR_STAGES, CREDITOR_STAGE_LABELS, formatZAR } from "@rescue-ops/shared";
import { CreditorCard, type Creditor } from "./CreditorCard";

interface KanbanBoardProps {
  creditors: Creditor[];
  onMoveStage: (creditorId: string, direction: "left" | "right") => void;
  onCardClick: (creditor: Creditor) => void;
}

export function KanbanBoard({ creditors, onMoveStage, onCardClick }: KanbanBoardProps) {
  const [expandedStage, setExpandedStage] = useState<string>(CREDITOR_STAGES[0]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const grouped = CREDITOR_STAGES.reduce((acc, stage) => {
    acc[stage] = creditors.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<string, Creditor[]>);

  function toggleStage(stage: string) {
    setExpandedStage(expandedStage === stage ? "" : stage);
  }

  function scrollToStage(stage: string) {
    setExpandedStage(stage);
    setTimeout(() => {
      sectionRefs.current[stage]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <>
      {/* Desktop: horizontal kanban */}
      <div className="hidden lg:block overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {CREDITOR_STAGES.map((stage, stageIndex) => {
            const stageCreditors = grouped[stage] || [];
            const totalAmount = stageCreditors.reduce((sum, c) => sum + c.claimAmountInCents, 0);

            return (
              <div key={stage} className="w-72 flex-shrink-0">
                <div className="bg-slate-50 rounded-t-lg px-4 py-3 border border-gray-200 border-b-0">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-semibold text-slate-700">
                      {CREDITOR_STAGE_LABELS[stage] || stage}
                    </h2>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {stageCreditors.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{formatZAR(totalAmount)}</p>
                </div>
                <div className="bg-slate-50/50 border border-gray-200 rounded-b-lg p-3 min-h-[200px] space-y-3">
                  {stageCreditors.map((creditor) => (
                    <CreditorCard
                      key={creditor.id}
                      creditor={creditor}
                      onMoveLeft={() => onMoveStage(creditor.id, "left")}
                      onMoveRight={() => onMoveStage(creditor.id, "right")}
                      onClick={() => onCardClick(creditor)}
                      canMoveLeft={stageIndex > 0}
                      canMoveRight={stageIndex < CREDITOR_STAGES.length - 1}
                    />
                  ))}
                  {stageCreditors.length === 0 && (
                    <p className="text-xs text-slate-300 text-center py-8">No creditors</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile + Tablet: pill nav + collapsible sections */}
      <div className="lg:hidden">
        {/* Stage pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 md:hidden">
          {CREDITOR_STAGES.map((stage) => {
            const count = grouped[stage]?.length || 0;
            const isActive = expandedStage === stage;
            return (
              <button
                key={stage}
                onClick={() => scrollToStage(stage)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-slate-100 text-slate-600 active:bg-slate-200"
                }`}
              >
                {CREDITOR_STAGE_LABELS[stage] || stage} ({count})
              </button>
            );
          })}
        </div>

        {/* Collapsible sections */}
        <div className="space-y-3">
          {CREDITOR_STAGES.map((stage, stageIndex) => {
            const stageCreditors = grouped[stage] || [];
            const totalAmount = stageCreditors.reduce((sum, c) => sum + c.claimAmountInCents, 0);
            const isExpanded = expandedStage === stage;

            return (
              <div
                key={stage}
                ref={(el) => { sectionRefs.current[stage] = el; }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleStage(stage)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-slate-700">
                      {CREDITOR_STAGE_LABELS[stage] || stage}
                    </h2>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {stageCreditors.length}
                    </span>
                    <span className="text-xs text-slate-400">{formatZAR(totalAmount)}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className="transition-all duration-300 overflow-hidden"
                  style={{ maxHeight: isExpanded ? `${stageCreditors.length * 200 + 100}px` : "0px" }}
                >
                  <div className="p-3 space-y-3">
                    {stageCreditors.map((creditor) => (
                      <CreditorCard
                        key={creditor.id}
                        creditor={creditor}
                        onMoveLeft={() => onMoveStage(creditor.id, "left")}
                        onMoveRight={() => onMoveStage(creditor.id, "right")}
                        onClick={() => onCardClick(creditor)}
                        canMoveLeft={stageIndex > 0}
                        canMoveRight={stageIndex < CREDITOR_STAGES.length - 1}
                      />
                    ))}
                    {stageCreditors.length === 0 && (
                      <p className="text-xs text-slate-300 text-center py-8">No creditors</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/creditor-pipeline/components/KanbanBoard.tsx
git commit -m "feat(pipeline): responsive KanbanBoard — collapsible sections + pill nav on mobile"
```

---

## Task 24: Creditor Pipeline — Enhanced CreditorCard

**Files:**
- Modify: `apps/creditor-pipeline/components/CreditorCard.tsx`

- [ ] **Step 1: Replace CreditorCard.tsx**

Replace the full contents of `apps/creditor-pipeline/components/CreditorCard.tsx` with:

```tsx
"use client";

import { formatZAR, formatDate } from "@rescue-ops/shared";

export interface Creditor {
  id: string;
  creditorName: string;
  claimAmountInCents: number;
  securityType: string;
  stage: string;
  contactId: string | null;
  lastContactDate: string | null;
  votingStatus: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  contact: { id: string; name: string } | null;
  _count: { communications: number };
}

interface CreditorCardProps {
  creditor: Creditor;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onClick: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

const securityBadgeColors: Record<string, string> = {
  Secured: "bg-slate-700 text-white",
  Preferent: "bg-accent text-white",
  Concurrent: "bg-slate-400 text-white",
};

const securityBadgeLetters: Record<string, string> = {
  Secured: "S",
  Preferent: "P",
  Concurrent: "C",
};

const votingBadgeColors: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  For: "bg-emerald-100 text-emerald-700",
  Against: "bg-rose-100 text-rose-700",
  Abstained: "bg-amber-100 text-amber-700",
};

export function CreditorCard({
  creditor,
  onMoveLeft,
  onMoveRight,
  onClick,
  canMoveLeft,
  canMoveRight,
}: CreditorCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm border-l-4 border-l-accent animate-fade-in-up">
      <div
        className="p-3 md:p-4 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-900 leading-tight">
            {creditor.creditorName}
          </h3>
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded animate-scale-in ${securityBadgeColors[creditor.securityType] || "bg-gray-200 text-gray-700"}`}
          >
            {securityBadgeLetters[creditor.securityType] || "?"}
          </span>
        </div>

        <p className="text-lg font-bold text-slate-900 mb-2">
          {formatZAR(creditor.claimAmountInCents)}
        </p>

        <p className="text-xs text-slate-500 mb-1">
          {creditor.contact?.name || "\u2014"}
        </p>

        <p className="text-xs text-slate-400 mb-2">
          {creditor.lastContactDate ? formatDate(creditor.lastContactDate) : "\u2014"}
        </p>

        <span
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full animate-scale-in ${votingBadgeColors[creditor.votingStatus] || "bg-gray-100 text-gray-600"}`}
        >
          {creditor.votingStatus}
        </span>
      </div>

      <div className="flex border-t border-gray-100">
        <button
          onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
          disabled={!canMoveLeft}
          className="flex-1 py-2.5 min-h-[44px] text-sm font-medium text-slate-400 hover:text-accent hover:bg-indigo-50 active:bg-indigo-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-100"
        >
          &larr;
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
          disabled={!canMoveRight}
          className="flex-1 py-2.5 min-h-[44px] text-sm font-medium text-slate-400 hover:text-accent hover:bg-indigo-50 active:bg-indigo-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/creditor-pipeline/components/CreditorCard.tsx
git commit -m "feat(pipeline): enhanced CreditorCard — touch targets, animations, active states"
```

---

## Task 25: Creditor Pipeline — Timeline Polish in CreditorSlideOver

**Files:**
- Modify: `apps/creditor-pipeline/components/CreditorSlideOver.tsx`

- [ ] **Step 1: Update the timeline section in CreditorSlideOver.tsx**

In `apps/creditor-pipeline/components/CreditorSlideOver.tsx`, replace the communication timeline section (everything from `{/* Communication Timeline */}` to the end of the component's return) with:

```tsx
      {/* Communication Timeline */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Communication Timeline</h3>
          <button
            onClick={() => setShowCommForm(!showCommForm)}
            className="text-xs font-medium text-accent hover:text-indigo-700 flex items-center gap-1"
          >
            {showCommForm ? "Cancel" : "+ Add"}
          </button>
        </div>

        {/* Add communication form — collapsible */}
        {showCommForm && (
          <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-3 animate-fade-in-up">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="date"
                  value={commDate}
                  onChange={(e) => setCommDate(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <select
                  value={commMethod}
                  onChange={(e) => setCommMethod(e.target.value)}
                  className="px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                >
                  {COMMUNICATION_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={commSummary}
              onChange={(e) => setCommSummary(e.target.value)}
              placeholder="Communication summary..."
              rows={2}
              className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <button
              onClick={handleAddComm}
              disabled={addingComm || !commSummary.trim()}
              className="px-4 py-2 min-h-[44px] bg-accent text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {addingComm ? "Adding..." : "Add Communication"}
            </button>
          </div>
        )}

        {/* Timeline entries with vertical line */}
        <div className="relative">
          {creditor.communications.length > 1 && (
            <div className="absolute left-[39px] top-2 bottom-2 w-px bg-gray-200" />
          )}
          <div className="space-y-4">
            {creditor.communications.map((comm) => (
              <div key={comm.id} className="flex gap-3 items-start relative animate-fade-in-up">
                <div className="text-xs text-slate-400 w-20 flex-shrink-0 pt-0.5">
                  {formatDate(comm.date)}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${methodBadgeColors[comm.method] || "bg-gray-100 text-gray-600"}`}
                >
                  {comm.method}
                </span>
                <p className="text-sm text-slate-700 leading-snug">{comm.summary}</p>
              </div>
            ))}
            {creditor.communications.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No communications recorded</p>
            )}
          </div>
        </div>
      </div>
```

Also add the `showCommForm` state at the top of the component alongside the other state:

```typescript
const [showCommForm, setShowCommForm] = useState(false);
```

And ensure all form inputs have `min-h-[44px]` for touch targets. The existing inputs in the creditor edit form section above the timeline should also get `min-h-[44px]` added to their className.

- [ ] **Step 2: Commit**

```bash
git add apps/creditor-pipeline/components/CreditorSlideOver.tsx
git commit -m "feat(pipeline): timeline polish — collapsible add-comm form, vertical line, touch targets"
```

---

## Task 26: Creditor Pipeline — Animated StatsRow

**Files:**
- Modify: `apps/creditor-pipeline/components/StatsRow.tsx`

- [ ] **Step 1: Read and update pipeline StatsRow.tsx**

Read `apps/creditor-pipeline/components/StatsRow.tsx` first, then add `useCountUp` and stagger animations following the same pattern as the operations StatsRow in Task 19. Each stat card should use `useCountUp` for its value, `animate-fade-in-up` with stagger delays, and `p-4 md:p-6` / `text-2xl md:text-3xl` for responsive sizing.

- [ ] **Step 2: Commit**

```bash
git add apps/creditor-pipeline/components/StatsRow.tsx
git commit -m "feat(pipeline): animated StatsRow with count-up and stagger"
```

---

## Task 27: First-Visit Hints — All Apps

**Files:**
- Modify: `apps/financial-triage/components/DashboardClient.tsx`
- Modify: `apps/operations/app/page.tsx`
- Modify: `apps/creditor-pipeline/components/KanbanBoard.tsx`

- [ ] **Step 1: Add hint to financial-triage**

In `apps/financial-triage/components/DashboardClient.tsx`, import `FirstVisitHint` from `@rescue-ops/shared` and add it near the CreditorTable section. Wrap the CreditorTable container in a `relative` div and add:

```tsx
<div className="relative lg:col-span-3">
  <CreditorTable creditors={data.top10} pipelineUrl={pipelineUrl} />
  <FirstVisitHint
    storageKey="rescue-ops-triage-hints-seen"
    message="Tap a creditor to see their pipeline status"
  />
</div>
```

- [ ] **Step 2: Add hint to operations**

In `apps/operations/app/page.tsx`, import `FirstVisitHint` from `@rescue-ops/shared` and add it near the FAB on mobile. Wrap the FAB in a `relative` container:

```tsx
<div className="fixed bottom-20 right-4 z-40 md:hidden relative">
  <button ...>...</button>
  <FirstVisitHint
    storageKey="rescue-ops-ops-hints-seen"
    message="Tap + to create your first task"
    position="top"
  />
</div>
```

- [ ] **Step 3: Add hint to creditor-pipeline**

In `apps/creditor-pipeline/components/KanbanBoard.tsx`, import `FirstVisitHint` from `@rescue-ops/shared` and add it near the pill navigation:

```tsx
{/* Stage pills */}
<div className="relative">
  <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 md:hidden">
    ...pills...
  </div>
  <FirstVisitHint
    storageKey="rescue-ops-pipeline-hints-seen"
    message="Tap a stage to see its creditors"
  />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add apps/financial-triage/components/DashboardClient.tsx apps/operations/app/page.tsx apps/creditor-pipeline/components/KanbanBoard.tsx
git commit -m "feat: add first-visit hints to all three apps"
```

---

## Task 28: Loading Skeletons — Replace "Loading..." Text

**Files:**
- Modify: `apps/financial-triage/app/page.tsx`
- Modify: `apps/operations/app/page.tsx`
- Modify: `apps/creditor-pipeline/app/page.tsx`

- [ ] **Step 1: Update financial-triage page.tsx**

In `apps/financial-triage/app/page.tsx`, import `DashboardSkeleton` from `@rescue-ops/shared` and replace the loading state (likely a `"Loading..."` text or spinner) with `<DashboardSkeleton />`.

- [ ] **Step 2: Update operations page.tsx**

In `apps/operations/app/page.tsx`, replace the loading state with appropriate skeleton components. Import and use `MetricCardSkeleton`, `TableRowSkeleton` from `@rescue-ops/shared`:

```tsx
if (loading) {
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-48 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Update creditor-pipeline page.tsx**

Similar skeleton treatment for the pipeline loading state, using `MetricCardSkeleton` and `CardSkeleton`.

- [ ] **Step 4: Commit**

```bash
git add apps/financial-triage/app/page.tsx apps/operations/app/page.tsx apps/creditor-pipeline/app/page.tsx
git commit -m "feat: replace Loading text with skeleton placeholders in all apps"
```

---

## Task 29: Responsive Padding Adjustments

**Files:**
- Modify: `apps/financial-triage/app/page.tsx` (or `DashboardClient.tsx`)
- Modify: `apps/operations/app/page.tsx`
- Modify: `apps/creditor-pipeline/app/page.tsx`

- [ ] **Step 1: Adjust page container padding in all apps**

All three apps currently use `px-6 py-8` or similar for their main container. Update to `px-4 md:px-6 py-6 md:py-8` to reduce padding on mobile. Search each `page.tsx` for the main wrapper div (likely `max-w-7xl mx-auto px-6 py-8`) and change `px-6` to `px-4 md:px-6` and `py-8` to `py-6 md:py-8`.

- [ ] **Step 2: Commit**

```bash
git add apps/financial-triage/app/page.tsx apps/operations/app/page.tsx apps/creditor-pipeline/app/page.tsx
git commit -m "chore: responsive padding — tighter on mobile, standard on desktop"
```

---

## Task 30: Visual Verification

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` from the project root.

- [ ] **Step 2: Test each app at three widths**

Open each app in Chrome DevTools responsive mode:
- **375px** (iPhone SE) — verify cards, hamburger, bottom tab, FAB, collapsible kanban
- **768px** (iPad) — verify tablet transition layouts
- **1280px** (desktop) — verify nothing changed from original desktop layouts

Check each app:
1. `localhost:3001` (Financial Triage) — metric count-up, chart animations, creditor cards, skeleton
2. `localhost:3002` (Operations) — stats pulse, filter layout, task cards, FAB, empty state
3. `localhost:3003` (Creditor Pipeline) — kanban collapsible, pill nav, card touch targets, timeline

- [ ] **Step 3: Test bottom tab bar navigation**

Verify that:
- Tab bar shows on mobile (375px), hidden on desktop
- Active tab is highlighted in the correct accent color
- Tapping other tabs navigates (or shows disabled state if env vars absent)

- [ ] **Step 4: Test first-visit hints**

- Clear localStorage and reload each app
- Verify hints appear and auto-dismiss after 5 seconds
- Verify they don't appear on second visit

- [ ] **Step 5: Test reduced-motion**

In Chrome DevTools, enable "Prefers reduced motion" under Rendering.
Verify all animations are disabled — content appears immediately without motion.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: visual verification adjustments"
```
