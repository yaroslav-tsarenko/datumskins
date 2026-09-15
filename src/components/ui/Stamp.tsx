import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type Tone = "inspection" | "approve" | "hold" | "ink";

const tones: Record<Tone, string> = {
  inspection: "",
  approve: "stamp-approve",
  hold: "stamp-hold",
  ink: "stamp-ink",
};

/**
 * The inspection stamp.
 *
 * Revision B keeps the charm and drops the noise: a solid fill at one fixed,
 * comfortable size (12px mono, 600) with white type, tilted 2.5 degrees so it
 * still reads as applied by hand. The distressed double edge is gone — it
 * shimmered at small sizes and never rendered cleanly on a scaled display.
 *
 * Rationed hard: **one stamp per card, maximum**, and only when it is
 * literally true ("−24%", "NEW ARRIVAL", "PASSED QC").
 */
export function Stamp({
  children,
  tone = "inspection",
  tilt = "left",
  press = false,
  className,
  ...rest
}: {
  children: React.ReactNode;
  tone?: Tone;
  tilt?: "left" | "right" | "none";
  /** Plays the press-down once on mount. Reserved for CTAs and the hero. */
  press?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={twMerge(
        clsx(
          "stamp",
          tones[tone],
          tilt === "right" && "stamp-right",
          tilt === "none" && "stamp-flat",
          press && (tilt === "right" ? "animate-stamp-right" : "animate-stamp"),
          className,
        ),
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

/**
 * A spec tag — the quiet annotation label for exteriors, phases and flags.
 * Tinted background, dark ink, 12px mono: it states a fact without competing
 * with the stamp for attention.
 */
export function SpecTag({
  children,
  tone = "default",
  className,
  style,
}: {
  children: React.ReactNode;
  tone?: "default" | "ink" | "inspection" | "approve" | "hold";
  className?: string;
  style?: React.CSSProperties;
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-secondary)]",
    ink: "bg-[color:var(--color-accent-tint)] text-[color:var(--color-accent)]",
    inspection: "bg-[color:var(--color-primary-tint)] text-[color:var(--color-danger)]",
    approve: "bg-[color:var(--color-success-light)] text-[color:var(--color-success)]",
    hold: "bg-[color:var(--color-warning-light)] text-[color:var(--color-warning)]",
  };
  return (
    <span
      style={style}
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1",
          "font-mono text-[12px] font-medium uppercase leading-none tracking-[0.1em]",
          toneClasses[tone],
          className,
        ),
      )}
    >
      {children}
    </span>
  );
}

/**
 * Sheet furniture: the drawing reference. Kept, but demoted — muted charcoal
 * rather than blue, so it sits behind the content instead of beside it.
 */
export function SheetNum({
  sheet,
  rev,
  className,
}: {
  sheet?: number | string;
  rev?: string;
  className?: string;
}) {
  if (sheet === undefined && !rev) return null;
  return (
    <span
      aria-hidden
      className={twMerge(
        clsx(
          "inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]",
          className,
        ),
      )}
    >
      {sheet !== undefined ? (
        <span>SHT {typeof sheet === "number" ? String(sheet).padStart(2, "0") : sheet}</span>
      ) : null}
      {sheet !== undefined && rev ? <span aria-hidden>/</span> : null}
      {rev ? <span>REV {rev}</span> : null}
    </span>
  );
}

/**
 * A word under dimension — the marker move.
 *
 * The word itself stays charcoal so no reading text is ever coloured; only the
 * ticked rule beneath it is blueprint blue. Used once per heading, never twice,
 * and never on a full line of copy.
 */
export function Dimmed({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={twMerge(clsx("dim-word inline-block", className))}>{children}</span>;
}

/** A dimension line with tick ends. Hero and section heads only. */
export function DimLine({ className }: { className?: string }) {
  return <span aria-hidden className={twMerge(clsx("dim-line block w-full", className))} />;
}
