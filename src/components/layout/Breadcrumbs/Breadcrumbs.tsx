"use client";

import { Link } from "@/i18n/routing";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/** The reference trail — mono, wide-tracked, slash-separated, the way a\n *  drawing cites the sheet it came from. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="py-5" aria-label="Breadcrumb">
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden className="text-[color:var(--color-text-tertiary)]">
                /
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-[color:var(--color-text-tertiary)] transition-colors hover:text-[color:var(--color-accent)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[color:var(--color-accent)]" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
