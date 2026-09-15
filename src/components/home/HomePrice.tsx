"use client";

import { useCurrency } from "@/providers/CurrencyProvider";

/**
 * A bare price in the header currency, with no wrapper of its own — so the
 * annotation around it can own the type size and the price just inherits it.
 * Catalogue prices are stored in USD.
 */
export function HomePrice({ usd }: { usd: number }) {
  const { format } = useCurrency();
  return <>{format(usd, "USD")}</>;
}
