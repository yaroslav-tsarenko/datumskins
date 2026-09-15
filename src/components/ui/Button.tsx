"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "danger-soft" | "light" | "flat" | "bordered" | "tertiary";
type Color = "primary" | "danger" | "success" | "warning" | "default";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: Variant;
  color?: Color;
  size?: Size;
  isLoading?: boolean;
  isDisabled?: boolean;
  isIconOnly?: boolean;
  fullWidth?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  as?: React.ElementType;
  href?: string;
  target?: string;
  download?: boolean;
  onPress?: () => void;
}

/**
 * Datumskins Button — Blueprint Works, revision B:
 *   primary   = inspection red, white type (5.3:1) — the buy action, one per view
 *   secondary = blueprint-blue outline               — browse, view, compare
 *   outline   = white with a soft hairline           — neutral tertiary action
 *   ghost     = quiet inline                         — cancel, learn more
 *
 * Softly cornered at 6px, flat fills, a short shadow on hover and a 1px press.
 * No glow, no gradient, no float.
 */
export function Button({
  variant = "primary",
  color,
  size = "md",
  isLoading = false,
  isDisabled = false,
  isIconOnly = false,
  fullWidth = false,
  startContent,
  endContent,
  as,
  href,
  target,
  download,
  onPress,
  children,
  className,
  onClick,
  type,
  ...rest
}: ButtonProps) {
  const resolved = resolveVariant(variant, color);

  const base =
    "inline-flex items-center justify-center gap-2 font-semibold tracking-[0.01em] " +
    "transition-[background-color,border-color,color,transform,box-shadow] duration-[var(--dur-base)] " +
    "select-none whitespace-nowrap rounded-[var(--radius-md)] " +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]";

  const sizes: Record<Size, string> = {
    sm: isIconOnly ? "h-9 w-9 text-sm" : "h-9 px-3.5 text-[14px]",
    md: isIconOnly ? "h-11 w-11 text-sm" : "h-11 px-5 text-[15px]",
    lg: isIconOnly ? "h-13 w-13" : "h-13 px-7 text-[16px]",
  };

  const variants: Record<string, string> = {
    primary:
      "bg-[color:var(--color-primary-strong)] text-[color:var(--color-primary-fg)] border border-[color:var(--color-primary-strong)] " +
      "hover:bg-[color:var(--color-primary-hover)] hover:border-[color:var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] active:translate-y-[1px] active:shadow-none",
    secondary:
      "bg-transparent text-[color:var(--color-accent)] border border-[color:var(--color-accent)] " +
      "hover:bg-[color:var(--color-accent-tint)] active:translate-y-[1px]",
    outline:
      "bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] border border-[color:var(--color-border-strong)] " +
      "hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] active:translate-y-[1px]",
    ghost:
      "bg-transparent text-[color:var(--color-text)] border border-transparent hover:bg-[color:var(--color-bg-secondary)]",
    tertiary:
      "bg-transparent text-[color:var(--color-text-secondary)] border border-transparent hover:text-[color:var(--color-accent)]",
    danger:
      "bg-[color:var(--color-primary-strong)] text-white border border-transparent hover:bg-[color:var(--color-primary-hover)] active:translate-y-[1px]",
    "danger-soft":
      "bg-[color:var(--color-danger-light)] text-[color:var(--color-danger)] border border-transparent hover:brightness-[0.97]",
  };

  const classes = twMerge(
    clsx(
      base,
      sizes[size],
      variants[resolved] ?? variants.primary,
      fullWidth && "w-full",
      className,
    ),
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isLoading) return;
    onClick?.(e);
    onPress?.();
  };

  const content = (
    <>
      {isLoading && (
        <span
          aria-hidden
          className="inline-block h-[1em] w-[1em] animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {!isLoading && startContent}
      {!isIconOnly && children}
      {endContent}
    </>
  );

  if (as || href) {
    const Component: React.ElementType = as || "a";
    return (
      <Component
        href={href}
        target={target}
        download={download}
        className={classes}
        onClick={handleClick as unknown as React.MouseEventHandler}
        {...rest}
      >
        {content}
      </Component>
    );
  }

  return (
    <button
      type={type || "button"}
      className={classes}
      onClick={handleClick}
      disabled={isDisabled || isLoading}
      {...rest}
    >
      {content}
    </button>
  );
}

function resolveVariant(variant: Variant, color?: Color): string {
  if (color === "primary" && variant !== "outline" && variant !== "bordered" && variant !== "ghost" && variant !== "light" && variant !== "flat") return "primary";
  if (color === "danger" && (variant === "flat" || variant === "light")) return "danger-soft";
  if (color === "danger") return "danger";
  if (variant === "light" || variant === "flat") return "ghost";
  if (variant === "bordered") return "outline";
  return variant;
}
