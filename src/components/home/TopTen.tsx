"use client";

import { Link } from "@/i18n/routing";
import type { SihCatalogItem } from "@/lib/sih/queries";
import { useCurrency } from "@/providers/CurrencyProvider";
import { RarityTag, rarityVars } from "@/components/ui/RarityTag";
import { exteriorMeta } from "@/lib/skins/shared";

/**
 * The schedule of items — the ruled table that accompanies a drawing set,
 * listing each item against its reference, description and quantity.
 *
 * Here the reference is the rank by price, the description is the skin, and
 * the right-hand column carries the figure the eye runs down. Every row is a
 * real listing: the order is the price order and nothing else.
 */
export function TopTen({
  items,
  className,
}: {
  items: SihCatalogItem[];
  className?: string;
}) {
  const { format } = useCurrency();

  return (
    <div className={`border border-[color:var(--color-accent)] ${className ?? ""}`}>
      {/* Column heads, the way a schedule labels its columns. */}
      <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-x-4 border-b border-[color:var(--color-accent)] bg-[color:var(--color-accent-tint)] px-3 py-1.5 sm:grid-cols-[3rem_4rem_1fr_auto] sm:gap-x-6">
        <span className="microlabel text-[color:var(--color-accent)]">Ref</span>
        <span className="microlabel hidden text-[color:var(--color-accent)] sm:block">View</span>
        <span className="microlabel text-[color:var(--color-accent)]">Description</span>
        <span className="microlabel text-right text-[color:var(--color-accent)]">Price</span>
      </div>

      <ol>
        {items.map((item, i) => {
          const ext = exteriorMeta(item.exterior);
          return (
            <li
              key={item.slug}
              className="border-b border-[color:var(--color-border)] last:border-b-0 even:bg-[color:var(--color-bg-secondary)]/60"
            >
              <Link
                href={`/store/${item.slug}`}
                style={rarityVars(item.rarityColor)}
                className="grid grid-cols-[3rem_1fr_auto] items-center gap-x-4 px-3 py-3 transition-colors hover:bg-[color:var(--color-accent-tint)] sm:grid-cols-[3rem_4rem_1fr_auto] sm:gap-x-6"
              >
                <span aria-hidden className="index-num text-[15px]">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="relative hidden h-12 w-16 shrink-0 border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] sm:block">
                  <span aria-hidden className="gridded absolute inset-0 opacity-70" />
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      loading="lazy"
                      className="relative h-full w-full object-contain p-1"
                    />
                  ) : null}
                  <span className="rarity-rule absolute inset-x-0 bottom-0 h-[2px]" aria-hidden />
                </span>

                <span className="min-w-0">
                  <span className="microlabel block truncate">{item.weapon ?? item.category}</span>
                  <span className="font-display mt-0.5 block truncate text-[15.5px] font-semibold tracking-[-0.015em] text-[color:var(--color-accent)]">
                    {item.skinName ?? item.name}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <RarityTag rarity={item.rarity} color={item.rarityColor} />
                    {ext ? (
                      <span className="readout text-[10px] text-[color:var(--color-text-tertiary)]">
                        {ext.short} · {ext.floatMin.toFixed(2)}–{ext.floatMax.toFixed(2)}
                      </span>
                    ) : null}
                  </span>
                </span>

                <span className="readout shrink-0 text-right text-[clamp(1rem,2.6vw,1.4rem)] font-semibold leading-none text-[color:var(--color-text)]">
                  {format(item.price, "USD")}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
