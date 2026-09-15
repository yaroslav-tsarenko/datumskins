"use client";

import Link from "next/link";
import { exteriorMeta } from "@/lib/skins/shared";
import type { SihCatalogItem } from "@/lib/sih/queries";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Stamp, SpecTag } from "@/components/ui/Stamp";
import { WearDiagram, wearInk } from "@/components/ui/WearDiagram";
import { RarityRule, rarityVars, RarityTag } from "@/components/ui/RarityTag";

/**
 * The spec sheet — a skin presented as a technical document.
 *
 * A ruled sheet of bright paper on the drafting board: registration marks at
 * the corners, the render on a gridded stage, the grade drawn as a thin rule
 * beneath it, the wear diagram annotated against the real zone boundaries,
 * and a two-cell title block along the bottom carrying the price and the
 * grade index. Inspection stamps are applied only when they are literally
 * true, and never more than two to a sheet.
 *
 * `index` is this card's position in the listing you are looking at — the
 * sheet number is a real reference to where you are, not invented furniture.
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

  return (
    <Link
      href={`/store/${item.slug}`}
      style={rarityVars(item.rarityColor)}
      className="card-lift group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]"
    >
      {/* ── Sheet head: the reference strip ───────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] px-2.5 py-1.5">
        <span className="microlabel truncate">{item.weapon ?? item.category}</span>
        <span className="flex shrink-0 items-center gap-2">
          {ext ? (
            <span
              className="font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.16em]"
              style={{ color: wearInk(ext?.short) }}
            >
              {ext.short}
            </span>
          ) : null}
          {index !== undefined ? (
            <span aria-hidden className="index-num text-[10px]">
              SHT {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
        </span>
      </div>

      {/* ── The render stage, on gridded paper ────────────────────── */}
      <div className="reg-marks relative aspect-[4/3] overflow-hidden bg-[color:var(--color-bg)]">
        <span aria-hidden className="gridded pointer-events-none absolute inset-0 opacity-70" />

        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span aria-hidden className="hatch absolute inset-6" />
            <span className="microlabel relative">No render on file</span>
          </div>
        )}

        {/* What the item IS — quiet annotations, bottom left. */}
        <div className="absolute bottom-2 left-2 flex flex-wrap items-end gap-1">
          {item.isStatTrak ? <SpecTag tone="hold">StatTrak™</SpecTag> : null}
          {item.isSouvenir ? <SpecTag tone="approve">Souvenir</SpecTag> : null}
          {item.phase ? <SpecTag tone="ink">{item.phase}</SpecTag> : null}
        </div>

        {/* What is TRUE of the offer — stamped, top right, at most two. */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-2">
          {hasDiscount ? <Stamp>−{item.discountPct}%</Stamp> : null}
          {lastUnits ? (
            <Stamp tone="hold" tilt="right">
              {item.count} in stock
            </Stamp>
          ) : null}
        </div>
      </div>

      {/* The grade, drawn as a rule rather than a glow. */}
      <RarityRule />

      {/* ── The annotations ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <h3 className="font-display line-clamp-2 min-h-[2.2em] text-[15.5px] font-semibold leading-[1.15] tracking-[-0.015em] text-[color:var(--color-accent)]">
          {skin}
        </h3>

        <div>
          <WearDiagram exterior={item.exterior} compact />
          {ext ? (
            <span className="microlabel mt-1 block">
              Float {ext.floatMin.toFixed(2)}–{ext.floatMax.toFixed(2)}
            </span>
          ) : null}
        </div>

        {/* ── The title block: price, then grade ──────────────────── */}
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-stretch border border-[color:var(--color-accent)]">
          <div className="flex min-w-0 flex-col justify-center border-r border-[color:var(--color-border)] px-2.5 py-1.5">
            <span className="microlabel">Price</span>
            <span className="readout mt-0.5 block truncate text-[17px] font-semibold leading-tight text-[color:var(--color-text)]">
              {format(item.price, "USD")}
            </span>
            {item.steamPrice != null && hasDiscount ? (
              <span className="readout block truncate text-[10px] text-[color:var(--color-text-tertiary)] line-through">
                {format(item.steamPrice, "USD")}
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center px-2 py-1.5">
            <RarityTag rarity={item.rarity} color={item.rarityColor} showName={false} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SihItemCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]">
      <div className="h-[29px] border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]" />
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="flex flex-col gap-2.5 p-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-1.5 w-full" />
        <div className="skeleton mt-2 h-10 w-full" />
      </div>
    </div>
  );
}
