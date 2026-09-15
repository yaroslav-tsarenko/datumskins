"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { exteriorMeta } from "@/lib/skins/shared";
import type { SihCatalogItem } from "@/lib/sih/queries";
import { useCurrency } from "@/providers/CurrencyProvider";
import { RarityTag } from "@/components/ui/RarityTag";
import { WearDiagram, wearInk } from "@/components/ui/WearDiagram";

/**
 * The parts list — the power-user view of the catalogue.
 *
 * Six columns and no more: designation, grade, exterior, float, price, action.
 * Everything else (StatTrak, Souvenir, phase, stock, market name, the wear
 * gauge) lives behind a per-row expand, so the default scan stays wide and
 * quiet. Rows are 48px tall, striped at 3%, and the header sticks under the
 * site header while you scroll.
 *
 * Below `md` a table is the wrong shape for a phone, so the same data renders
 * as stacked summary cards with the same expand.
 */
export function SihPartsTable({ items }: { items: SihCatalogItem[] }) {
  const { format } = useCurrency();
  const [expanded, setExpanded] = useState<string | null>(null);

  const designation = (item: SihCatalogItem) =>
    item.skinName ||
    item.name.replace(/^(StatTrak™ |Souvenir |★ )/, "").split(" | ").slice(1).join(" | ") ||
    item.name;

  /* The detail drawer — identical content in both layouts. */
  const details = (item: SihCatalogItem) => {
    const ext = exteriorMeta(item.exterior);
    return (
      <div className="grid gap-5 px-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="microlabel">Market name</p>
          <p className="readout mt-1.5 break-words text-[13px]">{item.marketHashName}</p>
        </div>
        <div>
          <p className="microlabel">Flags</p>
          <p className="mt-1.5 text-[14px] text-[color:var(--color-text)]">
            {[
              item.isStatTrak ? "StatTrak™" : null,
              item.isSouvenir ? "Souvenir" : null,
              item.phase,
            ]
              .filter(Boolean)
              .join(" · ") || "None"}
          </p>
        </div>
        <div>
          <p className="microlabel">In stock</p>
          <p className="readout mt-1.5 text-[14px]">{item.count}</p>
        </div>
        <div>
          <p className="microlabel">Wear</p>
          <WearDiagram exterior={item.exterior} className="mt-2" compact />
          {ext ? (
            <p className="mt-1.5 text-[13px] text-[color:var(--color-text-tertiary)]">
              {ext.label}
            </p>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Table, from md up ─────────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] md:block">
        <table className="parts-table" style={{ ["--parts-sticky-top" as string]: "0px" }}>
          <caption className="sr-only">
            Skins in stock, listed with grade, exterior, float range and price
          </caption>
          <thead>
            <tr>
              <th scope="col" className="microlabel">Designation</th>
              <th scope="col" className="microlabel">Grade</th>
              <th scope="col" className="microlabel">Exterior</th>
              <th scope="col" className="microlabel">Float</th>
              <th scope="col" className="microlabel text-right">Price</th>
              <th scope="col" className="microlabel text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const ext = exteriorMeta(item.exterior);
              const open = expanded === item.slug;
              return [
                <tr key={item.slug}>
                  <td>
                    <Link
                      href={`/store/${item.slug}`}
                      className="block min-w-0 font-medium text-[color:var(--color-text)] hover:text-[color:var(--color-accent)]"
                    >
                      <span className="block truncate text-[15px]">{designation(item)}</span>
                      <span className="microlabel block truncate">
                        {item.weapon ?? item.category}
                      </span>
                    </Link>
                  </td>
                  <td>
                    <RarityTag rarity={item.rarity} color={item.rarityColor} />
                  </td>
                  <td>
                    <span
                      className="readout text-[13px] font-semibold"
                      style={{ color: wearInk(ext?.short) }}
                    >
                      {ext ? ext.short : "—"}
                    </span>
                  </td>
                  <td>
                    <span className="readout text-[13px]">
                      {ext ? `${ext.floatMin.toFixed(2)}–${ext.floatMax.toFixed(2)}` : "—"}
                    </span>
                  </td>
                  <td className="text-right">
                    <span className="readout text-[16px] font-semibold">
                      {format(item.price, "USD")}
                    </span>
                    {item.discountPct != null && item.discountPct > 0 && item.steamPrice != null ? (
                      <span className="readout ml-2 text-[12px] text-[color:var(--color-text-tertiary)] line-through">
                        {format(item.steamPrice, "USD")}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setExpanded(open ? null : item.slug)}
                        aria-expanded={open}
                        aria-label={`${open ? "Hide" : "Show"} details for ${designation(item)}`}
                        className="focus-amber inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-accent)]"
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      <Link
                        href={`/store/${item.slug}`}
                        className="focus-amber inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-3 text-[14px] font-semibold text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                      >
                        View <ArrowRight size={13} />
                      </Link>
                    </span>
                  </td>
                </tr>,
                open ? (
                  <tr key={`${item.slug}-detail`}>
                    <td colSpan={6} className="!p-0">
                      <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
                        {details(item)}
                      </div>
                    </td>
                  </tr>
                ) : null,
              ];
            })}
          </tbody>
        </table>
      </div>

      {/* ── Stacked cards, below md ───────────────────────────────── */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => {
          const ext = exteriorMeta(item.exterior);
          const open = expanded === item.slug;
          return (
            <li
              key={item.slug}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]"
            >
              <div className="flex items-start justify-between gap-3 p-4">
                <Link href={`/store/${item.slug}`} className="min-w-0">
                  <span className="microlabel block truncate">{item.weapon ?? item.category}</span>
                  <span className="font-display mt-1 block truncate text-[16px] font-semibold text-[color:var(--color-text)]">
                    {designation(item)}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <RarityTag rarity={item.rarity} color={item.rarityColor} />
                    <span
                      className="readout text-[13px] font-semibold"
                      style={{ color: wearInk(ext?.short) }}
                    >
                      {ext ? ext.short : "—"}
                    </span>
                  </span>
                </Link>
                <span className="shrink-0 text-right">
                  <span className="readout block text-[18px] font-semibold">
                    {format(item.price, "USD")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : item.slug)}
                    aria-expanded={open}
                    className="focus-amber mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[color:var(--color-accent)]"
                  >
                    {open ? "Less" : "Details"}
                    <ChevronDown size={13} className={open ? "rotate-180" : ""} />
                  </button>
                </span>
              </div>
              {open ? (
                <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
                  {details(item)}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
