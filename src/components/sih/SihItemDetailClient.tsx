"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, Zap, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { exteriorMeta } from "@/lib/skins/shared";
import type { SihItemDetail, SihCatalogItem } from "@/lib/sih/queries";
import { useCurrency } from "@/providers/CurrencyProvider";
import { SihItemCard } from "./SihItemCard";
import { Stamp, SpecTag, SheetNum, DimLine } from "@/components/ui/Stamp";
import { WearDiagram, TitleBlock } from "@/components/ui/WearDiagram";
import { Callout } from "@/components/ui/Callout";
import { RarityTag, RarityRule, rarityVars } from "@/components/ui/RarityTag";
import { SectionHead } from "@/components/ui/SectionHead";

export type SihPurchaseState = "anon" | "no-steam" | "no-trade-url" | "ready";

/**
 * The item page as a full drawing sheet.
 *
 * Left: the render on gridded paper inside a double-ruled frame, with leader
 * lines calling out the two facts that decide a purchase — the grade and the
 * exterior. Right: the designation, the title block carrying every stated
 * specification, the wear diagram against real zone boundaries, the price
 * dimensioned off a heavy rule, and one inspection-red action.
 *
 * Every value on this sheet comes from the listing. Nothing is estimated and
 * nothing is invented — where the catalogue has no exact float, the sheet says
 * so and annotates the zone instead.
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
    <div className="mx-auto w-full max-w-[var(--max-width)] px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/store"
        className="mb-5 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)] transition-colors hover:text-[color:var(--color-accent)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to the index
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        {/* ── The drawing ──────────────────────────────────────── */}
        <div className="group" style={rarityVars(item.rarityColor)}>
          <div className="sheet sheet-featured reg-marks relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[color:var(--color-bg-elevated)]">
            <span aria-hidden className="gridded pointer-events-none absolute inset-0 opacity-70" />

            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                className="relative h-full w-full object-contain p-12"
              />
            ) : (
              <>
                <span aria-hidden className="hatch absolute inset-10" />
                <span className="microlabel relative">No render on file</span>
              </>
            )}

            {/* Leader lines out to the two facts that decide a purchase. */}
            <span className="absolute left-4 top-1/3 hidden sm:block">
              <Callout>{item.rarity ?? "Grade unstated"}</Callout>
            </span>
            {ext ? (
              <span className="absolute bottom-10 right-4 hidden sm:block">
                <Callout side="left">{ext.label}</Callout>
              </span>
            ) : null}

            {/* Stamps — applied only when literally true. */}
            <div className="absolute left-5 top-4 flex flex-col items-start gap-2.5">
              {hasDiscount ? <Stamp press>−{item.discountPct}% vs Steam</Stamp> : null}
              {soldOut ? (
                <Stamp tone="hold" tilt="right" press>
                  Out of stock
                </Stamp>
              ) : null}
            </div>

            <span className="absolute bottom-2 right-3">
              <SheetNum sheet={1} rev="A" />
            </span>
          </div>
          <RarityRule className="mt-3" />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="microlabel truncate">{item.marketHashName}</span>
            <span className="microlabel shrink-0">Scale 1:1</span>
          </div>
        </div>

        {/* ── The specification ────────────────────────────────── */}
        <div className="flex flex-col">
          <DimLine />

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <RarityTag rarity={item.rarity} color={item.rarityColor} />
            {item.isStatTrak ? <SpecTag tone="hold">StatTrak™</SpecTag> : null}
            {item.isSouvenir ? <SpecTag tone="approve">Souvenir</SpecTag> : null}
            {item.phase ? <SpecTag tone="ink">{item.phase}</SpecTag> : null}
          </div>

          <p className="microlabel mt-4">{item.weapon ?? item.category}</p>
          <h1 className="drawing-title mt-1.5 text-[clamp(1.9rem,4.6vw,3rem)]">{title}</h1>

          {/* Wear — drawn, then stated. */}
          <div className="mt-6 border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="label text-[10px]">Wear diagram</span>
              <span className="microlabel">
                {ext ? `${ext.floatMin.toFixed(2)} – ${ext.floatMax.toFixed(2)}` : "Not stated"}
              </span>
            </div>
            <WearDiagram exterior={item.exterior} className="mt-3" />
            <p className="mt-2 text-[11.5px] leading-relaxed text-[color:var(--color-text-tertiary)]">
              The listing states an exterior, not a per-item float, so the diagram brackets the zone
              rather than pointing at a decimal we do not have.
            </p>
          </div>

          {/* Price, dimensioned off a heavy rule. */}
          <div className="mt-7 border-t-2 border-[color:var(--color-accent)] pt-5">
            <span className="label text-[10px]">Price</span>
            <div className="mt-2 flex flex-wrap items-end gap-4">
              <span className="readout text-[clamp(2.1rem,5.6vw,3.25rem)] font-semibold leading-none text-[color:var(--color-text)]">
                {format(item.price, "USD")}
              </span>
              {hasDiscount ? (
                <span className="flex flex-col pb-1">
                  <span className="readout text-[13px] text-[color:var(--color-text-tertiary)] line-through">
                    {format(item.steamPrice!, "USD")}
                  </span>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-success)]">
                    −{item.discountPct}% vs Steam
                  </span>
                </span>
              ) : null}
            </div>
            <p className="readout mt-2 text-[11px] text-[color:var(--color-text-tertiary)]">
              {soldOut ? "Currently unavailable" : `${item.count} in stock`}
            </p>
          </div>

          <button
            onClick={handleBuy}
            disabled={busy || soldOut || item.stale}
            className="focus-amber mt-6 inline-flex h-14 items-center justify-center gap-2 border border-[color:var(--color-primary-strong)] bg-[color:var(--color-primary-strong)] px-6 text-[15px] font-semibold text-[color:var(--color-primary-fg)] transition-all hover:bg-[color:var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] active:translate-y-px active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {busy ? "Starting checkout…" : buyLabel}
          </button>

          {error && (
            <p className="mt-3 flex items-center gap-1.5 border-l-2 border-[color:var(--color-danger)] bg-[color:var(--color-danger-light)] px-3 py-2 text-sm text-[color:var(--color-danger)]">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </p>
          )}
          {item.stale && !soldOut && (
            <p className="readout mt-3 text-[11px] text-[color:var(--color-text-tertiary)]">
              Live price is being refreshed — check back in a moment.
            </p>
          )}

          {/* The title block — every stated specification, one per ruled row. */}
          <TitleBlock
            className="mt-7"
            caption="Specifications"
            rows={[
              { label: "Designation", value: title, mono: false },
              { label: "Category", value: item.weapon ?? item.category, mono: false },
              { label: "Exterior", value: ext ? ext.label : "Not stated", mono: false },
              {
                label: "Float range",
                value: ext ? `${ext.floatMin.toFixed(2)} – ${ext.floatMax.toFixed(2)}` : "—",
                strong: true,
              },
              { label: "Grade", value: item.rarity ?? "—", mono: false },
              item.phase ? { label: "Phase", value: item.phase, mono: false } : null,
              { label: "StatTrak™", value: item.isStatTrak ? "Yes" : "No" },
              { label: "Souvenir", value: item.isSouvenir ? "Yes" : "No" },
              { label: "In stock", value: String(item.count) },
              { label: "Market name", value: item.marketHashName, mono: false },
            ]}
          />

          {/* Approvals */}
          <div className="mt-6 grid grid-cols-1 gap-px bg-[color:var(--color-border)] sm:grid-cols-3">
            <Approval icon={<Truck className="h-4 w-4" />} title="Steam delivery" body="Sent as a trade offer" />
            <Approval icon={<ShieldCheck className="h-4 w-4" />} title="Buyer protection" body="Refund if undelivered" />
            <Approval icon={<Zap className="h-4 w-4" />} title="Fast dispatch" body="Automated fulfilment" />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHead
            sheet={2}
            eyebrow="Same section"
            title={<>More {item.weapon ?? item.category}</>}
            action={
              <Link
                href={`/store?${item.weapon ? `weapon=${encodeURIComponent(item.weapon)}` : `category=${encodeURIComponent(item.category)}`}`}
                className="inline-flex items-center gap-1.5 border-b border-[color:var(--color-primary)] pb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                See all
              </Link>
            }
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {related.map((r, i) => (
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
    <div className="flex items-start gap-2.5 bg-[color:var(--color-bg-elevated)] p-3">
      <span className="mt-0.5 text-[color:var(--color-accent)]">{icon}</span>
      <div>
        <p className="text-[12.5px] font-semibold text-[color:var(--color-text)]">{title}</p>
        <p className="text-[11.5px] text-[color:var(--color-text-secondary)]">{body}</p>
      </div>
    </div>
  );
}
