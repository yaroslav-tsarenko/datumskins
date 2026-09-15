"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, Zap, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { exteriorMeta } from "@/lib/skins/shared";
import type { SihItemDetail, SihCatalogItem } from "@/lib/sih/queries";
import { useCurrency } from "@/providers/CurrencyProvider";
import { SihItemCard } from "./SihItemCard";
import { Stamp, SpecTag, SheetNum } from "@/components/ui/Stamp";
import { WearDiagram, TitleBlock } from "@/components/ui/WearDiagram";
import { Callout } from "@/components/ui/Callout";
import { RarityTag, RarityRule, rarityVars } from "@/components/ui/RarityTag";
import { SectionHead } from "@/components/ui/SectionHead";

export type SihPurchaseState = "anon" | "no-steam" | "no-trade-url" | "ready";

/**
 * The item page.
 *
 * This is one of the three places the drawing language is allowed to run at
 * full strength: the render sits on a `.drafting-field` stage inside a double
 * rule, with up to three callout leaders annotating it.
 *
 * The rule that makes the callouts safe: **every value a leader points at is
 * also printed in the specification table below it.** The lines are charm, not
 * infrastructure — hide them and the page still tells you everything.
 *
 * Nothing on this page is estimated. Where the catalogue has no exact float,
 * the gauge brackets the zone and the caption says why.
 */
