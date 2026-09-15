#!/usr/bin/env node
/**
 * Contrast gate for the Blueprint Works token set.
 *
 * Reads the real hex values out of `src/styles/variables.css` — both the light
 * (`:root`) and Night Shift (`[data-theme="dark"]`) blocks — and runs the WCAG
 * 2.1 relative-luminance math on every pair the design actually puts on screen.
 * It is not a list of numbers someone typed into a comment: change a token and
 * this tells you the truth on the next run.
 *
 *   node scripts/check-contrast.mjs
 *
 * Exits non-zero if any pair falls under its threshold, so it can gate CI.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = resolvePath(here, "../src/styles/variables.css");
const css = readFileSync(cssPath, "utf8");

/* ── Token extraction ────────────────────────────────────────────────── */

function block(startPattern) {
  const start = css.indexOf(startPattern);
  if (start === -1) throw new Error(`Could not find "${startPattern}" in variables.css`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  return css.slice(open, close);
}

/** Every declaration in a block, hex or otherwise, in source order. */
function tokens(source) {
  const out = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(source))) out[m[1]] = m[2].trim();
  return out;
}

const lightRaw = tokens(block(":root {"));
// A token the dark block redefines must NOT fall through to its light value —
// that is exactly how a theme regression hides from a checker.
const darkRaw = { ...lightRaw, ...tokens(block('[data-theme="dark"],')) };

/**
 * Resolve a token to a flat sRGB triple. Alpha tints (the dark theme states
 * most of its tints as rgba) are composited over the surface they actually
 * sit on, so they are measured as they render rather than skipped.
 */
function resolveColor(set, token, overToken) {
  const raw = set[token];
  if (!raw) return null;
  const hex = raw.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hex) return toRgb(raw);
  const rgba = raw.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/);
  if (!rgba) return null;
  const [, r, g, b, a] = rgba;
  const alpha = a === undefined ? 1 : Number(a);
  const over = overToken ? resolveColor(set, overToken) : null;
  if (!over && alpha < 1) return null;
  const mix = (c, o) => Math.round(Number(c) * alpha + o * (1 - alpha));
  return alpha === 1
    ? [Number(r), Number(g), Number(b)]
    : [mix(r, over[0]), mix(g, over[1]), mix(b, over[2])];
}

function toRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function show(rgb) {
  return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

/* ── WCAG 2.1 relative luminance ─────────────────────────────────────── */

function luminance([r, g, b]) {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/*
 * The pairs below are the ones the interface really produces. Thresholds:
 *   4.5  normal-size text (everything here is <= 18px, so nothing gets the
 *        large-text exemption — micro-labels are 12px)
 *   3.0  a meaningful graphic: decorative linework, the gauge pointer
 */
const PAIRS = [
  // Reading text
  ["text on paper", "--color-text", "--color-bg", 4.5],
  ["text on card", "--color-text", "--color-bg-elevated", 4.5],
  ["text on vellum band", "--color-text", "--color-bg-secondary", 4.5],
  ["secondary text on paper", "--color-text-secondary", "--color-bg", 4.5],
  ["secondary text on card", "--color-text-secondary", "--color-bg-elevated", 4.5],
  ["tertiary text on paper", "--color-text-tertiary", "--color-bg", 4.5],
  ["tertiary text on card", "--color-text-tertiary", "--color-bg-elevated", 4.5],

  // Blueprint blue, only ever at micro-label size
  ["blue label on paper", "--color-accent", "--color-bg", 4.5],
  ["blue label on card", "--color-accent", "--color-bg-elevated", 4.5],
  ["blue label on its own tint", "--color-accent", "--color-accent-tint", 4.5],
  ["type on blue fill", "--color-accent-fg", "--color-accent", 4.5],

  // The one loud colour
  ["white on red CTA", "--color-primary-fg", "--color-primary-strong", 4.5],
  ["white on red CTA hover", "--color-primary-fg", "--color-primary-hover", 4.5],
  ["red text on card", "--color-danger", "--color-bg-elevated", 4.5],
  ["red text on red tint", "--color-danger", "--color-danger-light", 4.5],

  // Stamps — solid fills carrying white type
  ["white on inspection stamp", "--color-primary-fg", "--stamp-inspection-bg", 4.5],
  ["white on approve stamp", "--color-primary-fg", "--stamp-approve-bg", 4.5],
  ["white on hold stamp", "--color-primary-fg", "--stamp-hold-bg", 4.5],
  ["inspection stamp vs card", "--stamp-inspection-bg", "--color-bg-elevated", 3.0],
  ["approve stamp vs card", "--stamp-approve-bg", "--color-bg-elevated", 3.0],
  ["hold stamp vs card", "--stamp-hold-bg", "--color-bg-elevated", 3.0],
  ["success text on its tint", "--color-success", "--color-success-light", 4.5],
  ["warning text on its tint", "--color-warning", "--color-warning-light", 4.5],

  // Rarity names, carried by the darkened grade tokens on a white card
  ["rarity consumer", "--rarity-consumer", "--color-bg-elevated", 4.5],
  ["rarity industrial", "--rarity-industrial", "--color-bg-elevated", 4.5],
  ["rarity mil-spec", "--rarity-milspec", "--color-bg-elevated", 4.5],
  ["rarity restricted", "--rarity-restricted", "--color-bg-elevated", 4.5],
  ["rarity classified", "--rarity-classified", "--color-bg-elevated", 4.5],
  ["rarity covert", "--rarity-covert", "--color-bg-elevated", 4.5],
  ["rarity gold", "--rarity-gold", "--color-bg-elevated", 4.5],
  ["rarity contraband", "--rarity-contraband", "--color-bg-elevated", 4.5],

  // Exterior codes shown outside the gauge
  ["wear FN code", "--wear-fn", "--color-bg-elevated", 4.5],
  ["wear MW code", "--wear-mw", "--color-bg-elevated", 4.5],
  ["wear FT code", "--wear-ft", "--color-bg-elevated", 4.5],
  ["wear WW code", "--wear-ww", "--color-bg-elevated", 4.5],
  ["wear BS code", "--wear-bs", "--color-bg-elevated", 4.5],

  // Graphics
  ["leader linework", "--color-blueprint-soft", "--color-bg", 3.0],
  ["gauge pointer", "--color-primary", "--color-bg-tertiary", 3.0],
];

function run(label, set) {
  console.log(`\n${label}`);
  console.log("-".repeat(label.length));
  let failures = 0;
  let unresolved = 0;
  for (const [name, fgToken, bgToken, min] of PAIRS) {
    // A translucent background composites over the card; a translucent
    // foreground composites over its own background.
    const bg = resolveColor(set, bgToken, "--color-bg-elevated");
    const fg = resolveColor(set, fgToken, bgToken);
    if (!fg || !bg) {
      unresolved += 1;
      console.log(`  ????            ${name} (could not resolve ${!fg ? fgToken : bgToken})`);
      continue;
    }
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "pass" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${name}  ${show(fg)} on ${show(bg)}`,
    );
  }
  if (unresolved) failures += unresolved;
  return failures;
}

const failed = run("Studio (light)", lightRaw) + run("Night Shift (dark)", darkRaw);

console.log(`\n${failed === 0 ? "All pairs pass WCAG AA." : `${failed} pair(s) below threshold.`}`);
process.exit(failed === 0 ? 0 : 1);
