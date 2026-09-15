"use client";

import Link from "next/link";
import { exteriorMeta } from "@/lib/skins/shared";
import type { SihCatalogItem } from "@/lib/sih/queries";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Stamp, SpecTag } from "@/components/ui/Stamp";
import { WearDiagram } from "@/components/ui/WearDiagram";
import { RarityRule, rarityVars, RarityTag } from "@/components/ui/RarityTag";

/**
 * The spec card.
 *
 * Revision B: white, softly cornered at 10px, resting on the page with a short
 * shadow. The render stage is uniform and **grid-free** — the millimetre grid
 * belongs to the hero and the item page, not to a wall of forty cards. Grade is
 * a labelled chip plus a thin coloured rule under the render. Below sits the
 * mini title block: FLOAT and EXTERIOR on ruled rows, price last and loudest in
 * mono charcoal.
 *
 * **One stamp, maximum.** The card picks the single most useful true thing to
 * say — a real markdown first, otherwise genuinely low stock, otherwise
 * nothing — rather than stacking badges in the corner.
 *
 * `index` is this card's position in the listing you are looking at, so the
 * sheet reference is a real pointer to where you are, not invented furniture.
 */
export function SihItemCard({ item, index }: { item: SihCatalogItem; index?: number }) {
  const ext = exteriorMeta(item.exterior);
  const { format } = useCurrency();

  const skin =
    item.skinName ||
    item.name.replace(/^(StatTrak™ |Souvenir |★ )/, "").split(" | ").slice(1).join(" | ") ||
    item.name;

  const hasDiscount = item.discountPct != null && item.discountPct > 0;
  const lastUnits = item.count > 0 && item.count <= 3;

  // One stamp per card. Markdown outranks scarcity; scarcity outranks silence.
  const stamp = hasDiscount
    ? { tone: "inspection" as const, text: `−${item.discountPct}%` }
    : lastUnits
      ? { tone: "hold" as const, text: `${item.count} left` }
      : null;

  return (
    <Link
      href={`/store/${item.slug}`}
      style={rarityVars(item.rarityColor)}
      className="card-lift group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-card)]"
    >
      {/* The render stage — uniform, clean, no grid. */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-bg)]">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="microlabel">No render on file</span>
          </div>
        )}

        {stamp ? (
          <span className="absolute right-3 top-3">
            <Stamp tone={stamp.tone}>{stamp.text}</Stamp>
          </span>
        ) : null}
      </div>

      {/* The grade, as a thin rule. */}
      <RarityRule />

      <div className="flex flex-1 flex-col gap-3.5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="microlabel truncate">{item.weapon ?? item.category}</p>
            <h3 className="font-display mt-1.5 line-clamp-2 min-h-[2.4em] text-[17px] font-semibold leading-[1.2] tracking-[-0.015em] text-[color:var(--color-text)]">
              {skin}
            </h3>
          </div>
          {index !== undefined ? (
            <span aria-hidden className="index-num shrink-0 pt-0.5 text-[12px]">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <RarityTag rarity={item.rarity} color={item.rarityColor} />
          {item.isStatTrak ? <SpecTag tone="hold">ST™</SpecTag> : null}
          {item.isSouvenir ? <SpecTag tone="approve">Souvenir</SpecTag> : null}
        </div>

        {/* The mini title block: the two facts that decide a purchase. */}
        <dl className="mt-auto overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)]">
          <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--color-border)] px-3 py-2">
            <dt className="microlabel">Exterior</dt>
            <dd className="readout text-[13px]">{ext ? ext.short : "—"}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--color-border)] px-3 py-2">
            <dt className="microlabel">Float</dt>
            <dd className="readout text-[13px]">
              {ext ? `${ext.floatMin.toFixed(2)}–${ext.floatMax.toFixed(2)}` : "—"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 px-3 py-2.5">
            <dt className="microlabel">Price</dt>
            <dd className="flex items-baseline gap-2">
              {item.steamPrice != null && hasDiscount ? (
                <span className="readout text-[12px] text-[color:var(--color-text-tertiary)] line-through">
                  {format(item.steamPrice, "USD")}
                </span>
              ) : null}
              <span className="readout text-[19px] font-semibold leading-none">
                {format(item.price, "USD")}
              </span>
            </dd>
          </div>
        </dl>

        <WearDiagram exterior={item.exterior} compact />
      </div>
    </Link>
  );
}

export function SihItemCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]">
      <div className="skeleton aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3.5 p-5">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-7 w-1/2" />
        <div className="skeleton h-[104px] w-full" />
      </div>
    </div>
  );
}
