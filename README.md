# Datumskins

A CS2 skins store that treats every listing as a technical document. Live stock,
a stated exterior and float range, grade and trade status printed on the sheet,
paid for in the open and delivered to your Steam inventory as a trade offer.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 /
PostgreSQL · next-intl.

---

## Design — "Blueprint Works"

The store is an engineering drawing room. Every skin already carries real
measured data — float value, wear zone, paint seed, grade — so the interface
presents it the way a drawing office would rather than the way a marketplace
usually does.

- **Drafting paper, not a dark void.** The canvas is `#F6F5F0` carrying a faint
  millimetre grid, drawn as layered gradients on `body` so every band inherits it.
- **Blueprint ink is the voice.** Headings, linework and labels are `#1D3F8F`.
  Long-form copy is drafting charcoal `#232830`. Nothing is pure black.
- **Inspection red is the only loud colour.** `#D6382E` for stamps and marks,
  `#C22C22` for fills carrying white type so buttons clear WCAG AA at body size.
  One decisive action per view.
- **Structure is drawn, not shaded.** 1px hairlines, double-rule frames on
  featured sheets, a 2px paper-lift on hover. There are no ambient shadows, no
  glass, no gradients outside the wear scale.
- **Ruled, not rounded.** Radii run 0–3px. The legacy `rounded-full` utility is
  squared off globally so no surface reverts to pills.
- **Night Shift** is a first-class inversion: cyanotype navy `#122448` with pale
  `#D9E6FF` linework, the grid still faintly visible and the stamps still red.

### The motifs

| Motif | Where it lives |
| --- | --- |
| **Title block** | `TitleBlock` in `components/ui/WearDiagram.tsx` — the flagship. A bordered table of ruled cells listing what the drawing *is*: designation, exterior, float range, grade, seed, stock, price. |
| **Wear diagram** | `WearDiagram` — the float scale drawn as a real axis with hatched FN/MW/FT/WW/BS zones, ticks at the true boundaries (0, .07, .15, .38, .45, 1) and a red pointer when an exact float exists. |
| **Inspection stamps** | `Stamp` — double-ruled, wide-tracked, rotated ±3°. Rationed to two per sheet and only ever literally true. |
| **Callout leaders** | `Callout` — a dot at the datum, a rule out to the note, drawn in on hover (and simply already drawn under reduced motion). |
| **Dimensioned word** | `Dimmed` — the marker move. Where a louder brand highlights a word, this one measures it. |
| **Registration marks / sheet numbers** | `.reg-marks`, `SheetNum` — crop corners and `SHT 04 / REV B` references. |
| **Hatching** | `.hatch` — 45° section lines behind empty states and unissued fields. |
| **Rarity as notation** | `RarityTag` / `RarityRule` — a boxed index letter A–H in the grade's own Valve hue plus a thin rule under the render. Rarity is never a glow. |
| **Cyanotype plate** | `.cyanotype` — the footer and the knives band, printed the classic way round. |

### Typography

- **Space Grotesk** — engineering grotesk: headings, designations, section titles.
- **Inter** — drafting body copy.
- **JetBrains Mono** — every annotation and readout: floats, prices, sheet
  numbers, labels. Tabular figures throughout.

### Tokens

All colour, radius, shadow, motion and type decisions live in
`src/styles/variables.css` and are exposed to Tailwind through `@theme` in
`src/styles/globals.css`. Token **names** are stable, so re-skinning the whole
store — the admin panel included — is a change to one file, not a sweep through
components.

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

---

## Accessibility

- WCAG AA contrast on body text and on every fill that carries type.
- Visible keyboard focus everywhere via `.focus-amber` (an inspection-red
  bracket, name kept stable from the previous token set).
- Semantic landmarks, real `<dl>`/`<ol>`/`<table>` structures for the title
  blocks and schedules, and `aria-label`s on every SVG that carries meaning.
- `prefers-reduced-motion` is honoured globally: card lifts, tickers, leader
  draw-ins and the rotating header notation all stop.
