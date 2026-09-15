import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

/**
 * A callout — a dot at the datum, a thin leader out to a shoulder, and a short
 * note sitting on it.
 *
 * Revision B demotes this to what it always should have been: **decoration**.
 * It appears only in the hero and on the item page, at most three to a view,
 * it draws itself in once on mount and then stays put, and — the rule that
 * matters — every value it points at is ALSO printed in the title block below.
 * Nothing important is allowed to live at the end of a thin line.
 *
 * The note is charcoal at 12px, not blue, because it is still text.
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
      aria-hidden
      className={twMerge(
        clsx(
          "pointer-events-none inline-flex select-none items-start gap-1.5",
          side === "left" && "flex-row-reverse",
          className,
        ),
      )}
    >
      <svg
        viewBox="0 0 64 28"
        className={twMerge(clsx("h-7 w-16 shrink-0 overflow-visible", lineClassName))}
        fill="none"
      >
        <circle cx={side === "right" ? 2 : 62} cy="26" r="2.5" fill="var(--color-accent)" />
        <path d={path} className="leader" style={{ ["--leader-len" as string]: 110 }} />
      </svg>
      <span className="-mt-1 whitespace-nowrap font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[color:var(--color-text-secondary)]">
        {children}
      </span>
    </span>
  );
}
