import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "accent";
type ChipVariant = "solid" | "flat" | "faded" | "bordered" | "light" | "dot";
type ChipSize = "sm" | "md" | "lg";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: ChipColor;
  variant?: ChipVariant;
  size?: ChipSize;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isCloseable?: boolean;
  onClose?: () => void;
}

/**
 * Datumskins Chip — the filter / status annotation.
 *
 * Softly cornered at 4px and mono-labelled at 12px: a chip here reads as a
 * note beside a spec, not as a rounded pill from a component kit.
 */
export function Chip({
  color = "default",
  variant = "flat",
  size = "md",
  startContent,
  endContent,
  isCloseable,
  onClose,
  className,
  children,
  ...rest
}: ChipProps) {
  const sizes: Record<ChipSize, string> = {
    sm: "h-7 px-2.5 text-[12px]",
    md: "h-8 px-3 text-[12px]",
    lg: "h-8 px-3 text-xs",
  };

  const palettes: Record<ChipColor, { solid: string; flat: string; bordered: string }> = {
    default: {
      solid: "bg-[color:var(--color-text)] text-[color:var(--color-text-inverse)] border border-transparent",
      flat: "bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text)] border border-transparent",
      bordered: "bg-transparent text-[color:var(--color-text)] border border-[color:var(--color-border-strong)]",
    },
    primary: {
      solid: "bg-[color:var(--color-primary-strong)] text-[color:var(--color-primary-fg)] border border-transparent",
      flat: "bg-[color:var(--color-primary-tint)] text-[color:var(--color-danger)] border border-transparent",
      bordered: "bg-transparent text-[color:var(--color-primary-strong)] border border-[color:var(--color-primary)]",
    },
    secondary: {
      solid: "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] border border-transparent",
      flat: "bg-[color:var(--color-accent-tint)] text-[color:var(--color-accent)] border border-transparent",
      bordered: "bg-transparent text-[color:var(--color-accent)] border border-[color:var(--color-accent)]",
    },
    accent: {
      solid: "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] border border-transparent",
      flat: "bg-[color:var(--color-accent-tint)] text-[color:var(--color-accent)] border border-transparent",
      bordered: "bg-transparent text-[color:var(--color-accent)] border border-[color:var(--color-accent)]",
    },
    success: {
      solid: "bg-[color:var(--color-success)] text-white border border-transparent",
      flat: "bg-[color:var(--color-success-light)] text-[color:var(--color-success)] border border-transparent",
      bordered: "bg-transparent text-[color:var(--color-success)] border border-[color:var(--color-success)]",
    },
    warning: {
      solid: "bg-[color:var(--color-gold)] text-[#2A1A05] border border-transparent",
      flat: "bg-[color:var(--color-warning-light)] text-[color:var(--color-warning)] border border-transparent",
      bordered: "bg-transparent text-[color:var(--color-warning)] border border-[color:var(--color-warning)]",
    },
    danger: {
      solid: "bg-[color:var(--color-danger)] text-white border border-transparent",
      flat: "bg-[color:var(--color-danger-light)] text-[color:var(--color-danger)] border border-transparent",
      bordered: "bg-transparent text-[color:var(--color-danger)] border border-[color:var(--color-danger)]",
    },
  };

  const resolvedVariant: keyof (typeof palettes)[ChipColor] =
    variant === "solid" ? "solid"
    : variant === "bordered" ? "bordered"
    : "flat";

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)]",
          "font-mono font-medium uppercase leading-none tracking-[0.1em]",
          sizes[size],
          palettes[color][resolvedVariant],
          className,
        ),
      )}
      {...rest}
    >
      {variant === "dot" && (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)]"
        />
      )}
      {startContent}
      {children}
      {endContent}
      {isCloseable && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Remove"
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </span>
  );
}
