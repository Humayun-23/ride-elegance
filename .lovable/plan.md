
# RentalOS UI/UX Improvement Plan

Goal: turn the current functional-but-flat dashboard into a fast, dense, opinionated counter-staff tool — POS/Linear/Stripe energy, not generic admin SaaS. Keep all routes, API calls, and data shapes intact. Branch: `rentalos-ui-improvement`.

## Brand palette (locked)

Base colors come from your brand sheet:

- **Emerald** `#3bb881` — single accent. Active nav, primary buttons, focus rings, success state.
- **Ink** `#010101` — primary text, sidebar rail, table headers, high-contrast surfaces.
- **Paper** `#ffffff` — base canvas.

Complements derived from these (used sparingly, as semantic tones only):

- **Emerald tints** `#e8f7f0` / `#c7ebd9` — selected rows, soft success backgrounds.
- **Emerald deep** `#1f8a5c` — hover/pressed for primary.
- **Ink tints** (warm neutral scale): `#f6f6f5`, `#ececea`, `#d6d6d3`, `#9a9a96`, `#525250`, `#2a2a29` — borders, dividers, muted text, hover surfaces.
- **Coral** `#e26d5c` (red-orange, emerald's split-complement) — overdue, danger, unpaid balance.
- **Amber** `#e0a23a` — warnings, "due today", pending payment.
- **Slate-blue** `#3a6ea8` — informational badges (confirmed, scheduled).

Everything else stays inside that set — no purples, no teal-as-everything, no gradients.

## Problems in the current build

- **Visual identity is generic.** Teal-on-white, Inter, equal-weight cards. Indistinguishable from any shadcn starter.
- **Low data density.** Dashboard shows 3 stat cards + 5 recent bookings on a full HD screen.
- **Topbar wastes prime real estate.** No global search, no quick-create, no shift context.
- **Sidebar wastes vertical space** on a "Need help?" card and has no collapse.
- **No keyboard-first affordances.** No `⌘K`, no shortcut chips.
- **Booking list is a vertical stack of cards** — hard to scan across many rows.
- **Status, balance, overdue all look the same** — no urgency hierarchy.
- **Mobile** feels like a shrunk desktop, not a counter tool.

## Design direction

- **Type:** JetBrains Mono for numerics/IDs/amounts (already installed), Inter for prose, heavier display weight for section headers. Tabular numerals everywhere money or counts appear.
- **Color:** Brand palette above. Ink #010101 sidebar on desktop (POS feel), white working canvas, emerald reserved for action + active state, coral/amber only for status hierarchy.
- **Density:** 13px base in tables, 14px in forms, 12px in meta. 8px row padding. Hairline dividers over cards.
- **Depth:** Almost flat. Single shadow level for popovers only.
- **Motion:** 120ms color transitions on hover/focus. Optimistic UI on actions.

All tokens land in `src/index.css` under the existing `.rentalos` scope so the public GoPanda app is untouched.

## Phased rollout

### Phase 1 — Shell & tokens
- Rewrite `.rentalos` token block in `index.css` with the locked palette above.
- **Sidebar:** ink #010101 background, emerald active pill, collapsible to a 56px icon rail, shop name + role at top, keyboard hints (`G then D`, `G then B`), drop help card, add compact user footer with logout.
- **Topbar:** breadcrumb + page title left; center-mounted global `⌘K` command bar (customer phone, booking #, vehicle); right cluster: "New booking" emerald button, shop switcher popover, notifications, live date/time clock for shift awareness.
- **Command palette** (`⌘K` / `Ctrl+K`) using shadcn `command`: jump to routes, search customer by phone, open booking by ID, "New walk-in" action.

### Phase 2 — Command Center dashboard
- **Top metric strip:** 5 dense KPIs in one row (Active, Due today, Overdue, Outstanding ₹, Today's revenue) — no icon boxes, just label + big tabular number + delta vs yesterday.
- **Three-pane working area** on desktop, stacked on mobile:
  - Left: **Today's timeline** — vertical list of pickups + returns grouped by hour, overdue pinned top in coral.
  - Middle: **Active trips table** — dense rows, customer / vehicle / end time / balance / quick actions. Sticky header, sortable.
  - Right: **Quick actions + needs-attention feed** (overdue, unpaid balance, missing documents).
- Auto-refresh every 30s with subtle pulse on metric strip.

### Phase 3 — Bookings, Vehicles, Customers polish
- Convert `BookingsList` to a real shadcn `Table` with sortable columns, status pill column, right-aligned tabular-num balance column, row click → existing `BookingWorkflow` drawer.
- Status tabs (`All · Active · Due today · Overdue · Completed`) with counts.
- `VehiclesPage`: compact tile grid with availability dot + next-free time; bulk maintenance toggle for owners.
- `CustomersPage`: phone-first auto-formatting search, history table with flag badges, inline "create walk-in".

### Phase 4 — Mobile counter mode
- Bottom tab bar (Dashboard · Bookings · New · Customers · More) replacing sidebar.
- Sticky bottom action bar on booking detail (Call · Payment · Complete).
- Touch targets ≥ 44px, swipe-to-complete on active trip rows.

## What stays untouched

- All routes under `/rentalos/*` and the `RentalOSLayout` context shape.
- All API calls in `rentalosService.ts` and every field name in `types.ts`.
- Public GoPanda app — scoped CSS keeps it isolated.
- Auth, roles, shop selection logic.

Reply "go" and I'll start Phase 1 (tokens + shell + command palette) on `rentalos-ui-improvement`. Or tell me to reorder/skip a phase.
