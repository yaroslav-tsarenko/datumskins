import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

/**
 * Rarity as notation, not lighting.
 *
 * Revision B: a small labelled chip — a swatch of the grade's own Valve hue
 * beside the grade NAME in dark ink — plus a thin coloured rule under the
 * render. The raw hue only ever appears as a swatch or a rule; the name is
 * always carried by a darkened token so it passes contrast as type.
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

export function rarityInk(raw: string | null | undefined): string {
  if (!raw) return "var(--rarity-consumer)";
  return INK[raw.toLowerCase()] ?? raw;
}

/** Inline style bundle that drives `.rarity-rule`. */
export function rarityVars(raw: string | null | undefined): React.CSSProperties {
  return { ["--rarity" as string]: raw || "#b0c3d9" };
}

/** The thin coloured rule under a render that states its grade. */
export function RarityRule({ className }: { className?: string }) {
  return (
    <span aria-hidden className={twMerge(clsx("rarity-rule block h-[2px] w-full", className))} />
  );
}

/**
 * The rarity chip: a round swatch in the grade's hue, then the grade name in
 * the darkened grade ink. Small, labelled, legible — no glow, no fill.
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
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-2 py-1",
          "font-mono text-[12px] font-medium uppercase leading-none tracking-[0.1em]",
          className,
        ),
      )}
      title={showName ? undefined : `Rarity ${rarity}`}
    >
      <span
        aria-hidden
        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
        style={{ background: color || "#b0c3d9" }}
      />
      {showName ? (
        <span style={{ color: rarityInk(color) }}>{rarity}</span>
      ) : (
        <span className="sr-only">{rarity}</span>
      )}
    </span>
  );
}
