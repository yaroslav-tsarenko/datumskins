"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Package, ExternalLink } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { useCurrency } from "@/providers/CurrencyProvider";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { statusMeta } from "@/lib/sih/status-labels";

interface SihOrderView {
  id: string;
  marketHashName: string;
  price: number;
  currency: string;
  status: string;
  error: string | null;
  senderNickname: string | null;
  senderOfferId: string | null;
  senderTimeout: string | null;
  exterior: string | null;
  rarityColor: string | null;
  imageUrl: string | null;
  createdAt: string;
  paidAt: string | null;
  finishedAt: string | null;
}

const POLL_MS = 8000;

export function MyPurchasesClient() {
  const search = useSearchParams();
  const highlightId = search.get("order");
  const { format: fmt } = useCurrency();

  const [orders, setOrders] = useState<SihOrderView[] | null>(null);
  const [unauth, setUnauth] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/sih/orders", { cache: "no-store" });
      if (res.status === 401) {
        setUnauth(true);
        setOrders([]);
        return;
      }
      const data = await res.json();
      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch {
      setOrders((prev) => prev ?? []);
    }
  }, []);

  // Initial load + poll while any order is still moving.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      await load();
      if (cancelled) return;
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    if (!orders) return;
    const anyInFlight = orders.some((o) => statusMeta(o.status).inFlight);
    if (timer.current) clearTimeout(timer.current);
    if (anyInFlight) {
      timer.current = setTimeout(load, POLL_MS);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [orders, load]);

  if (orders === null) return <div className="mt-8"><LoadingSpinner /></div>;

  if (unauth) {
    return (
      <div className="mt-8">
        <EmptyState
          title="Sign in to see your purchases"
          subtitle="Your orders are tied to your account."
          actionLabel="Sign in"
          actionHref="/auth/login"
          icon={<Package size={40} strokeWidth={1.5} />}
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          title="No purchases yet"
          subtitle="Skins you buy are issued here as sheets, with their delivery status."
          actionLabel="Open the index"
          actionHref="/store"
          icon={<Package size={40} strokeWidth={1.5} />}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      {orders.map((o) => {
        const meta = statusMeta(o.status);
        const highlighted = o.id === highlightId;
        return (
          <div
            key={o.id}
            className={`relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-lg)] border bg-[color:var(--color-bg-elevated)] px-5 py-5 sm:flex-row sm:items-center sm:gap-6 ${
              highlighted
                ? "border-[color:var(--color-accent)] shadow-[var(--shadow-md)]"
                : "border-[color:var(--color-line)]"
            }`}
            style={o.rarityColor ? ({ ["--rarity" as string]: o.rarityColor }) : undefined}
          >
            {o.rarityColor ? (
              <span aria-hidden className="rarity-rule absolute inset-x-0 top-0 h-[3px]" />
            ) : null}

            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
              {o.imageUrl ? (
                <Image
                  src={o.imageUrl}
                  alt={o.marketHashName}
                  fill
                  sizes="96px"
                  className="object-contain p-1"
                  unoptimized
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-display truncate text-[16px] font-semibold tracking-[-0.015em] text-[color:var(--color-text)]">
                {o.marketHashName}
              </div>
              <div className="readout mt-1.5 text-[13px] text-[color:var(--color-text-tertiary)]">
                {format(new Date(o.createdAt), "MMM d, yyyy • HH:mm")}
                {o.exterior && o.exterior !== "NA" ? ` • ${o.exterior}` : ""}
              </div>

              {o.status === "sent" && o.senderOfferId ? (
                <a
                  href={`https://steamcommunity.com/tradeoffer/${o.senderOfferId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[color:var(--color-accent)] hover:underline"
                >
                  Open trade offer
                  <ExternalLink size={12} />
                </a>
              ) : null}

              {(o.status === "failed" || o.status === "refund_pending" || o.status === "rolled_back") ? (
                <div className="mt-3 rounded-[var(--radius-md)] border-l-[3px] border-[color:var(--color-danger)] bg-[color:var(--color-danger-light)] px-3 py-2 text-[14px] text-[color:var(--color-danger)]">
                  {o.status === "failed"
                    ? "Delivery failed. A refund is being processed."
                    : o.status === "rolled_back"
                      ? "The trade was rolled back. A refund is being processed."
                      : "Refund in progress. We'll return your payment shortly."}
                  {o.error ? ` (${o.error})` : ""}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
              <Chip size="sm" color={meta.color}>
                {meta.label}
              </Chip>
              <span className="readout whitespace-nowrap text-[20px] font-semibold leading-none text-[color:var(--color-text)]">
                {fmt(o.price, "USD")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