export function SihItemDetailClient({
  item,
  related,
  purchaseState,
}: {
  item: SihItemDetail;
  related: SihCatalogItem[];
  purchaseState: SihPurchaseState;
}) {
  const { format } = useCurrency();
  const router = useRouter();
  const ext = exteriorMeta(item.exterior);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const soldOut = item.count <= 0;
  const hasDiscount = item.steamPrice != null && item.discountPct != null && item.discountPct > 0;

  const title =
    item.skinName ||
    item.name.replace(/^(StatTrak™ |Souvenir |★ )/, "").split(" | ").slice(1).join(" | ") ||
    item.name;

  async function handleBuy() {
    setError(null);
    if (purchaseState === "anon") {
      router.push(`/auth/login?next=/store/${item.slug}`);
      return;
    }
    if (purchaseState === "no-steam" || purchaseState === "no-trade-url") {
      router.push("/sell");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/sih/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketHashName: item.marketHashName }),
      });
      const data = (await res.json()) as { paymentUrl?: string; error?: string };
      if (!res.ok || !data.paymentUrl) {
        setError(data.error ?? "Unable to start checkout. Please try again.");
        setBusy(false);
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  const buyLabel = (() => {
    if (soldOut) return "Out of stock";
    if (item.stale) return "Refreshing price…";
    if (purchaseState === "anon") return "Sign in to buy";
    if (purchaseState === "no-steam") return "Link Steam to buy";
    if (purchaseState === "no-trade-url") return "Add trade URL to buy";
    return `Buy now · ${format(item.price, "USD")}`;
  })();

  return (
    <div className="mx-auto w-full max-w-[var(--max-width)] px-5 py-8 sm:px-6 lg:px-8">
      <Link
        href="/store"
        className="mb-7 inline-flex items-center gap-2 text-[15px] font-medium text-[color:var(--color-text-secondary)] transition-colors hover:text-[color:var(--color-accent)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all skins
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* ── The drawing stage — one of three places the grid appears. ── */}
        <div>
          <div className="sheet sheet-featured drafting-field relative flex aspect-[4/3] items-center justify-center overflow-hidden">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                className="relative h-full w-full object-contain p-14"
              />
            ) : (
              <span className="microlabel relative">No render on file</span>
            )}

            {/*
             * Three callouts, no more — and each one repeats a row of the
             * specification table below, never replaces it.
             */}
            <span className="absolute left-5 top-[28%] hidden sm:block">
              <Callout>{item.rarity ?? "Grade unstated"}</Callout>
            </span>
            {ext ? (
              <span className="absolute bottom-[30%] right-5 hidden sm:block">
                <Callout side="left">{ext.label}</Callout>
              </span>
            ) : null}
            {!soldOut ? (
              <span className="absolute bottom-[12%] left-5 hidden sm:block">
                <Callout>{item.count} in stock</Callout>
              </span>
            ) : null}

            {/* One stamp on the stage, at most. */}
            {hasDiscount ? (
              <span className="absolute right-5 top-5">
                <Stamp press>−{item.discountPct}% vs Steam</Stamp>
              </span>
            ) : soldOut ? (
              <span className="absolute right-5 top-5">
                <Stamp tone="hold" tilt="right" press>
                  Out of stock
                </Stamp>
              </span>
            ) : null}
          </div>

          <RarityRule className="mt-4 rounded-[2px]" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="readout truncate text-[13px] text-[color:var(--color-text-tertiary)]">
              {item.marketHashName}
            </span>
            <SheetNum sheet={1} rev="A" />
          </div>
        </div>

        {/* ── The specification ────────────────────────────────────── */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <RarityTag rarity={item.rarity} color={item.rarityColor} />
            {item.isStatTrak ? <SpecTag tone="hold">StatTrak™</SpecTag> : null}
            {item.isSouvenir ? <SpecTag tone="approve">Souvenir</SpecTag> : null}
            {item.phase ? <SpecTag tone="ink">{item.phase}</SpecTag> : null}
          </div>

          <p className="microlabel mt-5">{item.weapon ?? item.category}</p>
          <h1 className="drawing-title mt-2 text-[clamp(1.9rem,4.4vw,2.9rem)]">{title}</h1>

          {/* Price */}
          <div className="mt-8">
            <span className="label">Price</span>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <span className="readout text-[clamp(2.1rem,5.4vw,3rem)] font-semibold leading-none">
                {format(item.price, "USD")}
              </span>
              {hasDiscount ? (
                <span className="flex flex-col gap-1 pb-1">
                  <span className="readout text-[14px] text-[color:var(--color-text-tertiary)] line-through">
                    {format(item.steamPrice!, "USD")}
                  </span>
                  <span className="text-[14px] font-semibold text-[color:var(--color-success)]">
                    −{item.discountPct}% vs Steam
                  </span>
                </span>
              ) : null}
            </div>
            <p className="mt-2.5 text-[15px] text-[color:var(--color-text-secondary)]">
              {soldOut ? "Currently unavailable" : `${item.count} in stock`}
            </p>
          </div>

          <button
            onClick={handleBuy}
            disabled={busy || soldOut || item.stale}
            className="focus-amber mt-7 inline-flex h-14 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-primary-strong)] px-6 text-[16px] font-semibold text-[color:var(--color-primary-fg)] transition-all hover:bg-[color:var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] active:translate-y-px active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {busy ? "Starting checkout…" : buyLabel}
          </button>

          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-danger-light)] px-4 py-3 text-[15px] text-[color:var(--color-danger)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}
          {item.stale && !soldOut && (
            <p className="mt-4 text-[15px] text-[color:var(--color-text-secondary)]">
              Live price is being refreshed — check back in a moment.
            </p>
          )}

          {/* The wear gauge, on a clean white card. */}
          <div className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="label">Wear</span>
              <span className="readout text-[14px] font-semibold">
                {ext ? `${ext.floatMin.toFixed(2)} – ${ext.floatMax.toFixed(2)}` : "Not stated"}
              </span>
            </div>
            <WearDiagram exterior={item.exterior} className="mt-4" />
            <p className="measure mt-4 text-[14px] leading-relaxed text-[color:var(--color-text-secondary)]">
              The listing states an exterior, not a per-item float, so the gauge brackets the zone
              rather than pointing at a decimal we do not have.
            </p>
          </div>

          {/* The specification table — the single source of truth on this page. */}
          <TitleBlock
            className="mt-6"
            caption="Specifications"
            rows={[
              { label: "Designation", value: title, mono: false },
              { label: "Category", value: item.weapon ?? item.category, mono: false },
              { label: "Exterior", value: ext ? ext.label : "Not stated", mono: false },
              {
                label: "Float",
                value: ext ? `${ext.floatMin.toFixed(2)} – ${ext.floatMax.toFixed(2)}` : "—",
                strong: true,
              },
              { label: "Grade", value: item.rarity ?? "—", mono: false },
              item.phase ? { label: "Phase", value: item.phase, mono: false } : null,
              { label: "StatTrak™", value: item.isStatTrak ? "Yes" : "No", mono: false },
              { label: "Souvenir", value: item.isSouvenir ? "Yes" : "No", mono: false },
              { label: "In stock", value: String(item.count) },
              { label: "Price", value: format(item.price, "USD"), strong: true },
              { label: "Market name", value: item.marketHashName, mono: false },
            ]}
          />

          {/* Approvals — plain, no drawing furniture. */}
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Approval icon={<Truck className="h-5 w-5" />} title="Steam delivery" body="Sent as a trade offer" />
            <Approval icon={<ShieldCheck className="h-5 w-5" />} title="Buyer protection" body="Refund if undelivered" />
            <Approval icon={<Zap className="h-5 w-5" />} title="Fast dispatch" body="Automated fulfilment" />
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHead
            eyebrow="Related"
            title={<>More {item.weapon ?? item.category}</>}
            action={
              <Link
                href={`/store?${item.weapon ? `weapon=${encodeURIComponent(item.weapon)}` : `category=${encodeURIComponent(item.category)}`}`}
                className="text-[15px] font-semibold text-[color:var(--color-accent)] hover:underline"
              >
                See all
              </Link>
            }
          />
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((r, i) => (
              <SihItemCard key={r.slug} item={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Approval({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-4">
      <span className="mt-0.5 shrink-0 text-[color:var(--color-accent)]">{icon}</span>
      <div>
        <p className="text-[15px] font-semibold text-[color:var(--color-text)]">{title}</p>
        <p className="mt-0.5 text-[14px] text-[color:var(--color-text-secondary)]">{body}</p>
      </div>
    </li>
  );
}
