"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

function pad(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

/**
 * A dimensioned countdown — mono digits on a quiet tinted chip, the way a
 * drawing annotates a measured quantity.
 *
 * It only ever counts to a real deadline supplied by the caller: either an
 * absolute `target`, or a rolling window such as the catalogue's own cache
 * interval. Nothing here manufactures urgency.
 */
export function SyncReadout({
  target,
  everySeconds,
  label,
  endedLabel = "Syncing…",
  tone = "ink",
  className,
}: {
  target?: Date | string | number;
  everySeconds?: number;
  label?: string;
  endedLabel?: string;
  tone?: "ink" | "inspection" | "quiet";
  className?: string;
}) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const compute = () => {
      if (everySeconds && everySeconds > 0) {
        const ms = everySeconds * 1000;
        return ms - (Date.now() % ms);
      }
      if (target == null) return null;
      return new Date(target).getTime() - Date.now();
    };
    setLeft(compute());
    const id = setInterval(() => setLeft(compute()), 1000);
    return () => clearInterval(id);
  }, [target, everySeconds]);

  const tones: Record<string, string> = {
    ink: "border-[color:var(--color-accent)] bg-[color:var(--color-accent-tint)] text-[color:var(--color-text)]",
    inspection: "border-[color:var(--color-primary)] bg-[color:var(--color-primary-tint)] text-[color:var(--color-text)]",
    quiet: "border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text-secondary)]",
  };

  // Server render and first paint must agree, so digits appear only once the
  // effect has read the clock.
  const digits = (() => {
    if (left == null) return "--:--:--";
    if (left <= 0) return null;
    const s = left / 1000;
    return `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
  })();

  return (
    <span
      role="timer"
      aria-live="off"
      className={twMerge(
        clsx(
          "inline-flex items-center gap-2 rounded-[var(--radius-sm)] border px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase leading-none tracking-[0.1em]",
          tones[tone],
          className,
        ),
      )}
    >
      {label ? <span className="opacity-80">{label}</span> : null}
      <span className="tnum tracking-[0.1em]">{digits ?? endedLabel}</span>
    </span>
  );
}
