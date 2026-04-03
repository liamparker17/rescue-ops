# Mobile UX & Responsive Polish — Design Spec

**Date:** 2026-04-03
**Scope:** All three rescue-ops apps (financial-triage, operations, creditor-pipeline)
**Goal:** Make all apps responsive and delightful on every screen size. A first-time visitor on any device should be impressed at a glance and find the apps usable if they explore deeper.

---

## 1. Shared Components & Utilities

### 1.1 Bottom Tab Bar

- **Location:** `packages/shared` — imported by all three apps
- **Behavior:** Fixed to bottom of viewport on screens below `md` (768px). Hidden on desktop.
- **Tabs:** Financial Triage (teal icon), Operations (amber icon), Creditor Pipeline (indigo icon)
- **Active state:** Highlighted with the current app's accent color
- **Transition:** Subtle scale + color CSS transition on tap
- **Spacing:** Tab bar height ~56px. All page content gets matching `pb-14` on mobile to prevent overlap.
- **URLs:** Uses the `NEXT_PUBLIC_*_URL` env vars already configured. Tabs with missing URLs render but are disabled (grayed, no link).

### 1.2 Loading Skeletons

- Replace all "Loading..." text strings across the three apps
- Pulsing gray rectangles matching the shape of content being loaded (metric cards, table rows, chart areas)
- Staggered pulse timing so skeletons shimmer in sequence
- Use Tailwind's `animate-pulse` with custom `animation-delay` inline styles

### 1.3 CSS Animation Utilities

Added to `packages/shared/styles/animations.css` and imported by each app's `globals.css`:

| Class | Effect | Duration |
|-------|--------|----------|
| `.animate-fade-in-up` | Fade in + translate 12px upward | 400ms ease-out |
| `.animate-scale-in` | Scale from 0.95 to 1 + fade in | 300ms ease-out |
| `.animate-slide-in-right` | Translate from 100% to 0 on X axis | 300ms ease-out |
| `.animate-count-up` | JS helper — counts number from 0 to target | ~800ms, eased |
| `.animate-border-grow` | Left border height grows top to bottom | 500ms ease-out |
| `.animate-pulse-twice` | Glow pulse, runs twice then stops | 600ms x 2 |

- Stagger applied via `animation-delay` inline styles (100ms between siblings)
- **All animations respect `prefers-reduced-motion: reduce`** — wrapped in a `@media` query that disables them

### 1.4 Shared Hamburger Menu Component

- Used by all three app headers below `md`
- Icon: three horizontal lines, transitions to X when open (CSS transform)
- Dropdown slides down with `max-height` transition
- Contains: cross-app links + any secondary header actions
- Click outside or press Escape to close

### 1.5 First-Visit Hints

- Tracked via `localStorage` key per app (e.g., `rescue-ops-triage-hints-seen`)
- Semi-transparent tooltip positioned near key interactive elements
- Small dismiss X button
- Auto-fade after 5 seconds if not dismissed
- Never shown again after dismissal
- Specific hints listed per app below

---

## 2. Financial Triage (port 3001, accent: teal)

### 2.1 Header

- **Desktop (>=md):** Unchanged — title left, cross-links + "Add Opening Balances" button right
- **Below md:** Title + badge left, hamburger icon right. Dropdown contains cross-links and "Add Opening Balances" button.

### 2.2 Hero Metrics (4 cards)

- **Grid:** Already responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) — no changes
- **New — count-up:** Numbers animate from 0 to value over ~800ms on first load
- **New — stagger:** Cards use `.animate-fade-in-up` with 100ms delay between each
- **New — border grow:** Colored left border animates top-to-bottom on load

### 2.3 Charts (SecurityChart + RunwayChart)

- **Grid:** Already stacks on mobile (`grid-cols-1 lg:grid-cols-2`) — no changes
- **New — scroll-triggered animation:** Charts animate when scrolled into view using an `IntersectionObserver`. Recharts' `isAnimationActive` is tied to visibility, not mount.
- **New — mobile height:** Increase from 220px to 260px below `md` so axis labels aren't cramped

### 2.4 Creditor Table

