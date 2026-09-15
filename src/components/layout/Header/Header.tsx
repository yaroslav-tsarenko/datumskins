"use client";

import { useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Link2,
  Shield,
  Package,
  CornerDownLeft,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { AnimatePresence, motion } from "framer-motion";
import { DatumskinsLogo } from "../DatumskinsLogo";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Notation } from "@/components/ui/Notation";
import { brand } from "@/lib/brand";

/* Category tabs map onto the real catalogue facets, so every tab lands on a
   populated grid rather than an empty state. The index letter is the drawing
   reference, not decoration: A is the full set, B–H are its sections. */
const TABS: { index: string; label: string; href: string }[] = [
  { index: "A", label: "All", href: "/store" },
  { index: "B", label: "Rifles", href: "/store?category=Rifles" },
  { index: "C", label: "Pistols", href: "/store?category=Pistols" },
  { index: "D", label: "SMGs", href: "/store?category=SMGs" },
  { index: "E", label: "Heavy", href: "/store?category=Heavy" },
  { index: "F", label: "Knives", href: "/store?category=Knives" },
  { index: "G", label: "Gloves", href: "/store?category=Gloves" },
  { index: "H", label: "Best value", href: "/store?sort=price_asc" },
  { index: "J", label: "New", href: "/store?sort=newest" },
];

/* Rarity quick-filters — the colour chips that open the mega-panel. */
const RARE_LINKS: { label: string; href: string; color: string }[] = [
  { label: "Mil-Spec", href: "/store?rarity=Mil-Spec%20Grade", color: "var(--rarity-milspec-raw)" },
  { label: "Restricted", href: "/store?rarity=Restricted", color: "var(--rarity-restricted-raw)" },
  { label: "Classified", href: "/store?rarity=Classified", color: "var(--rarity-classified-raw)" },
  { label: "Covert", href: "/store?rarity=Covert", color: "var(--rarity-covert-raw)" },
  { label: "Extraordinary", href: "/store?rarity=Extraordinary", color: "var(--rarity-gold-raw)" },
  { label: "Contraband", href: "/store?rarity=Contraband", color: "var(--rarity-contraband-raw)" },
];

/* The index-lookup rows shown while the field is still empty. Every row is a
   real catalogue jump — no search history, no invented "trending" terms. */
const LOOKUP_ROWS: { sheet: string; label: string; href: string }[] = [
  { sheet: "01", label: "Knives", href: "/store?category=Knives" },
  { sheet: "02", label: "Gloves", href: "/store?category=Gloves" },
  { sheet: "03", label: "Covert grade", href: "/store?rarity=Covert" },
  { sheet: "04", label: "Factory New only", href: "/store?exterior=Factory%20New" },
  { sheet: "05", label: "Lowest price first", href: "/store?sort=price_asc" },
  { sheet: "06", label: "Newest listings", href: "/store?sort=newest" },
];

