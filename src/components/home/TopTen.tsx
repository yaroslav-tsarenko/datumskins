"use client";

import { Link } from "@/i18n/routing";
import type { SihCatalogItem } from "@/lib/sih/queries";
import { useCurrency } from "@/providers/CurrencyProvider";
import { RarityTag, rarityVars } from "@/components/ui/RarityTag";
import { exteriorMeta } from "@/lib/skins/shared";

/**
 * The ranked list.
 *
 * A clean white table: a rank, a thumbnail, the designation with its grade and
 * wear, and the price at the right edge where the eye can run straight down
 * the column. Tall rows, a 3% zebra, no vertical rules. Every row is a real
 * listing — the order is the price order and nothing else.
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
    <div className={`overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] ${className ?? ""}`}>
      {/* Column heads, the way a schedule labels its columns. */}
      <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 border-b border-[color:var(--color-border-strong)] px-4 py-3 sm:grid-cols-[2.5rem_4.5rem_1fr_auto] sm:gap-x-6">
        <span className="microlabel">#</span>
        <span className="microlabel hidden sm:block">Skin</span>
        <span className="microlabel">Designation</span>
        <span className="microlabel text-right">Price</span>
      </div>

      <ol>
        {items.map((item, i) => {
          const ext = exteriorMeta(item.exterior);
          return (
            <li
              key={item.slug}
              className="border-b border-[color:var(--color-border)] last:border-b-0 even:bg-[color:var(--color-bg)]"
            >
              <Link
                href={`/store/${item.slug}`}
                style={rarityVars(item.rarityColor)}
                className="grid min-h-[72px] grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 px-4 py-3.5 transition-colors hover:bg-[color:var(--color-accent-tint)] sm:grid-cols-[2.5rem_4.5rem_1fr_auto] sm:gap-x-6"
              >
                <span aria-hidden className="index-num text-[16px]">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="relative hidden h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] sm:block">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      loading="lazy"
                      className="relative h-full w-full object-contain p-1.5"
                    />
                  ) : null}
                  <span className="rarity-rule absolute inset-x-0 bottom-0 h-[3px]" aria-hidden />
                </span>

                <span className="min-w-0">
                  <span className="microlabel block truncate">{item.weapon ?? item.category}</span>
                  <span className="font-display mt-1 block truncate text-[16px] font-semibold tracking-[-0.015em] text-[color:var(--color-text)]">
                    {item.skinName ?? item.name}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <RarityTag rarity={item.rarity} color={item.rarityColor} />
                    {ext ? (
                      <span className="readout text-[13px] text-[color:var(--color-text-tertiary)]">
                        {ext.short} · {ext.floatMin.toFixed(2)}–{ext.floatMax.toFixed(2)}
                      </span>
                    ) : null}
                  </span>
                </span>

                <span className="readout shrink-0 text-right text-[clamp(1.05rem,2.4vw,1.35rem)] font-semibold leading-none text-[color:var(--color-text)]">
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
