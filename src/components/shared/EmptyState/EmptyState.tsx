"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

/** An unissued sheet, not a shrug: a hatched field, a ruled frame, one way out. */
export function EmptyState({
  title,
  subtitle,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center gap-3 overflow-hidden border border-[color:var(--color-border-strong)] px-4 py-16 text-center">
      <span aria-hidden className="hatch absolute inset-0 opacity-20" />
      <span className="relative text-[color:var(--color-blueprint-soft)]">
        {icon || <PackageOpen size={40} strokeWidth={1.5} />}
      </span>
      <h3 className="drawing-title relative text-[clamp(1.25rem,3vw,1.75rem)]">{title}</h3>
      {subtitle && (
        <p className="relative max-w-[40ch] text-[14px] text-[color:var(--color-text-secondary)]">
          {subtitle}
        </p>
      )}
      {actionLabel && actionHref && (
        <Button as={Link} href={actionHref} className="relative mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
