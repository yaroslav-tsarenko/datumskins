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

/** An empty result, not a shrug: a calm white card, a clear line, one way out. */
export function EmptyState({
  title,
  subtitle,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-6 py-20 text-center">
      <span className="text-[color:var(--color-accent)]">
        {icon || <PackageOpen size={40} strokeWidth={1.5} />}
      </span>
      <h3 className="drawing-title text-[clamp(1.25rem,3vw,1.6rem)]">{title}</h3>
      {subtitle && (
        <p className="max-w-[46ch] text-[16px] leading-relaxed text-[color:var(--color-text-secondary)]">
          {subtitle}
        </p>
      )}
      {actionLabel && actionHref && (
        <Button as={Link} href={actionHref} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
