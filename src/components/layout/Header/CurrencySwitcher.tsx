"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency, type Currency } from "@/providers/CurrencyProvider";

const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
];

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = CURRENCIES.find((c) => c.code === currency)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${current.label}`}
        className="focus-amber inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border border-transparent px-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-border)] hover:text-[color:var(--color-accent)]"
      >
        <span aria-hidden>{current.symbol}</span>
        <span>{current.code}</span>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 min-w-[150px] overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-lg)]"
        >
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              role="option"
              aria-selected={c.code === currency}
              onClick={() => {
                setCurrency(c.code);
                setOpen(false);
              }}
              className={`block w-full px-3.5 py-2.5 text-left font-mono text-[12px] font-medium uppercase tracking-[0.1em] transition-colors ${
                c.code === currency
                  ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                  : "text-[color:var(--color-text)] hover:bg-[color:var(--color-accent-tint)] hover:text-[color:var(--color-accent)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
