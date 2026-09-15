import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

/**
 * Rarity is notation here, not lighting: an index chip in the title block and
 * a thin ruled line under the render. The raw Valve hue draws the rule and the
 * chip's index square; the darkened token carries the NAME as type so it stays
 * legible on drafting paper.
 */

const INK: Record<string, string> = {
  "#b0c3d9": "var(--rarity-consumer)",
  "#5e98d9": "var(--rarity-industrial)",
  "#4b69ff": "var(--rarity-milspec)",
  "#8847ff": "var(--rarity-restricted)",
  "#d32ce6": "var(--rarity-classified)",
  "#eb4b4b": "var(--rarity-covert)",
  "#ffd700": "var(--rarity-gold)",
  "#e4ae39": "var(--rarity-contraband)",
};

/** Drawing-style index letters, in the CS2 grade order. */
const INDEX: Record<string, string> = {
  "Consumer Grade": "A",
  "Industrial Grade": "B",
  "Mil-Spec Grade": "C",
  Restricted: "D",
  Classified: "E",
  Covert: "F",
  Extraordinary: "G",
  Contraband: "H",
};

export function rarityInk(raw: string | null | undefined): string {
  if (!raw) return "var(--rarity-consumer)";
  return INK[raw.toLowerCase()] ?? raw;
}

/** Inline style bundle that drives `.rarity-rule`. */
export function rarityVars(raw: string | null | undefined): React.CSSProperties {
  return { ["--rarity" as string]: raw || "#b0c3d9" };
}

/** The thin ruled line under a render that states its grade. */
export function RarityRule({ className }: { className?: string }) {
  return <span aria-hidden className={twMerge(clsx("rarity-rule block h-[2px] w-full", className))} />;
}

/**
 * The rarity index chip: a boxed index letter in the grade's own hue, then
 * the grade name. Reads like a legend entry on a drawing.
 */
export function RarityTag({
  rarity,
  color,
  className,
  showName = true,
}: {
  rarity: string | null;
  color: string | null | undefined;
  className?: string;
  showName?: boolean;
}) {
  if (!rarity) return null;
  const idx = INDEX[rarity] ?? "—";
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-stretch border border-[color:var(--color-border)] font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.14em]",
          className,
        ),
      )}
      title={`Rarity ${rarity}`}
    >
      <span
        aria-hidden
        className="grid w-[1.4em] place-items-center border-r border-[color:var(--color-border)] py-1 text-[color:var(--color-text-inverse)]"
        style={{ background: color || "#b0c3d9", color: "#1A1D24" }}
      >
        {idx}
      </span>
      {showName ? (
        <span className="px-1.5 py-1" style={{ color: rarityInk(color) }}>
          {rarity}
        </span>
      ) : null}
    </span>
  );
}