- **Desktop (>=md):** Unchanged table layout
- **Below md:** Each creditor becomes a stacked card:
  - Line 1: Creditor name (bold) + security badge (Secured/Preferent/Concurrent)
  - Line 2: Claim amount (formatted ZAR) + percentage of total
  - Full-width horizontal bar visualization below text
  - Cards stack vertically with `.animate-fade-in-up` stagger
  - Tapping a card still links to the pipeline app

### 2.5 Balance Sheet

- Already stacks well on mobile — add count-up and stagger treatment to summary cards

### 2.6 AddBalanceForm (inside SlideOver)

- **Desktop (>=md):** Keep 12-column grid layout
- **Below md:** Each entry row becomes a stacked mini-card:
  - Code, Name, Type, Balance, Date each on their own line within a bordered card
  - Delete button positioned top-right of the card
  - Vertical spacing between cards

### 2.7 SlideOver

- **Desktop (>=md):** Unchanged — slides from right, `max-w-md`
- **Below md:** Full-screen overlay with top bar (title + close X)
- Entrance: CSS `translateX(100%)` to `translateX(0)` transition (300ms)

### 2.8 First-Visit Hint

- "Tap a creditor to see their pipeline status" — positioned near the creditor table/card list

---

## 3. Operations Stabiliser (port 3002, accent: amber)

### 3.1 Header

- Same hamburger pattern as triage
- **"New Task" button** stays visible outside the hamburger on all screen sizes (primary action)
- **Below md:** "New Task" additionally appears as a floating action button (FAB):
  - Bottom-right corner, above the tab bar
  - Circular, amber accent background, white "+" icon
  - Subtle shadow + `.animate-scale-in` on page load
  - Header "New Task" button hidden below md to avoid duplication

### 3.2 Stats Row (4 cards)

- Already responsive — same count-up and stagger as triage
- **Critical count card:** When value > 0, `.animate-pulse-twice` red glow on load (pulses twice, then stops)

### 3.3 Filter Bar

- **Desktop (>=md):** Unchanged horizontal flex-wrap
- **Below md:**
  - Search input: full-width on top
  - Status + Priority dropdowns: side-by-side below search (`grid-cols-2`)
  - Filters fade in after stats row finishes staggering (~400ms delay)

### 3.4 Task Table

- **Desktop (>=md):** Unchanged table with all 7 columns
- **Below md:** Each task becomes a card:
  - Top line: task number (`OT-0001`) left, priority badge right
  - Middle: task title (full width, no truncation)
  - Small text below title: responsible party
  - Bottom line: status badge left, due date right (red text if overdue)
  - Print + edit icon buttons in card footer
  - Tap anywhere on card opens edit slide-over
  - Cards stagger in with `.animate-fade-in-up`
- **Filter transitions (all sizes):** When filters change, list fades out briefly (opacity 0.5, 150ms) then fades back with new results

### 3.5 TaskSlideOver (create/edit form)

- **Desktop (>=md):** Unchanged right-side slide-over
- **Below md:** Full-screen overlay
- Priority radio buttons become larger pill-shaped toggles on mobile (min-h 44px)
- All inputs get `min-h-[44px]` for touch targets

### 3.6 Empty State

- Replace plain "No tasks found" text with styled empty state:
  - Dashed border rounded box
  - If filters active: "No tasks match your filters" + "Clear filters" link
  - If no tasks exist: "No tasks yet — tap + to create one"

### 3.7 First-Visit Hint

- "Tap + to create your first task" — positioned near the FAB (mobile) or "New Task" button (desktop)

---

## 4. Creditor Pipeline (port 3003, accent: indigo)

### 4.1 Header

- Same hamburger pattern
- "Add Creditor" button stays visible outside hamburger (primary action)
- "Export PDF" moves inside hamburger menu on mobile (secondary)

### 4.2 Stats Row

- Same count-up and stagger treatment

### 4.3 Kanban Board

- **Desktop (>=lg):** Unchanged horizontal scroll with `w-72` columns

- **Below lg, above md (tablet):** Columns stack vertically as collapsible sections:
  - Each column becomes a section with a header bar: stage name, count badge, total ZAR
  - Tapping the header expands/collapses (`max-height` CSS transition)
  - First column starts expanded, rest collapsed
  - Chevron icon rotates on expand/collapse

