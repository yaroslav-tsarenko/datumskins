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
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { AnimatePresence, motion } from "framer-motion";
import { DatumskinsLogo } from "../DatumskinsLogo";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Notation } from "@/components/ui/Notation";
import { Stamp } from "@/components/ui/Stamp";
import { brand } from "@/lib/brand";

/* Tabs map onto real catalogue facets, so every tab lands on a populated grid
   rather than an empty state. */
const TABS: { label: string; href: string }[] = [
  { label: "All skins", href: "/store" },
  { label: "Rifles", href: "/store?category=Rifles" },
  { label: "Pistols", href: "/store?category=Pistols" },
  { label: "SMGs", href: "/store?category=SMGs" },
  { label: "Heavy", href: "/store?category=Heavy" },
  { label: "Knives", href: "/store?category=Knives" },
  { label: "Gloves", href: "/store?category=Gloves" },
  { label: "Best value", href: "/store?sort=price_asc" },
  { label: "New", href: "/store?sort=newest" },
];

/* The mega-panel: a clean white sheet with ordinary link lists. No ruled
   columns, no drawing furniture — it is navigation, not a diagram. */
const PANEL_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "By category",
    links: [
      { label: "Rifles", href: "/store?category=Rifles" },
      { label: "Pistols", href: "/store?category=Pistols" },
      { label: "SMGs", href: "/store?category=SMGs" },
      { label: "Heavy", href: "/store?category=Heavy" },
      { label: "Knives", href: "/store?category=Knives" },
      { label: "Gloves", href: "/store?category=Gloves" },
    ],
  },
  {
    title: "By grade",
    links: [
      { label: "Mil-Spec", href: "/store?rarity=Mil-Spec%20Grade" },
      { label: "Restricted", href: "/store?rarity=Restricted" },
      { label: "Classified", href: "/store?rarity=Classified" },
      { label: "Covert", href: "/store?rarity=Covert" },
      { label: "Extraordinary", href: "/store?rarity=Extraordinary" },
      { label: "Contraband", href: "/store?rarity=Contraband" },
    ],
  },
  {
    title: "By wear",
    links: [
      { label: "Factory New", href: "/store?exterior=FN" },
      { label: "Minimal Wear", href: "/store?exterior=MW" },
      { label: "Field-Tested", href: "/store?exterior=FT" },
      { label: "Well-Worn", href: "/store?exterior=WW" },
      { label: "Battle-Scarred", href: "/store?exterior=BS" },
    ],
  },
];

