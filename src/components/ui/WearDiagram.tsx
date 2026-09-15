import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { EXTERIORS, exteriorMeta, type ExteriorCode } from "@/lib/skins/shared";

/**
 * The wear gauge — the float scale drawn as a real 0.00–1.00 axis.
 *
 * Revision B enlarges it and calms it: the FN/MW/FT/WW/BS zones are **soft
 * tinted fills** rather than 45° hatching (hatching shimmers and strains the
 * eye at gauge size), the axis text is charcoal rather than blue, and the
 * pointer is a thick 4px inspection-red bar you can actually find.
 *
 * The catalogue stores an exterior, not a per-item float, so the default
 * drawing brackets the zone's real range instead of inventing a decimal — and
 * says so in the caption rather than implying precision it does not have.
 */

const ZONE_INK: Record<string, string> = {
  FN: "var(--wear-fn)",
  MW: "var(--wear-mw)",
  FT: "var(--wear-ft)",
  WW: "var(--wear-ww)",
  BS: "var(--wear-bs)",
};

const ZONE_FILL: Record<string, string> = {
  FN: "var(--wear-fn-fill)",
  MW: "var(--wear-mw-fill)",
  FT: "var(--wear-ft-fill)",
  WW: "var(--wear-ww-fill)",
  BS: "var(--wear-bs-fill)",
};

/** The wear zone's own ink — for an exterior code shown outside the gauge. */
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
  /** Card size: shorter band, no tick scale. Labels still shown by default. */
  compact?: boolean;
  /** Force the zone labels on or off; off in compact, where FN and MW collide. */
  labels?: boolean;
}) {
  const meta = exteriorMeta(exterior);
  const showLabels = labels ?? !compact;
  const bandH = compact ? 12 : 22;
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
      {/* The zone band — soft tinted fills, the item's zone outlined. */}
      <div
        className="relative w-full overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-tertiary)]"
        style={{ height: bandH }}
      >
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
                ["--zone-fill" as string]: ZONE_FILL[e.code],
                ["--zone-ink" as string]: ZONE_INK[e.code],
              }}
            />
          );
        })}

        {/* The pointer at an exact float — thick enough to find at a glance. */}
        {clamped != null ? (
          <span
            aria-hidden
            className="absolute inset-y-0 rounded-[2px] bg-[color:var(--color-primary)]"
            style={{ left: `calc(${pct(clamped)} - 2px)`, width: 4 }}
          />
        ) : null}
      </div>

      {/* The axis, with extension ticks at every real zone boundary. */}
      {!compact ? (
        <div className="relative mt-1 h-[6px] w-full">
          {TICKS.map((f) => (
            <span
              key={f}
              aria-hidden
              className="absolute top-0 h-[5px] w-px bg-[color:var(--color-border-strong)]"
              style={{ left: f === 1 ? "calc(100% - 1px)" : pct(f) }}
            />
          ))}
        </div>
      ) : null}

      {/* Zone labels — charcoal, 12px, centred over their own extent. */}
      {showLabels ? (
        <div className={clsx("relative w-full", compact ? "mt-1.5 h-[13px]" : "mt-1 h-[14px]")}>
          {EXTERIORS.map((e) => (
            <span
              key={e.code}
              aria-hidden
              className={clsx(
                "absolute top-0 text-center font-mono text-[12px] leading-[13px] tracking-[0.08em]",
                e.code === exterior
                  ? "font-semibold text-[color:var(--color-text)]"
                  : "font-medium text-[color:var(--color-text-tertiary)]",
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
  /** Renders the value in the data face. Defaults to true. */
  mono?: boolean;
  /** Pulls the eye: the price row, the float row. */
  strong?: boolean;
}

/**
 * The title block — the component the whole identity hangs on.
 *
 * Revision B simplifies it into a clean white spec table: one blueprint-blue
 * header row, thin charcoal-tinted rules between rows, no vertical rules at
 * all, and generous cell padding so it reads like a spec card rather than a
 * cramped drawing corner. Labels are 12px mono; values are mono charcoal.
 */
export function TitleBlock({
  rows,
  caption,
  className,
  dense = false,
}: {
  rows: Array<TitleBlockRow | null | false | undefined>;
  /** The header strip — "SPECIFICATIONS", "ORDER". Rendered in blueprint blue. */
  caption?: string;
  className?: string;
  /** Slightly tighter rows, for a card-sized block. */
  dense?: boolean;
}) {
  const visible = rows.filter(Boolean) as TitleBlockRow[];
  if (!visible.length) return null;

  return (
    <div
      className={twMerge(
        clsx(
          "overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]",
          className,
        ),
      )}
    >
      {caption ? (
        <div className="bg-[color:var(--color-accent)] px-4 py-2">
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-accent-fg)]">
            {caption}
          </span>
        </div>
      ) : null}

      <dl className="m-0">
        {visible.map((r, i) => (
          <div
            key={r.label}
            className={clsx(
              "flex items-baseline justify-between gap-4",
              dense ? "px-3.5 py-2.5" : "px-4 py-3",
              i < visible.length - 1 && "border-b border-[color:var(--color-border)]",
            )}
          >
            <dt className="shrink-0 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[color:var(--color-text-tertiary)]">
              {r.label}
            </dt>
            <dd
              className={clsx(
                "min-w-0 break-words text-right",
                r.mono === false ? "font-sans" : "readout",
                r.strong
                  ? "text-[15px] font-semibold text-[color:var(--color-text)]"
                  : "text-[14px] text-[color:var(--color-text)]",
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
