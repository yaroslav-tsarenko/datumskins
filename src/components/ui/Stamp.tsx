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
 * The inspection stamp — a rubber stamp pressed onto the sheet.
 *
 * Double-ruled, wide-tracked, rotated a few degrees off true so it reads as
 * applied by hand rather than printed with the drawing. Rationed: a sheet
 * carries at most two, and only when they are literally true ("−24%",
 * "HOLD: TRADE-LOCK", "PASSED QC").
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
  /** Plays the press-down animation once on mount. */
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
 * A spec tag — the quiet annotation label. Square, mono, wide-tracked; used
 * for exteriors, categories and any value that belongs beside a drawing.
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
  const tones: Record<string, string> = {
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
          "inline-flex items-center gap-1 px-1.5 py-1 font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.16em]",
          tones[tone],
          className,
        ),
      )}
    >
      {children}
    </span>
  );
}

/**
 * Sheet furniture: the drawing number. "SHT 04" / "REV B" — the kind of label
 * that sits in the corner of a technical drawing and tells you where you are.
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
          "inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-blueprint-soft)]",
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
 * A word under dimension — the marker move of this identity.
 *
 * A louder brand would put a highlighter plate behind the word; a drawing
 * measures it instead: inspection-red type with a ticked extent ruled beneath.
 * Used once per heading, never twice.
 */
export function Dimmed({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={twMerge(clsx("dim-word inline-block", className))}>{children}</span>
  );
}

/** A dimension line with tick ends — the ruled extent under a heading. */
export function DimLine({ className }: { className?: string }) {
  return <span aria-hidden className={twMerge(clsx("dim-line block w-full", className))} />;
}