/* The notes strip runs the things the store can actually promise. */
const NOTES = [
  { label: "Delivered as a Steam trade offer" },
  { label: "Live stock, live prices" },
  { label: "Exterior and float range stated on every listing" },
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panelWrap = useRef<HTMLDivElement>(null);

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

  const submitSearch = (q: string) => {
    const term = q.trim();
    setMobileOpen(false);
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
    if (typeof window === "undefined") return false;
    const current = new URLSearchParams(window.location.search);
    const target = new URLSearchParams(qs);
    for (const [k, v] of target) if (current.get(k) !== v) return false;
    return true;
  };

  const searchForm = (variant: "desktop" | "mobile") => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitSearch(query);
      }}
      role="search"
      className="well flex h-11 items-center overflow-hidden pl-3.5"
    >
      <Search size={17} className="shrink-0 text-[color:var(--color-accent)]" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          variant === "desktop"
            ? "Search a skin — AWP Dragon Lore, ★ Karambit, AK-47 Redline…"
            : "Search skins"
        }
        aria-label="Search skins"
        className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:outline-none"
      />
      <button
        type="submit"
        className="h-11 shrink-0 bg-[color:var(--color-accent)] px-4 text-[14px] font-semibold text-[color:var(--color-accent-fg)] transition-colors hover:bg-[color:var(--color-accent-hover)]"
      >
        Search
      </button>
    </form>
  );

  const accountLinks = [
    { href: "/account", icon: UserIcon, label: "Profile" },
    { href: "/my-purchases", icon: Package, label: "My purchases" },
    { href: "/account/trade-url", icon: Link2, label: "Trade URL settings" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full" role="banner">
        {/* 1. The vellum notation strip — a thin divider band, nothing more. */}
        <div className="vellum-band">
          <div className="mx-auto flex h-[38px] max-w-[1360px] items-center gap-4 px-5 sm:px-6 lg:px-8">
            <Notation entries={NOTES} className="min-w-0 flex-1" />
            <div className="flex shrink-0 items-center gap-2">
              <CurrencySwitcher />
              <span className="h-4 w-px bg-[color:var(--color-border)]" aria-hidden />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* 2. The main bar — clean white, no grid. */}
        <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]">
          <div
            className={[
              "mx-auto flex max-w-[1360px] items-center gap-4 px-5 transition-[padding] duration-[var(--dur-slow)] sm:px-6 lg:gap-7 lg:px-8",
              scrolled ? "py-2.5" : "py-3.5",
            ].join(" ")}
          >
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="focus-amber inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)] lg:hidden"
            >
              <Menu size={22} />
            </button>

            <Link href="/" aria-label={`${brand.displayName} — home`} className="shrink-0">
              <DatumskinsLogo size={scrolled ? 19 : 22} />
            </Link>

            <div className="hidden min-w-0 flex-1 lg:block">{searchForm("desktop")}</div>

            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              {!user ? (
                <Link
                  href={authHref}
                  className="focus-amber inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-4 text-[15px] font-semibold text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                >
                  <UserIcon size={16} className="text-[color:var(--color-accent)]" />
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
                    className="focus-amber inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] py-1 pl-1 pr-3 transition-colors hover:border-[color:var(--color-accent)]"
                  >
                    <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-accent-tint)] text-[color:var(--color-accent)]">
                      {avatar ? (
                        <Image src={avatar} alt="" fill sizes="36px" className="object-cover" />
                      ) : (
                        <UserIcon size={17} />
                      )}
                    </span>
                    <span className="hidden max-w-[120px] truncate text-[14px] font-medium text-[color:var(--color-text)] sm:inline">
                      {displayName}
                    </span>
                    <ChevronDown size={15} className="hidden text-[color:var(--color-text-tertiary)] sm:inline" />
                  </button>
                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.16 }}
                        role="menu"
                        className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-2 shadow-[var(--shadow-lg)]"
                      >
                        <div className="mb-2 flex items-center gap-3 rounded-[var(--radius-md)] bg-[color:var(--color-bg-secondary)] p-3">
                          <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-accent-tint)] text-[color:var(--color-accent)]">
                            {avatar ? (
                              <Image src={avatar} alt="" fill sizes="44px" className="object-cover" />
                            ) : (
                              <UserIcon size={19} />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[15px] font-semibold text-[color:var(--color-text)]">
                              {displayName}
                            </span>
                            <span
                              className={`block text-[13px] ${
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
                            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-bg-secondary)]"
                          >
                            <item.icon size={16} className="text-[color:var(--color-accent)]" />
                            {item.label}
                          </Link>
                        ))}
                        {isAdmin && (
                          <NextLink
                            href="/admin"
                            role="menuitem"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-bg-secondary)]"
                          >
                            <Shield size={16} className="text-[color:var(--color-accent)]" />
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
                          className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-danger-light)] hover:text-[color:var(--color-danger)]"
                        >
                          <LogOut size={16} />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* 3. Tabs — charcoal, with the blue double-rule only on the active one. */}
          <div
            ref={panelWrap}
            className="relative hidden border-t border-[color:var(--color-border)] lg:block"
            onMouseLeave={() => setPanelOpen(false)}
          >
            <div className="mx-auto max-w-[1360px] px-5 sm:px-6 lg:px-8">
              <nav className="flex items-center gap-7 overflow-x-auto" aria-label="Primary">
                <button
                  type="button"
                  onMouseEnter={() => setPanelOpen(true)}
                  onClick={() => setPanelOpen((v) => !v)}
                  aria-expanded={panelOpen}
                  className="focus-amber -mb-px flex shrink-0 items-center gap-1.5 border-b-2 border-transparent py-3 text-[14px] font-medium text-[color:var(--color-text)] transition-colors hover:text-[color:var(--color-accent)]"
                >
                  Browse
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${panelOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {TABS.map((t) => {
                  const active = tabActive(t.href);
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      aria-current={active ? "page" : undefined}
                      onMouseEnter={() => setPanelOpen(false)}
                      className={[
                        "-mb-px shrink-0 py-3 text-[14px] transition-colors",
                        active
                          ? "border-b-2 border-[color:var(--color-accent)] font-semibold text-[color:var(--color-text)] shadow-[inset_0_-5px_0_-3px_var(--color-accent)]"
                          : "border-b-2 border-transparent font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text)]",
                      ].join(" ")}
                    >
                      {t.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* The mega-panel: a clean white sheet, plain link lists, one tile. */}
            <AnimatePresence>
              {panelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="absolute inset-x-0 top-full z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-lg)]"
                >
                  <div className="mx-auto grid max-w-[1360px] gap-10 px-8 py-9 lg:grid-cols-[repeat(3,minmax(0,1fr))_20rem]">
                    {PANEL_COLUMNS.map((col) => (
                      <div key={col.title}>
                        <p className="label mb-4">{col.title}</p>
                        <ul className="flex flex-col gap-2.5">
                          {col.links.map((l) => (
                            <li key={l.href}>
                              <Link
                                href={l.href}
                                onClick={() => setPanelOpen(false)}
                                className="text-[15px] text-[color:var(--color-text-secondary)] transition-colors hover:text-[color:var(--color-accent)]"
                              >
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    <Link
                      href="/store?sort=newest"
                      onClick={() => setPanelOpen(false)}
                      className="card-lift flex flex-col justify-between rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5"
                    >
                      <Stamp tone="ink" tilt="right" className="self-start">
                        New arrivals
                      </Stamp>
                      <span>
                        <span className="font-display mt-6 block text-[19px] font-semibold tracking-[-0.015em] text-[color:var(--color-text)]">
                          Just listed
                        </span>
                        <span className="mt-1.5 block text-[14px] text-[color:var(--color-text-secondary)]">
                          Everything added in the last sync, newest first.
                        </span>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[color:var(--color-accent)]">
                          Open <ArrowRight size={14} />
                        </span>
                      </span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search — mobile row */}
          <div className="border-t border-[color:var(--color-border)] px-5 py-2.5 lg:hidden">
            {searchForm("mobile")}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-[#22262E]/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-sm flex-col bg-[color:var(--color-bg-elevated)] lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-4">
                <DatumskinsLogo size={19} />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="focus-amber inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)]"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Mobile">
                <ul className="flex flex-col">
                  {TABS.map((t) => (
                    <li key={t.href}>
                      <Link
                        href={t.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-[var(--radius-md)] px-3 py-3 text-[17px] font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                      >
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <p className="label mb-3 mt-6 px-3">By wear</p>
                <ul className="flex flex-col">
                  {PANEL_COLUMNS[2].links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {user && (
                  <>
                    <p className="label mb-3 mt-6 px-3">Account</p>
                    <ul className="flex flex-col">
                      {accountLinks.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                          >
                            <item.icon size={17} className="text-[color:var(--color-accent)]" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                      {isAdmin && (
                        <li>
                          <NextLink
                            href="/admin"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                          >
                            <Shield size={17} className="text-[color:var(--color-accent)]" />
                            Admin panel
                          </NextLink>
                        </li>
                      )}
                    </ul>
                  </>
                )}
              </nav>

              <div className="border-t border-[color:var(--color-border)] px-5 py-4">
                <div className="mb-3 flex items-center gap-3">
                  <ThemeToggle />
                  <span className="h-5 w-px bg-[color:var(--color-border)]" />
                  <CurrencySwitcher />
                </div>
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] text-[15px] font-semibold text-[color:var(--color-text)]"
                  >
                    <LogOut size={17} /> Sign out
                  </button>
                ) : (
                  <Link
                    href={authHref}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-accent)] text-[15px] font-semibold text-[color:var(--color-accent-fg)]"
                  >
                    <UserIcon size={17} /> Sign in
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