/* The notes strip runs the things the store can actually promise. */
const NOTES = [
  { label: "Delivered as a Steam trade offer" },
  { label: "Live stock · live prices" },
  { label: "Exterior and float range stated on every sheet" },
  { label: "Refunded in full if the trade fails" },
  { label: "Payment handled by the processor, never by us" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled((prev) => (prev ? y > 2 : y > 8));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrap.current && !searchWrap.current.contains(e.target as Node)) setLookupOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submitSearch = (q: string) => {
    const term = q.trim();
    setMobileOpen(false);
    setLookupOpen(false);
    router.push(term ? `/store?q=${encodeURIComponent(term)}` : "/store");
  };

  const currentPath = pathname || "/";
  const authHref = `/auth?next=${encodeURIComponent(currentPath)}`;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const displayName = user?.steam?.personaName || user?.name || user?.email || "Trader";
  const avatar = user?.steam?.avatarFull || user?.steam?.avatar || null;

  const tabActive = (href: string) => {
    const [path, qs] = href.split("?");
    if (currentPath !== path) return false;
    if (!qs) return true;
    // Only mark a filtered tab active when its parameter is actually applied.
    if (typeof window === "undefined") return false;
    const current = new URLSearchParams(window.location.search);
    const target = new URLSearchParams(qs);
    for (const [k, v] of target) if (current.get(k) !== v) return false;
    return true;
  };

  /* The index-lookup field: a ruled cell labelled INDEX, the entry line, and
     the return key drawn where a draughtsman would write the callout. */
  const searchForm = (variant: "desktop" | "mobile") => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitSearch(query);
      }}
      role="search"
      className="well flex h-10 items-stretch overflow-hidden"
    >
      <span
        aria-hidden
        className="hidden shrink-0 items-center gap-1.5 border-r border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] px-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)] sm:inline-flex"
      >
        <Search size={12} />
        Index
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setLookupOpen(true)}
        placeholder={
          variant === "desktop"
            ? "Look up a designation — AWP Dragon Lore, ★ Karambit, AK-47 Redline…"
            : "Look up a designation"
        }
        aria-label="Look up a skin designation"
        className="min-w-0 flex-1 bg-transparent px-3 text-[13.5px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Look up"
        className="inline-flex shrink-0 items-center gap-1.5 bg-[color:var(--color-accent)] px-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-fg)] transition-colors hover:bg-[color:var(--color-accent-hover)]"
      >
        <CornerDownLeft size={12} />
        <span className="hidden sm:inline">Find</span>
      </button>
    </form>
  );

  /* Ruled index rows — shown while the field is focused and still empty. */
  const lookupPanel = (
    <div className="absolute left-0 right-0 top-full z-40 mt-1 border border-[color:var(--color-accent)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-accent-tint)] px-3 py-1.5">
        <span className="label text-[10px]">Index of sections</span>
        <span className="microlabel">Or type a designation</span>
      </div>
      <ul>
        {LOOKUP_ROWS.map((row) => (
          <li key={row.href} className="border-b border-[color:var(--color-border)] last:border-b-0">
            <Link
              href={row.href}
              onClick={() => setLookupOpen(false)}
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-3 py-2 transition-colors hover:bg-[color:var(--color-accent-tint)]"
            >
              <span className="index-num text-[11px]">{row.sheet}</span>
              <span className="truncate text-[13px] text-[color:var(--color-text)]">{row.label}</span>
              <span aria-hidden className="dim-line w-10 opacity-60" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  const accountLinks = [
    { href: "/account", icon: UserIcon, label: "Profile" },
    { href: "/my-purchases", icon: Package, label: "My purchases" },
    { href: "/account/trade-url", icon: Link2, label: "Trade URL settings" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full" role="banner">
        {/* ── 1. The vellum notation strip ──────────────────────────── */}
        <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]">
          <div className="mx-auto flex h-9 max-w-[1360px] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <Notation entries={NOTES} className="min-w-0 flex-1" />
            <div className="flex shrink-0 items-center gap-2">
              <CurrencySwitcher />
              <span className="h-3 w-px bg-[color:var(--color-border)]" aria-hidden />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* ── 2. The main bar, on drafting paper ────────────────────── */}
        <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          <div
            className={[
              "mx-auto flex max-w-[1360px] items-center gap-3 px-4 transition-[padding] duration-[var(--dur-slow)] sm:px-6 lg:gap-6 lg:px-8",
              scrolled ? "py-2" : "py-3",
            ].join(" ")}
          >
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="focus-amber inline-flex h-10 w-10 shrink-0 items-center justify-center border border-transparent text-[color:var(--color-accent)] hover:border-[color:var(--color-border)] lg:hidden"
            >
              <Menu size={22} />
            </button>

            <Link href="/" aria-label={`${brand.displayName} — home`} className="shrink-0">
              <DatumskinsLogo size={scrolled ? 19 : 22} />
            </Link>

            <div ref={searchWrap} className="relative hidden min-w-0 flex-1 lg:block">
              {searchForm("desktop")}
              {lookupOpen && !query.trim() ? lookupPanel : null}
            </div>

            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              {!user ? (
                <Link
                  href={authHref}
                  className="focus-amber inline-flex h-10 items-center gap-2 border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-4 text-[13px] font-semibold text-[color:var(--color-accent-fg)] transition-colors hover:bg-[color:var(--color-accent-hover)]"
                >
                  <UserIcon size={15} />
                  <span>Sign in</span>
                </Link>
              ) : (
                <div
                  className="relative"
                  onMouseEnter={() => setAccountOpen(true)}
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={accountOpen}
                    className="focus-amber inline-flex h-10 items-center gap-2 border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] py-1 pl-1 pr-2.5 transition-colors hover:border-[color:var(--color-accent)]"
                  >
                    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden bg-[color:var(--color-accent-tint)] text-[color:var(--color-accent)]">
                      {avatar ? (
                        <Image src={avatar} alt="" fill sizes="32px" className="object-cover" />
                      ) : (
                        <UserIcon size={16} />
                      )}
                    </span>
                    <span className="hidden max-w-[120px] truncate text-[13px] font-semibold text-[color:var(--color-text)] sm:inline">
                      {displayName}
                    </span>
                    <ChevronDown size={14} className="hidden text-[color:var(--color-text-tertiary)] sm:inline" />
                  </button>
                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.14 }}
                        role="menu"
                        className="absolute right-0 top-full z-40 mt-1.5 w-64 overflow-hidden border border-[color:var(--color-accent)] bg-[color:var(--color-bg-elevated)] p-2 shadow-[var(--shadow-lg)]"
                      >
                        <div className="mb-2 flex items-center gap-3 border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-3">
                          <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-[color:var(--color-accent-tint)] text-[color:var(--color-accent)]">
                            {avatar ? (
                              <Image src={avatar} alt="" fill sizes="40px" className="object-cover" />
                            ) : (
                              <UserIcon size={18} />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-[color:var(--color-text)]">
                              {displayName}
                            </span>
                            <span
                              className={`microlabel block ${
                                user.steam?.tradeUrlVerified
                                  ? "text-[color:var(--color-success)]"
                                  : "text-[color:var(--color-warning)]"
                              }`}
                            >
                              {user.steam?.tradeUrlVerified ? "Trade ready" : "Trade URL needed"}
                            </span>
                          </span>
                        </div>
                        {accountLinks.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            role="menuitem"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-accent-tint)]"
                          >
                            <item.icon size={15} className="text-[color:var(--color-accent)]" />
                            {item.label}
                          </Link>
                        ))}
                        {isAdmin && (
                          <NextLink
                            href="/admin"
                            role="menuitem"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-accent-tint)]"
                          >
                            <Shield size={15} className="text-[color:var(--color-accent)]" />
                            Admin panel
                          </NextLink>
                        )}
                        <div className="my-1.5 h-px bg-[color:var(--color-border)]" />
                        <button
                          type="button"
                          onClick={() => {
                            setAccountOpen(false);
                            signOut();
                          }}
                          role="menuitem"
                          className="flex w-full items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-danger-light)] hover:text-[color:var(--color-danger)]"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* ── 3. The sheet index — sections A through J ─────────────── */}
          <div className="hidden border-t border-[color:var(--color-border)] lg:block">
            <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center gap-5 overflow-x-auto" aria-label="Primary">
                {TABS.map((t) => {
                  const active = tabActive(t.href);
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "group -mb-px flex shrink-0 items-center gap-1.5 border-b-2 py-2.5 transition-colors",
                        active
                          ? "border-[color:var(--color-primary)]"
                          : "border-transparent hover:border-[color:var(--color-border-strong)]",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden
                        className={[
                          "inline-flex h-[15px] w-[15px] items-center justify-center border font-mono text-[9px] font-semibold leading-none",
                          active
                            ? "border-[color:var(--color-primary)] text-[color:var(--color-primary)]"
                            : "border-[color:var(--color-border)] text-[color:var(--color-text-tertiary)] group-hover:border-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent)]",
                        ].join(" ")}
                      >
                        {t.index}
                      </span>
                      <span
                        className={[
                          "font-mono text-[11px] font-semibold uppercase tracking-[0.16em]",
                          active
                            ? "text-[color:var(--color-text)]"
                            : "text-[color:var(--color-text-secondary)] group-hover:text-[color:var(--color-accent)]",
                        ].join(" ")}
                      >
                        {t.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Lookup — mobile row */}
          <div className="border-t border-[color:var(--color-border)] px-4 py-2 lg:hidden">
            {searchForm("mobile")}
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-[#122448]/70 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-sm flex-col border-r border-[color:var(--color-accent)] bg-[color:var(--color-bg)] lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 340 }}
            >
              <div className="flex items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] px-5 py-4">
                <DatumskinsLogo size={19} />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="focus-amber inline-flex h-9 w-9 items-center justify-center border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto" aria-label="Mobile">
                <ul>
                  {TABS.map((t) => (
                    <li key={t.href} className="border-b border-[color:var(--color-border)]">
                      <Link
                        href={t.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-[color:var(--color-accent-tint)]"
                      >
                        <span
                          aria-hidden
                          className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-[color:var(--color-border)] font-mono text-[10px] font-semibold text-[color:var(--color-text-tertiary)]"
                        >
                          {t.index}
                        </span>
                        <span className="font-display text-[17px] font-semibold text-[color:var(--color-accent)]">
                          {t.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="px-5 pt-5">
                  <span className="label text-[10px]">By rarity</span>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {RARE_LINKS.map((r) => (
                      <Link
                        key={r.label}
                        href={r.href}
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex items-center gap-1.5 border border-[color:var(--color-border)] px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text)]"
                      >
                        <span className="h-2 w-2" style={{ background: r.color }} />
                        {r.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {user && (
                  <ul className="mt-5 border-t border-[color:var(--color-border)]">
                    {accountLinks.map((item) => (
                      <li key={item.href} className="border-b border-[color:var(--color-border)]">
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                        >
                          <item.icon size={17} className="text-[color:var(--color-accent)]" />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    {isAdmin && (
                      <li className="border-b border-[color:var(--color-border)]">
                        <NextLink
                          href="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                        >
                          <Shield size={17} className="text-[color:var(--color-accent)]" />
                          Admin panel
                        </NextLink>
                      </li>
                    )}
                  </ul>
                )}
              </nav>

              <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] px-5 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <ThemeToggle />
                  <span className="h-4 w-px bg-[color:var(--color-border)]" />
                  <CurrencySwitcher />
                </div>
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 border border-[color:var(--color-accent)] text-sm font-semibold text-[color:var(--color-accent)]"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                ) : (
                  <Link
                    href={authHref}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 bg-[color:var(--color-accent)] text-sm font-semibold text-[color:var(--color-accent-fg)]"
                  >
                    <UserIcon size={16} /> Sign in
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
