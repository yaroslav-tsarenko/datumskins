"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { RARITY_TIERS } from "@/lib/skins/shared";
import type { SihCatalogItem, SihCatalogResult } from "@/lib/sih/queries";
import { SihItemCard, SihItemCardSkeleton } from "@/components/sih/SihItemCard";
import { ArrowRight } from "lucide-react";

const GRADES = Object.entries(RARITY_TIERS)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([name, meta]) => ({ name, color: meta.color }));

/**
 * The grade legend — the grades of the CS2 rarity scale, filtering a live
 * preview. Each grade is a swatch of its own Valve hue beside the grade name
 * in dark ink; the hue is never a glow and never carries the type.
 */
export function RarityExplorer({ className }: { className?: string }) {
  const [active, setActive] = useState(GRADES[GRADES.length - 3]?.name ?? "Covert");
  const [items, setItems] = useState<SihCatalogItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/sih/catalog?rarity=${encodeURIComponent(active)}&perPage=4&sort=price_desc`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SihCatalogResult | null) => {
        if (cancelled) return;
        setItems(data?.items ?? []);
        setTotal(data?.total ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setTotal(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  return (
    <div className={className}>
      <div role="tablist" aria-label="Rarity grades" className="flex flex-wrap gap-2">
        {GRADES.map((g) => {
          const selected = g.name === active;
          return (
            <button
              key={g.name}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(g.name)}
              className={[
                "focus-amber inline-flex items-center gap-2 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-[14px] font-medium transition-colors",
                selected
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                  : "border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] hover:border-[color:var(--color-accent)]",
              ].join(" ")}
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ background: g.color }}
              />
              {g.name}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[15px] text-[color:var(--color-text-secondary)]" aria-live="polite">
          {total != null ? `${total.toLocaleString()} in stock` : "—"}
        </p>
        <Link
          href={`/store?rarity=${encodeURIComponent(active)}`}
          className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[color:var(--color-accent)] hover:underline"
        >
          Open {active} <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SihItemCardSkeleton key={i} />)
          : items.slice(0, 4).map((item, i) => <SihItemCard key={item.slug} item={item} index={i} />)}
      </div>

      {!loading && items.length === 0 ? (
        <p className="mt-6 text-[16px] text-[color:var(--color-text-secondary)]">
          Nothing in stock at this grade right now.
        </p>
      ) : null}
    </div>
  );
}
