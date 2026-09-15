import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { EXTERIORS, exteriorMeta, type ExteriorCode } from "@/lib/skins/shared";

/**
 * The wear diagram — the float scale drawn as a proper engineering axis.
 *
 * A ruled 0.00–1.00 extent with the FN/MW/FT/WW/BS zones hatched and labelled,
 * the item's own zone boxed, and — when a true float is known — a pointer at
 * the exact value.
 *
 * Drawn with CSS boxes rather than a stretched SVG on purpose: a diagram this
 * wide and this short would shear its 45° hatching and its labels out of shape
 * if it were scaled, and a drawing that lies about its own angles is not worth
 * printing.
 *
 * The catalogue stores an exterior, not a per-item float, so the default
 * drawing annotates the zone's real range rather than inventing a decimal.
 */

const ZONE_INK: Record<string, string> = {
  FN: "var(--wear-fn)",
  MW: "var(--wear-mw)",
  FT: "var(--wear-ft)",
  WW: "var(--wear-ww)",
  BS: "var(--wear-bs)",
};

/** The wear zone's own ink — for an exterior code shown outside the diagram. */
export function wearInk(code: string | null | undefined): string {
  if (!code) return "var(--color-text-secondary)";
  return ZONE_INK[code] ?? "var(--color-text-secondary)";
}

const TICKS = [0, 0.07, 0.15, 0.38, 0.45, 1];

export function WearDiagram({
  exterior,
  value,
  className,
  compact = false,
  labels,
}: {
  exterior: ExteriorCode;
  /** Exact float, when the source provides one. */
  value?: number | null;
  className?: string;
  /** Drops the zone labels — for dense rows. */
  compact?: boolean;
  /** Force the zone labels on or off; defaults to on unless `compact`. */
  labels?: boolean;
}) {
  const meta = exteriorMeta(exterior);
  const showLabels = labels ?? !compact;
  const bandH = compact ? 7 : 10;
  const pct = (f: number) => `${f * 100}%`;
  const clamped = value != null ? Math.min(1, Math.max(0, value)) : null;

  const label =
    value != null
      ? `Float ${value.toFixed(4)}`
      : meta
        ? `Wear zone ${meta.label}, float ${meta.floatMin.toFixed(2)} to ${meta.floatMax.toFixed(2)}`
        : "Wear unknown";

  return (
    <div className={twMerge(clsx("w-full select-none", className))} role="img" aria-label={label}>
      {/* The zone band — each zone hatched in its own wear ink, the item's boxed. */}
      <div className="relative w-full" style={{ height: bandH }}>
        {EXTERIORS.map((e) => {
          const isItem = e.code === exterior;
          return (
            <span
              key={e.code}
              aria-hidden
              className={clsx("wear-zone absolute inset-y-0", isItem && "wear-zone-active")}
              style={{
                left: pct(e.floatMin),
                width: pct(e.floatMax - e.floatMin),
                ["--zone" as string]: ZONE_INK[e.code],
                opacity: isItem ? 1 : 0.3,
              }}
            />
          );
        })}

        {/* The pointer at an exact float. */}
        {clamped != null ? (
          <span
            aria-hidden
            className="absolute bg-[color:var(--color-primary)]"
            style={{
              left: `calc(${pct(clamped)} - 1px)`,
              width: 2,
              top: -4,
              bottom: -4,
            }}
          />
        ) : null}
      </div>

      {/* The axis, with extension ticks at every real zone boundary. */}
      <div className="relative h-[5px] w-full border-t border-[color:var(--color-blueprint-soft)]">
        {TICKS.map((f) => (
          <span
            key={f}
            aria-hidden
            className="absolute top-0 h-[4px] w-px bg-[color:var(--color-blueprint-soft)]"
            style={{ left: f === 1 ? "calc(100% - 1px)" : pct(f) }}
          />
        ))}
      </div>

      {/* Zone labels, each centred over its own extent. */}
      {showLabels ? (
        <div className="relative mt-[3px] h-[10px] w-full">
          {EXTERIORS.map((e) => (
            <span
              key={e.code}
              aria-hidden
              className={clsx(
                "absolute top-0 text-center font-mono text-[8px] font-semibold leading-[10px] tracking-[0.1em]",
                e.code === exterior
                  ? "text-[color:var(--color-text-secondary)]"
                  : "text-[color:var(--color-text-tertiary)] opacity-70",
              )}
              style={{ left: pct(e.floatMin), width: pct(e.floatMax - e.floatMin) }}
            >
              {e.short}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export interface TitleBlockRow {
  label: string;
  value: React.ReactNode;
  /** Renders the value in the drawing's annotation face. */
  mono?: boolean;
  /** Pulls the eye: the price row, the float row. */
  strong?: boolean;
}

/**
 * The title block — the flagship component of the identity.
 *
 * Every sheet in a drawing set carries one: a bordered table of ruled cells in
 * the corner listing what the drawing IS. Here it lists what the skin is —
 * designation, exterior, float, seed, rarity, price — in mono, one fact per
 * ruled row. This is the brand.
 */
export function TitleBlock({
  rows,
  caption,
  className,
  dense = false,
}: {
  rows: Array<TitleBlockRow | null | false | undefined>;
  /** The strip across the head of the block — "SPECIFICATIONS", "ORDER". */
  caption?: string;
  className?: string;
  dense?: boolean;
}) {
  const visible = rows.filter(Boolean) as TitleBlockRow[];
  if (!visible.length) return null;

  return (
    <div
      className={twMerge(
        clsx("border border-[color:var(--color-accent)] bg-[color:var(--color-bg-elevated)]", className),
      )}
    >
      {caption ? (
        <div className="border-b border-[color:var(--color-accent)] bg-[color:var(--color-accent-tint)] px-2 py-1">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            {caption}
          </span>
        </div>
      ) : null}

      <dl className="m-0">
        {visible.map((r, i) => (
          <div
            key={r.label}
            className={clsx(
              "grid grid-cols-[minmax(5.5rem,auto)_1fr] items-baseline",
              i < visible.length - 1 && "border-b border-[color:var(--color-border)]",
            )}
          >
            <dt
              className={clsx(
                "border-r border-[color:var(--color-border)] px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]",
                dense ? "py-1" : "py-1.5",
              )}
            >
              {r.label}
            </dt>
            <dd
              className={clsx(
                "min-w-0 break-words px-2 text-right",
                dense ? "py-1" : "py-1.5",
                r.mono === false ? "" : "readout",
                r.strong
                  ? "text-[13px] font-semibold text-[color:var(--color-text)]"
                  : "text-[11.5px] text-[color:var(--color-text)]",
              )}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
