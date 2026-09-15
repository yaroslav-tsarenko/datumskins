import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { SheetNum } from "./Stamp";

/**
 * The section head.
 *
 * Revision B strips the drawing furniture back to one gesture: a small
 * blueprint-blue micro-label, the title in charcoal display type, and a short
 * blue rule beneath it. That rule is the brand thread — the same blue that
 * marks the active nav tab and draws the icon strokes.
 *
 * The sheet number is optional and demoted to muted charcoal; it appears only
 * where a section genuinely reads as a drawing (the hero, the item page, the
 * featured band), not above every grid of cards.
 */
export function SectionHead({
  sheet,
  rev,
  eyebrow,
  title,
  lede,
  action,
  rule = true,
  className,
}: {
  sheet?: number | string;
  rev?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  action?: React.ReactNode;
  /** The blue rule under the title. On by default — it is the brand thread. */
  rule?: boolean;
  className?: string;
}) {
  return (
    <div className={twMerge(clsx("w-full", className))}>
      {eyebrow || sheet !== undefined ? (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          {eyebrow ? <span className="label">{eyebrow}</span> : null}
          <SheetNum sheet={sheet} rev={rev} />
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <h2 className="section-title max-w-[22ch] text-balance">{title}</h2>
          {rule ? <span aria-hidden className="title-rule mt-4" /> : null}
        </div>
        {action ? <div className="pb-1">{action}</div> : null}
      </div>

      {lede ? (
        <p className="measure mt-5 text-[16px] leading-relaxed text-[color:var(--color-text-secondary)]">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
