# Datumskins

A CS2 skins store that treats every listing as a technical document. Live stock,
a stated exterior and float range, grade and trade status printed on the sheet,
paid for in the open and delivered to your Steam inventory as a trade offer.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 /
PostgreSQL · next-intl.

---

## Design — "Blueprint Works", revision B

The store is an engineering drawing room, but the blueprint is **seasoning, not
the meal**. Revision B keeps the character — title blocks, wear gauges, stamps,
callout leaders — and rests it on a calm, high-contrast white-and-charcoal
foundation you can browse for twenty minutes without your eyes tiring.

### The three rules that shape everything

1. **Everything you read is charcoal.** Body copy, headings, card titles and
   table content are `#22262E` on near-white. Blueprint blue never carries a
   sentence: it survives in uppercase micro-labels (12px minimum, weight 500),
   thin rules, icon strokes, the logo and hover accents.
2. **The grid appears in three places only.** `.drafting-field` — the hero
   backdrop, two section header bands, and the item-page render stage — at 3–4.5%
   opacity. Product grids, tables, forms and every reading surface sit on clean,
   grid-free paper.
3. **Leader lines are decoration.** They appear in the hero and on the item page,
   three at most, drawn once. **Every value a leader points at is also printed in
   the specification table below it.** Nothing important lives at the end of a
   thin line.

### Surfaces and spacing

- Base `#F8F8F5` (near-white, less yellow than revision A), cards pure `#FFFFFF`,
  and the vellum tint `#F1F1EC` reserved for thin divider bands only.
- Section and card padding are up about 25% on revision A; radii are softened to
  4 / 6 / 10 / 12 / 14px rather than the old 0–3px drafting corners.
- Ruled borders mostly gave way to whitespace and soft dividers. The double-rule
  frame survives only on featured "sheet" cards; registration marks only in the
  hero and as the footer flourish.
- Body type is Inter at 16px / 1.6 with editorial blocks capped at ~68ch.

### What survived, in usable form

| Motif | Where it lives | What changed |
| --- | --- | --- |
| **Title block** | `TitleBlock` in `components/ui/WearDiagram.tsx` | A clean white spec table: one blueprint-blue header row, thin rules between rows, no vertical rules, generous cell padding. Mono values, 12px mono labels. |
| **Wear gauge** | `WearDiagram` | Enlarged, with a 4px inspection-red pointer and charcoal axis text. Zones are **soft tinted fills** — the 45° hatching of revision A shimmered and strained the eye at gauge size. |
| **Stamps** | `Stamp` | Solid fills at one fixed 12px size with white type, tilted 2.5°. The distressed double edge is gone. **One stamp per card, maximum.** |
| **Callouts** | `Callout` | Hero and item page only, max three, drawn once — and always duplicated in the title block. |
| **Dimensioned word** | `Dimmed` | The word stays charcoal; only the ticked rule beneath it is blue, so no reading text is coloured. |
| **Rarity** | `RarityTag` / `RarityRule` | A small labelled chip (hue swatch + grade name in darkened grade ink) plus a 2px coloured rule under the render. Pale grades are mixed 18% toward the page ink so gold does not read as a highlighter. |
| **Blue thread** | tokens | Section-title underlines, the active nav rule, icon strokes, the logo, and hover accents — one consistent blue voice, no blue reading text. |

### Structure

- **Catalogue** defaults to the clean card grid. The **parts list** is an opt-in
  power-user toggle (`SihPartsTable`): 48px rows, 3% zebra, sticky header, six
  columns — designation, grade, exterior, float, price, action — with everything
  else behind a per-row expand. Below `md` it becomes stacked summary cards with
  the same expand.
- **Cards** are white and 10px-cornered, with a uniform grid-free render stage,
  the rarity chip and rule, a mini title block (exterior / float / price) and at
  most one stamp.
- **Homepage** alternates clean white sections with exactly three drawing
  moments — the hero, the wear band and the knives band — so the eye rests in
  between. Steps, notes and FAQ sit on plain backgrounds with simple numbered
  labels.
- **Navigation** is charcoal, with a blue double-rule on the active tab only.
  The mega-panel is a clean white sheet of ordinary link lists plus one featured
  tile carrying a single stamp.

### Typography

- **Space Grotesk** — headings and designations, in charcoal.
- **Inter** — all UI and body copy, 16px base, 1.6 line-height.
- **JetBrains Mono** — data values only: floats, prices, sheet numbers, labels.
  Tabular figures throughout. Mono never sets a sentence.

