"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { openCookieSettings } from "@/components/shared/CookieConsent/CookieConsent";
import { ArrowRight, Mail, ShieldCheck, ChevronDown, Globe, Check } from "lucide-react";
import Image from "next/image";
import { DatumskinsLogo } from "../DatumskinsLogo";
import { brand, brandAddressLine } from "@/lib/brand";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Stamp } from "@/components/ui/Stamp";
import visaLogo from "@/assets/visa.svg";
import mastercardLogo from "@/assets/mastercard.svg";
import pciDssLogo from "@/assets/pci-dss.svg";

const paymentBadges = [
  { src: visaLogo, label: "Visa" },
  { src: mastercardLogo, label: "Mastercard" },
  { src: pciDssLogo, label: "PCI DSS Compliant" },
];

interface Group {
  key: string;
  sheet: string;
  title: string;
  items: Array<{ href: string; label: string }>;
}

const groups: Group[] = [
  {
    key: "shop",
    sheet: "01",
    title: "Catalogue",
    items: [
      { href: "/store", label: "All skins" },
      { href: "/store?category=Rifles", label: "Rifles" },
      { href: "/store?category=Pistols", label: "Pistols" },
      { href: "/store?category=Knives", label: "Knives" },
      { href: "/store?category=Gloves", label: "Gloves" },
      { href: "/store?sort=newest", label: "Newest listings" },
      { href: "/store?sort=price_asc", label: "Lowest price first" },
    ],
  },
  {
    key: "support",
    sheet: "02",
    title: "Procedure",
    items: [
      { href: "/faq", label: "FAQ" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/policies/shipping", label: "Delivery" },
      { href: "/policies/returns", label: "Refunds" },
      { href: "/my-purchases", label: "My purchases" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    key: "company",
    sheet: "03",
    title: "Company",
    items: [
      { href: "/about", label: "About us" },
      { href: "/store?rarity=Covert", label: "Covert grade" },
      { href: "/store?rarity=Extraordinary", label: "Knives & gloves" },
      { href: "/policies", label: "All policies" },
    ],
  },
];

const legalLinks = [
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
  { href: "/policies/cookies", label: "Cookies" },
  { href: "/policies/returns", label: "Refund Policy" },
  { href: "/policies/payment", label: "Payment" },
  { href: "/policies/shipping", label: "Delivery" },
];

/** A footer column: a plain list from `md` up, a disclosure on phones. */
function LinkGroup({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[color:var(--color-border)] md:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left md:hidden"
      >
        <span className="flex items-center gap-2">
          <span className="index-num text-[11px]">{group.sheet}</span>
          <span className="font-display text-[15px] font-semibold text-[color:var(--color-text)]">
            {group.title}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`text-[color:var(--color-accent)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <h3 className="hidden pb-3 md:block">
        <span className="flex items-center gap-2">
          <span className="index-num text-[10px]">{group.sheet}</span>
          <span className="label text-[10px] text-[color:var(--color-accent)]">{group.title}</span>
        </span>
        <span aria-hidden className="dim-line mt-2 block w-full opacity-70" />
      </h3>
      <ul className={`grid grid-cols-1 gap-y-2 pb-4 md:gap-y-2.5 ${open ? "grid" : "hidden md:grid"}`}>
        {group.items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              className="text-[13.5px] text-[color:var(--color-text-secondary)] transition-colors hover:text-[color:var(--color-accent)]"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Stock notices. Posts to the same newsletter endpoint the rest of the site
 *  uses; the only promise made is the one the endpoint keeps. */
function StockNotices() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("busy");
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        setState("error");
        setMessage("That didn't go through. Check the address and try again.");
        return;
      }
      setState("done");
    } catch {
      setState("error");
      setMessage("Network error. Try again in a moment.");
    }
  }

  if (state === "done") {
    return (
      <p className="inline-flex items-center gap-2 border border-[color:var(--color-success)] px-3 py-2.5 text-[13px] font-semibold text-[color:var(--color-success)]">
        <Check size={15} /> Added to the distribution list.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <div className="flex items-stretch border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)]">
        <label htmlFor="stock-notices" className="sr-only">
          Email address
        </label>
        <input
          id="stock-notices"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "busy"}
          className="shrink-0 bg-[color:var(--color-accent)] px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-fg)] transition-colors hover:bg-[color:var(--color-accent-hover)] disabled:opacity-60"
        >
          {state === "busy" ? "…" : "Subscribe"}
        </button>
      </div>
      {message ? (
        <p className="mt-2 text-[12px] text-[color:var(--color-danger)]">{message}</p>
      ) : null}
    </form>
  );
}

/**
 * The cyanotype footer — the one band printed the classic way round: white
 * linework on deep blue. It closes every page the way a drawing set closes,
 * with the index of sheets and then the title block: who issued this, under
 * what number, from what address.
 */
export function Footer() {
  const t = useTranslations("footer");
  const { currency, symbol } = useCurrency();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="cyanotype mt-auto" role="contentinfo">
      <hr className="tape-rule border-0" />

      {/* ── Tier 1 — the statement + stock notices ───────────────── */}
      <div className="mx-auto grid max-w-[1360px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:px-8">
        <div>
          <Link href="/" aria-label={brand.displayName}>
            <DatumskinsLogo size={24} />
          </Link>
          <p className="font-display mt-7 max-w-[14ch] text-[clamp(1.9rem,4.6vw,3rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[color:var(--color-text)]">
            {brand.tagline}
          </p>
          <a
            href={`mailto:${brand.contact.email}`}
            className="mt-6 inline-flex items-center gap-2 text-[13.5px] text-[color:var(--color-text-secondary)] transition-colors hover:text-[color:var(--color-accent)]"
          >
            <Mail size={14} />
            {brand.contact.email}
          </a>
        </div>

        <div className="lg:pb-2">
          <span className="label text-[10px]">Stock notices</span>
          <p className="mb-4 mt-2 text-[13.5px] text-[color:var(--color-text-secondary)]">
            A note when new stock is listed. Nothing else.
          </p>
          <StockNotices />
          <Link
            href="/store"
            className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)] hover:underline"
          >
            Open the catalogue <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Tier 2 — the index of sheets ─────────────────────────── */}
      <div className="border-t border-[color:var(--color-border)]">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-x-8 px-4 sm:px-6 md:grid-cols-4 md:py-10 lg:px-8">
          {groups.map((g) => (
            <LinkGroup key={g.key} group={g} />
          ))}
          <LinkGroup
            group={{
              key: "legal",
              sheet: "04",
              title: "Legal",
              items: legalLinks,
            }}
          />
        </div>
      </div>

      {/* ── Tier 3 — the approvals row ───────────────────────────── */}
      <div className="border-t border-[color:var(--color-border)]">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {paymentBadges.map(({ src, label }) => (
              <span
                key={label}
                title={label}
                className="relative inline-flex h-8 w-14 items-center justify-center bg-white px-2.5 py-2"
              >
                <Image src={src} alt={label} fill sizes="56px" className="object-contain p-1.5" />
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Stamp tone="approve" tilt="none">
              <ShieldCheck size={12} /> Secure checkout
            </Stamp>
            <button
              type="button"
              onClick={openCookieSettings}
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)] transition-colors hover:text-[color:var(--color-accent)]"
            >
              Cookie preferences
            </button>
            <span className="inline-flex items-center gap-2 border border-[color:var(--color-border)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)]">
              <Globe size={11} className="text-[color:var(--color-accent)]" />
              {currency} {symbol}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tier 4 — the title block ─────────────────────────────── */}
      <div className="border-t border-[color:var(--color-border)]">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-4 py-6 text-[color:var(--color-text-secondary)] sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
          <div className="flex flex-col gap-1.5 text-[12px]">
            <p className="readout text-[11.5px] text-[color:var(--color-text)]">
              {t("copyright", { year: currentYear, storeName: brand.displayName })}
            </p>
            <p className="text-[11.5px] text-[color:var(--color-text-tertiary)]">
              {brand.company.legalName} · Company No. {brand.company.number} · {brandAddressLine}
            </p>
            <p className="max-w-xl text-[11.5px] leading-relaxed text-[color:var(--color-text-tertiary)]">
              Not affiliated with Valve Corporation. Counter-Strike is a trademark of Valve
              Corporation. All skin names and images are the property of their respective owners.
            </p>
          </div>

          <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px]">
            {legalLinks.slice(0, 4).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-[color:var(--color-accent)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
