"use client";

import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export interface NotationEntry {
  label: string;
  value?: string;
}

/**
 * The notation strip — the numbered notes that run down the margin of a
 * drawing sheet, shown one at a time in the vellum band above the header.
 *
 * A drawing's notes do not scroll past you, so this is a rotation rather than
 * a marquee: NOTE 01, NOTE 02… each held for six seconds and swapped with a
 * short cross-fade. Readers who ask for reduced motion get the first note
 * fixed in place and the rest available to assistive tech, with nothing
 * moving at all.
 *
 * Renders nothing when there is nothing real to say.
 */
export function Notation({
  entries,
  className,
  intervalMs = 6000,
}: {
  entries: NotationEntry[];
  className?: string;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const paused = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced || entries.length < 2) return;
    const id = window.setInterval(() => {
      if (paused.current) return;
      setIndex((i) => (i + 1) % entries.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reduced, entries.length, intervalMs]);

  if (!entries.length) return null;

  const active = entries[Math.min(index, entries.length - 1)];

  return (
    <div
      className={twMerge(clsx("flex min-w-0 items-center gap-3", className))}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
    >
      <span
        aria-hidden
        className="shrink-0 font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-accent)]"
      >
        NOTE {String((reduced ? 0 : index) + 1).padStart(2, "0")}
      </span>
      <span aria-hidden className="h-3 w-px shrink-0 bg-[color:var(--color-border)]" />

      {reduced ? (
        // Nothing moves: the notes are listed in full, visually condensed to
        // the first one and read out in order by assistive tech.
        <ul className="flex min-w-0 items-center gap-4 overflow-hidden">
          {entries.map((e, i) => (
            <li
              key={e.label}
              className={clsx(
                "min-w-0 truncate text-[13px] text-[color:var(--color-text-secondary)]",
                i > 0 && "hidden",
              )}
            >
              {e.label}
              {e.value ? (
                <span className="readout ml-2 text-[13px] text-[color:var(--color-text)]">{e.value}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p
          key={active.label}
          aria-live="off"
          className="animate-fadeIn min-w-0 truncate text-[13px] text-[color:var(--color-text-secondary)]"
        >
          {active.label}
          {active.value ? (
            <span className="readout ml-2 text-[13px] text-[color:var(--color-text)]">{active.value}</span>
          ) : null}
        </p>
      )}
    </div>
  );
}