- **Below md (mobile):** Same vertical stacking, plus:
  - Horizontal pill navigation at top (stage names as tappable pills)
  - Active pill gets indigo accent underline
  - Tapping a pill scrolls to that section below (`scrollIntoView` with smooth behavior)

### 4.4 Creditor Cards

- **Desktop:** Unchanged
- **Mobile:** Slightly larger padding (`p-4` instead of `p-3`), bigger tap targets on stage-move arrow buttons (min 44x44px)
- **New (all sizes):** When a creditor is moved to a new stage via arrow buttons:
  - Card briefly flashes accent color background (200ms)
  - Card fades out of current column
  - Card fades into new column with `.animate-fade-in-up`
- Voting status badges get `.animate-scale-in` on card load

### 4.5 CreditorSlideOver

- **Desktop (>=md):** Unchanged right-side panel
- **Below md:** Full-screen overlay
- **Communication timeline polish (all sizes):**
  - Left border line connecting timeline entries (vertical timeline visual)
  - Method badges get distinct colors: Email (blue), Phone (green), Meeting (amber), Letter (slate)
  - "Add Communication" collapsed by default with a "+" expand button to keep view clean
  - Expands with smooth `max-height` transition

### 4.6 First-Visit Hints

- **Mobile:** "Swipe between stages" near the pill navigation
- **Desktop:** "Use arrows to move creditors between stages" near the first creditor card

---

## 5. Touch & Interaction Standards (all apps)

| Element | Minimum Size | Notes |
|---------|-------------|-------|
| Buttons | 44x44px | Padding increase on mobile if needed |
| Form inputs | 44px height | `min-h-[44px]` |
| Table row tap targets | 48px height | Cards on mobile are naturally taller |
| Icon-only buttons | 44x44px | Increase padding around icon |
| Dropdown options | 44px height | Comfortable for finger selection |

- All interactive elements get visible focus states (ring) for accessibility
- Hover states on desktop, active/tap states on mobile (`:active` pseudo-class with subtle background change)

---

## 6. Animation Performance Rules

- All animations use `transform` and `opacity` only (GPU-composited, no layout thrashing)
- No animation exceeds 500ms (keeps UI feeling snappy)
- `will-change` applied sparingly and only during animation
- `prefers-reduced-motion: reduce` disables all animations — content appears immediately without motion
- Stagger delays never exceed 600ms total for a group (e.g., 6 cards x 100ms)

---

## 7. Dependencies

- **No new npm packages required** for the base implementation
- CSS animations and `IntersectionObserver` (native browser API) handle all motion
- Count-up animation is a small JS utility (~20 lines)
- If Kanban drag-and-drop is desired later, Framer Motion can be added — but it is out of scope for this spec

---

## 8. Files Changed (estimated)

### New files:
- `packages/shared/components/BottomTabBar.tsx`
- `packages/shared/components/HamburgerMenu.tsx`
- `packages/shared/components/LoadingSkeleton.tsx`
- `packages/shared/components/FirstVisitHint.tsx`
- `packages/shared/hooks/useCountUp.ts`
- `packages/shared/hooks/useInView.ts`
- `packages/shared/styles/animations.css`

### Modified files (per app — 3x):
- `app/layout.tsx` — import BottomTabBar, add animation CSS
- `app/page.tsx` — loading skeleton, stagger logic
- `app/globals.css` — animation keyframes (if not shared)
- `components/Header.tsx` — hamburger menu below md
- `components/SlideOver.tsx` — full-screen on mobile

### App-specific modifications:
- **Triage:** `CreditorTable.tsx` (card view), `AddBalanceForm.tsx` (stacked cards), `MetricCard.tsx` (count-up), `SecurityChart.tsx` + `RunwayChart.tsx` (scroll-triggered)
- **Operations:** `TaskTable.tsx` (card view), `FilterBar.tsx` (mobile layout), `StatsRow.tsx` (pulse), `TaskSlideOver.tsx` (touch sizing), new FAB component
- **Pipeline:** `KanbanBoard.tsx` (collapsible + pills), `CreditorCard.tsx` (move animation, padding), `CreditorSlideOver.tsx` (timeline polish)