### Motion

Line-draw survives in the hero and the item-page callouts. Everywhere else:
staggered fade-ups, a gentle 3px card lift, and a stamp-press on CTAs, all in
160–220ms. `prefers-reduced-motion` renders everything pre-drawn and static,
including the leaders.

### Tokens and the contrast gate

All colour, radius, shadow, motion and type decisions live in
`src/styles/variables.css` and reach Tailwind through `@theme` in
`src/styles/globals.css`. Token **names** are stable, so re-skinning the whole
store — the admin panel included — is a change to one file.

Contrast is not asserted in a comment, it is measured:

```bash
node scripts/check-contrast.mjs
```

The script parses the real token values out of `variables.css` for both themes,
composites translucent tints over the surface they actually sit on, and runs the
WCAG 2.1 math on all 37 pairs the interface really produces — text, micro-labels,
CTAs, stamps, rarity names, wear codes and linework. It exits non-zero on any
failure, so it can gate CI. Current state: **every pair passes AA in both Studio
and Night Shift**, with text between 4.9:1 and 15.2:1, blue labels at 5.8–9.7:1,
white-on-red CTAs at 5.3:1, and graphics above 3:1.

### Night Shift

The dark theme is a deep neutral navy-charcoal `#151A24` with off-white
`#E8EBF2` text — less saturated than revision A's cyanotype, so it is
comfortable for an evening. The grid is barely visible, blue linework softens to
`#7C9BE8`, and the red CTAs are preserved.

---

## Honesty rules

The identity is built on stated facts, so the UI never manufactures any:

- No invented floats. The catalogue stores an exterior, not a per-item float, so
  wear diagrams bracket the real zone and say so rather than printing a decimal
  we do not have. The one exact float on the site is the one **you** set on the
  wear gauge.
- No fake countdowns. The only timer is bound to the catalogue's own
  `revalidate` window.
- No invented discounts. A markdown stamp appears only when a real Steam price
  delta exists.
- No fabricated popularity. The ranked schedule is "by price", because price is
  what we can actually verify.
- No testimonials, no invented review counts, no "1,200 happy customers".

---

## Getting started

```bash
npm install
cp .env.example .env     # fill in the values
npx prisma generate
npm run dev
```

The app runs at http://localhost:3000.

### Environment

Company and contact details are env-driven via `NEXT_PUBLIC_*` (see
`src/lib/brand.ts`), so a deploy can override them without touching components.

> **TODO before going live:** the transactional email sender is still pointing at
> the previously verified domain. Verify `datumskins.com` with the mail provider
> and update the `from` address.

### Scheduled jobs

`vercel.json` declares **no cron jobs** — a Vercel Hobby account allows at most
one run per day, and the SIH sync needs to run far more often than that. The
four endpoints still exist and are unchanged:

| Endpoint | What it does | Suggested cadence |
| --- | --- | --- |
| `/api/cron/sih-sync` | Pulls the live catalogue | every 2 min |
| `/api/cron/sih-poll` | Advances in-flight trade offers | every 1 min |
| `/api/cron/sih-monitor` | Health/alerting check | hourly |
| `/api/cron/sih-reconcile` | Reconciles orders against the provider | daily |

Each is protected by `CRON_SECRET` (see `src/lib/cron-auth.ts`), so drive them
from any external scheduler — cron-job.org, GitHub Actions, an Upstash QStash
schedule, or a box you already own:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/sih-sync
```

On a Vercel Pro plan you can move them back into `vercel.json` under `"crons"`.

---

## Accessibility

- WCAG AA contrast on every pair the interface produces, verified by
  `scripts/check-contrast.mjs` rather than by eye.
- Visible keyboard focus everywhere via `.focus-amber` (a blueprint-blue ring;
  the class name is kept stable from the previous token set).
- Semantic landmarks, real `<dl>`/`<ol>`/`<table>` structures for the title
  blocks and lists, and `aria-label`s on every graphic that carries meaning (the
  wear gauge announces its zone and float range).
- `prefers-reduced-motion` is honoured globally: card lifts, leader draw-ins and
  the rotating header notation all stop, and the leaders render already drawn
  rather than replaying fast.
- The parts-list table is a real `<table>` with a caption, scoped column headers
  and per-row expand buttons that report `aria-expanded`; it collapses to stacked
  cards below `md`.
