import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { SheetNum, DimLine } from "./Stamp";

/**
 * The drawing label that opens a section: a ruled extent, the sheet number and
 * a wide-tracked label sitting on it, then the title in blueprint ink. The
 * right-hand slot takes the section's own action so heading and action share
 * one baseline instead of stacking into a centred block.
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
  rule?: boolean;
  className?: string;
}) {
  return (
    <div className={twMerge(clsx("w-full", className))}>
      {rule ? <DimLine /> : null}

      {sheet !== undefined || eyebrow ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <SheetNum sheet={sheet} rev={rev} />
          {eyebrow ? <span className="label">{eyebrow}</span> : null}
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h2 className="section-title max-w-[22ch] text-balance">{title}</h2>
        {action ? <div className="pb-1">{action}</div> : null}
      </div>

      {lede ? (
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-[color:var(--color-text-secondary)]">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
