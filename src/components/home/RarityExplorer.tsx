"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { RARITY_TIERS } from "@/lib/skins/shared";
import type { SihCatalogItem, SihCatalogResult } from "@/lib/sih/queries";
import { SihItemCard, SihItemCardSkeleton } from "@/components/sih/SihItemCard";
import { ArrowRight } from "lucide-react";

const INDEX = ["A", "B", "C", "D", "E", "F", "G", "H"];

const GRADES = Object.entries(RARITY_TIERS)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([name, meta], i) => ({ name, color: meta.color, index: INDEX[i] ?? "—" }));

/**
 * The grade legend — the index of rarity grades, filtering a live preview.
 *
 * A legend on a drawing pairs a symbol with what it means, so each grade is a
 * boxed index letter in the grade's own Valve hue beside the grade name. The
 * hue appears as a swatch, never as a glow behind the type.
 */
export function RarityExplorer({ className }: { className?: string }) {
  const [active, setActive] = useState(GRADES[GRADES.length - 3]?.name ?? "Covert");
  const [items, setItems] = useState<SihCatalogItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/sih/catalog?rarity=${encodeURIComponent(active)}&perPage=6&sort=price_desc`)
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
      <div role="tablist" aria-label="Rarity grades" className="flex flex-wrap gap-1.5">
        {GRADES.map((g) => {
          const selected = g.name === active;
          return (
            <button
              key={g.name}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(g.name)}
              className={[
                "focus-amber inline-flex items-stretch border font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors",
                selected
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                  : "border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]",
              ].join(" ")}
            >
              <span
                aria-hidden
                className="grid w-[1.8em] place-items-center border-r border-[color:var(--color-border)] py-1.5"
                style={{ background: g.color, color: "#1A1D24" }}
              >
                {g.index}
              </span>
              <span className="px-2.5 py-1.5">{g.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
        <p className="readout text-[12px] text-[color:var(--color-text-secondary)]" aria-live="polite">
          {total != null ? `${total.toLocaleString()} in stock` : "—"}
        </p>
        <Link
          href={`/store?rarity=${encodeURIComponent(active)}`}
          className="inline-flex items-center gap-1.5 border-b border-[color:var(--color-primary)] pb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
        >
          Open {active} <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SihItemCardSkeleton key={i} />)
          : items.map((item, i) => <SihItemCard key={item.slug} item={item} index={i} />)}
      </div>

      {!loading && items.length === 0 ? (
        <p className="mt-6 text-[14px] text-[color:var(--color-text-secondary)]">
          Nothing in stock at this grade right now.
        </p>
      ) : null}
    </div>
  );
}
