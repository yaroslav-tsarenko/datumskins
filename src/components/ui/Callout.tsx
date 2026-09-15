import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

/**
 * A callout — the leader line that connects a point on the drawing to its
 * annotation: a dot at the datum, a thin rule out to a horizontal shoulder,
 * and the note sitting on the shoulder.
 *
 * The leader is drawn by default — a drawing does not hide its own linework —
 * and redraws itself when the parent (marked `group`) is hovered.
 */
export function Callout({
  children,
  side = "right",
  className,
  lineClassName,
}: {
  children: React.ReactNode;
  /** Which way the leader runs out from the datum. */
  side?: "left" | "right";
  className?: string;
  lineClassName?: string;
}) {
  const path = side === "right" ? "M2 26 L26 4 L64 4" : "M62 26 L38 4 L0 4";
  return (
    <span
      className={twMerge(
        clsx("pointer-events-none inline-flex items-start gap-1", side === "left" && "flex-row-reverse", className),
      )}
    >
      <svg
        viewBox="0 0 64 28"
        className={twMerge(clsx("h-7 w-16 shrink-0 overflow-visible", lineClassName))}
        aria-hidden
        fill="none"
      >
        <circle cx={side === "right" ? 2 : 62} cy="26" r="2" fill="var(--color-blueprint-soft)" />
        <path d={path} className="leader leader-shown" style={{ ["--leader-len" as string]: 110 }} />
      </svg>
      <span className="readout -mt-0.5 whitespace-nowrap text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)]">
        {children}
      </span>
    </span>
  );
}
