"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Search, LayoutGrid, Rows3 } from "lucide-react";
import { EXTERIORS, RARITY_TIERS, type ExteriorCode } from "@/lib/skins/shared";
import type { SihCatalogItem, SihCatalogResult, SihFacets } from "@/lib/sih/queries";
import { SihItemCard, SihItemCardSkeleton } from "./SihItemCard";
import { WearDiagram } from "@/components/ui/WearDiagram";
import { SihPartsTable } from "./SihPartsTable";
import { useCurrency } from "@/providers/CurrencyProvider";

const SORTS = [
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "newest", label: "Newest" },
  { value: "name_asc", label: "Name A–Z" },
];

const RARITIES = Object.entries(RARITY_TIERS)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([name, meta]) => ({ name, color: meta.color }));

function useDebounced<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/**
 * The catalogue.
 *
 * A persistent filter rail on the left, results on the right, and every
 * constraint mirrored into the URL so a view can be shared or linked from the
 * header. The card grid is the default; the parts-list table is a power-user
 * toggle that remembers itself for the session and collapses to stacked cards
 * on a phone.
 */
export function SihCatalogClient({ facets }: { facets: SihFacets }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { currency, symbol, rates } = useCurrency();

  // DB prices are USD. The price filter is entered in the header currency, so
  // convert the bounds to USD before querying the API.
  const toUsd = useCallback(
    (v: string) => {
      const n = Number(v);
      if (!v || !Number.isFinite(n)) return "";
      const usd = (n / rates[currency]) * rates.USD;
      return String(Math.round(usd * 100) / 100);
    },
    [currency, rates],
  );

  const [search, setSearch] = useState(params.get("q") ?? "");
  const [categories, setCategories] = useState<string[]>(csv(params.get("category")));
  const [weapons, setWeapons] = useState<string[]>(csv(params.get("weapon")));
  const [rarities, setRarities] = useState<string[]>(csv(params.get("rarity")));
  const [exteriors, setExteriors] = useState<ExteriorCode[]>(
    csv(params.get("exterior")) as ExteriorCode[],
  );
  const [priceMin, setPriceMin] = useState(params.get("priceMin") ?? "");
  const [priceMax, setPriceMax] = useState(params.get("priceMax") ?? "");
  const [statTrak, setStatTrak] = useState(params.get("stattrak") === "1");
  const [souvenir, setSouvenir] = useState(params.get("souvenir") === "1");
  const [sort, setSort] = useState(params.get("sort") ?? "price_asc");
  const [mobileOpen, setMobileOpen] = useState(false);
  // The card grid is the default view; the parts list is opt-in and remembered
  // for the session only, so a shared URL always opens on the calm grid.
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("catalog-view");
      if (stored === "list" || stored === "grid") setView(stored);
    } catch {
      /* private mode, or storage blocked — the default view is fine */
    }
  }, []);

  const chooseView = (next: "grid" | "list") => {
    setView(next);
    try {
      sessionStorage.setItem("catalog-view", next);
    } catch {
      /* nothing to do — the choice just will not persist */
    }
  };

  const [data, setData] = useState<SihCatalogResult | null>(null);
  const [items, setItems] = useState<SihCatalogItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounced(search);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.set("q", debouncedSearch);
    if (categories.length) p.set("category", categories.join(","));
    if (weapons.length) p.set("weapon", weapons.join(","));
    if (rarities.length) p.set("rarity", rarities.join(","));
    if (exteriors.length) p.set("exterior", exteriors.join(","));
    if (priceMin) p.set("priceMin", priceMin);
    if (priceMax) p.set("priceMax", priceMax);
    if (statTrak) p.set("stattrak", "1");
    if (souvenir) p.set("souvenir", "1");
    if (sort) p.set("sort", sort);
    return p.toString();
  }, [debouncedSearch, categories, weapons, rarities, exteriors, priceMin, priceMax, statTrak, souvenir, sort]);

  // Same query but with price bounds converted from the header currency to USD
  // for the API (the URL keeps the human-entered, currency-native values).
  const apiQueryString = useMemo(() => {
    const p = new URLSearchParams(queryString);
    const min = toUsd(priceMin);
    const max = toUsd(priceMax);
    if (min) p.set("priceMin", min); else p.delete("priceMin");
    if (max) p.set("priceMax", max); else p.delete("priceMax");
    return p.toString();
  }, [queryString, priceMin, priceMax, toUsd]);

  const lastWritten = useRef<string>("");
  useEffect(() => {
    lastWritten.current = queryString;
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    setPage(1);
  }, [queryString, pathname, router]);

  // Re-hydrate filters when the URL changes from an external source (header
  // links, browser back/forward). Without this the component keeps its initial
  // state on same-path query changes, so the URL updates but content goes stale.
  useEffect(() => {
    const p = new URLSearchParams();
    const set = (k: string, v: string | null) => v && p.set(k, v);
    set("q", params.get("q"));
    set("category", params.get("category"));
    set("weapon", params.get("weapon"));
    set("rarity", params.get("rarity"));
    set("exterior", params.get("exterior"));
    set("priceMin", params.get("priceMin"));
    set("priceMax", params.get("priceMax"));
    if (params.get("stattrak") === "1") p.set("stattrak", "1");
    if (params.get("souvenir") === "1") p.set("souvenir", "1");
    p.set("sort", params.get("sort") ?? "price_asc");
    if (p.toString() === lastWritten.current) return;

    setSearch(params.get("q") ?? "");
    setCategories(csv(params.get("category")));
    setWeapons(csv(params.get("weapon")));
    setRarities(csv(params.get("rarity")));
    setExteriors(csv(params.get("exterior")) as ExteriorCode[]);
    setPriceMin(params.get("priceMin") ?? "");
    setPriceMax(params.get("priceMax") ?? "");
    setStatTrak(params.get("stattrak") === "1");
    setSouvenir(params.get("souvenir") === "1");
    setSort(params.get("sort") ?? "price_asc");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const abortRef = useRef<AbortController | null>(null);
  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      try {
        const p = new URLSearchParams(apiQueryString);
        p.set("page", String(pageNum));
        const res = await fetch(`/api/sih/catalog?${p.toString()}`, { signal: ac.signal });
        const json = (await res.json()) as SihCatalogResult;
        setData(json);
        setItems((prev) => (append ? [...prev, ...json.items] : json.items));
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [apiQueryString],
  );

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next, true);
  };

  const toggle = <T,>(list: T[], value: T, setter: (v: T[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const clearAll = () => {
    setSearch("");
    setCategories([]);
    setWeapons([]);
    setRarities([]);
    setExteriors([]);
    setPriceMin("");
    setPriceMax("");
    setStatTrak(false);
    setSouvenir(false);
    setSort("price_asc");
  };

  const activeCount =
    categories.length + weapons.length + rarities.length + exteriors.length +
    (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (statTrak ? 1 : 0) + (souvenir ? 1 : 0) +
    (search ? 1 : 0);

  const activeTags = useMemo(() => {
    const tags: { key: string; label: string; remove: () => void }[] = [];
    if (search) tags.push({ key: "q", label: `“${search}”`, remove: () => setSearch("") });
    for (const c of categories)
      tags.push({ key: `cat:${c}`, label: c, remove: () => setCategories((p) => p.filter((x) => x !== c)) });
    for (const w of weapons)
      tags.push({ key: `wpn:${w}`, label: w, remove: () => setWeapons((p) => p.filter((x) => x !== w)) });
    for (const r of rarities)
      tags.push({ key: `rar:${r}`, label: r, remove: () => setRarities((p) => p.filter((x) => x !== r)) });
    for (const e of exteriors)
      tags.push({ key: `ext:${e}`, label: e, remove: () => setExteriors((p) => p.filter((x) => x !== e)) });
    if (priceMin) tags.push({ key: "pmin", label: `≥ ${symbol}${priceMin}`, remove: () => setPriceMin("") });
    if (priceMax) tags.push({ key: "pmax", label: `≤ ${symbol}${priceMax}`, remove: () => setPriceMax("") });
    if (statTrak) tags.push({ key: "st", label: "StatTrak™", remove: () => setStatTrak(false) });
    if (souvenir) tags.push({ key: "sv", label: "Souvenir", remove: () => setSouvenir(false) });
    return tags;
  }, [search, categories, weapons, rarities, exteriors, priceMin, priceMax, statTrak, souvenir, symbol]);

  const weaponsByCategory = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const { weapon, category } of facets.weapons) {
      if (!map.has(category)) map.set(category, []);
      map.get(category)!.push(weapon);
    }
    return [...map.entries()];
  }, [facets.weapons]);

  const sidebar = (
    <div className="flex flex-col gap-7">
      <div className="well flex h-11 items-center px-3.5">
        <Search className="h-4 w-4 shrink-0 text-[color:var(--color-accent)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skins…"
          aria-label="Search skins"
          className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:outline-none"
        />
      </div>

      <FilterGroup title="Exterior">
        <div className="flex flex-wrap gap-1.5">
          {EXTERIORS.map((e) => {
            const on = exteriors.includes(e.code);
            return (
              <button
                key={e.code}
                onClick={() => toggle(exteriors, e.code, setExteriors)}
                aria-pressed={on}
                title={`${e.label} · ${e.floatMin.toFixed(2)}–${e.floatMax.toFixed(2)}`}
                className={[
                  "focus-amber rounded-[var(--radius-sm)] px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.1em] transition-colors",
                  on
                    ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                    : "border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]",
                ].join(" ")}
              >
                {e.short}
              </button>
            );
          })}
        </div>
        <WearDiagram
          exterior={(exteriors.length === 1 ? exteriors[0] : "NA") as ExteriorCode}
          className="mt-3"
        />
      </FilterGroup>

      <FilterGroup title={`Price (${currency})`}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Min"
            aria-label={`Minimum price in ${currency}`}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="readout h-11 w-full rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] px-3 text-[15px] outline-none focus:border-[color:var(--color-accent)]"
          />
          <span className="text-[color:var(--color-text-tertiary)]">–</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Max"
            aria-label={`Maximum price in ${currency}`}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="readout h-11 w-full rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] px-3 text-[15px] outline-none focus:border-[color:var(--color-accent)]"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Rarity">
        <div className="flex flex-col gap-1">
          {RARITIES.map((r) => {
            const on = rarities.includes(r.name);
            return (
              <button
                key={r.name}
                onClick={() => toggle(rarities, r.name, setRarities)}
                aria-pressed={on}
                className={[
                  "focus-amber flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[14px] transition-colors",
                  on
                    ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                    : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-text)]",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{ background: r.color }}
                />
                {r.name}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Special">
        <div className="flex flex-col gap-2">
          <Toggle label="StatTrak™" checked={statTrak} onChange={setStatTrak} />
          <Toggle label="Souvenir" checked={souvenir} onChange={setSouvenir} />
        </div>
      </FilterGroup>

      {facets.categories.length > 0 && (
        <FilterGroup title="Category">
          <div className="flex flex-wrap gap-1.5">
            {facets.categories.map((c) => (
              <ChipButton
                key={c}
                on={categories.includes(c)}
                onClick={() => toggle(categories, c, setCategories)}
              >
                {c}
              </ChipButton>
            ))}
          </div>
        </FilterGroup>
      )}

      {weaponsByCategory.length > 0 && (
        <FilterGroup title="Weapon">
          <div className="flex flex-col gap-3">
            {weaponsByCategory.map(([category, ws]) => (
              <div key={category}>
                <div className="microlabel mb-1.5">{category}</div>
                <div className="flex flex-wrap gap-1">
                  {ws.map((w) => (
                    <ChipButton
                      key={w}
                      on={weapons.includes(w)}
                      onClick={() => toggle(weapons, w, setWeapons)}
                      small
                    >
                      {w}
                    </ChipButton>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FilterGroup>
      )}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-[var(--max-width)] gap-8 px-5 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-[150px] flex max-h-[calc(100dvh-170px)] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-3.5">
            <span className="label">Filters</span>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-[14px] font-semibold text-[color:var(--color-primary)] hover:underline"
              >
                Clear ({activeCount})
              </button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{sidebar}</div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--color-border)] pb-4">
          <div className="flex items-end gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="focus-amber inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-3.5 text-[15px] font-semibold text-[color:var(--color-text)] lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 text-[color:var(--color-accent)]" /> Filters
              {activeCount > 0 && (
                <span className="tnum rounded-[var(--radius-sm)] bg-[color:var(--color-accent)] px-1.5 text-[12px] text-[color:var(--color-accent-fg)]">
                  {activeCount}
                </span>
              )}
            </button>
            <p className="flex items-baseline gap-2.5">
              <span className="readout text-[clamp(1.375rem,3vw,1.75rem)] font-semibold leading-none text-[color:var(--color-text)]">
                {data ? data.total.toLocaleString() : "—"}
              </span>
              <span className="text-[15px] text-[color:var(--color-text-secondary)]">
                skins in stock
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle: the grid is the default, the parts list is opt-in. */}
            <div
              role="group"
              aria-label="Result layout"
              className="hidden items-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] p-0.5 sm:inline-flex"
            >
              {([
                { id: "grid", label: "Cards", Icon: LayoutGrid },
                { id: "list", label: "Parts list", Icon: Rows3 },
              ] as const).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => chooseView(id)}
                  aria-pressed={view === id}
                  className={[
                    "focus-amber inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-[14px] font-medium transition-colors",
                    view === id
                      ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                      : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text)]",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2">
              <span className="microlabel">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] px-3 text-[15px] outline-none focus:border-[color:var(--color-accent)]"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {activeTags.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {activeTags.map((t) => (
              <button
                key={t.key}
                onClick={t.remove}
                className="group inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] px-2.5 py-1.5 text-[14px] text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                {t.label}
                <X className="h-3 w-3 transition-colors group-hover:text-[color:var(--color-primary-strong)]" />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="ml-1 text-[14px] font-semibold text-[color:var(--color-primary)] hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {view === "grid" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((it, i) => (
              <SihItemCard key={it.slug} item={it} index={i} />
            ))}
            {loading && items.length === 0 &&
              Array.from({ length: 8 }).map((_, i) => <SihItemCardSkeleton key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <SihPartsTable items={items} />
        ) : null}

        {!loading && items.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-6 py-20 text-center">
            <p className="drawing-title text-[clamp(1.25rem,3vw,1.75rem)]">
              Nothing matches these filters
            </p>
            <p className="measure mx-auto mt-3 text-[16px] text-[color:var(--color-text-secondary)]">
              Nothing in stock satisfies every constraint you have set.
            </p>
            <button
              onClick={clearAll}
              className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-[color:var(--color-primary-strong)] px-5 text-[15px] font-semibold text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
            >
              Clear all filters
            </button>
          </div>
        )}

        {data && page < data.totalPages && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="focus-amber h-12 rounded-[var(--radius-md)] border border-[color:var(--color-accent)] px-7 text-[15px] font-semibold text-[color:var(--color-accent)] transition-colors hover:bg-[color:var(--color-accent-tint)] disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#22262E]/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-[color:var(--color-bg-elevated)] p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="label">Filters</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-7 h-12 w-full rounded-[var(--radius-md)] bg-[color:var(--color-primary-strong)] text-[15px] font-semibold text-[color:var(--color-primary-fg)]"
            >
              Show {data?.total.toLocaleString() ?? ""} skins
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-3">{title}</p>
      {children}
    </div>
  );
}

function ChipButton({
  on,
  onClick,
  children,
  small,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={[
        "focus-amber rounded-[var(--radius-sm)] font-medium transition-colors",
        small ? "px-2 py-1 text-[13px]" : "px-2.5 py-1.5 text-[14px]",
        on
          ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
          : "border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className="focus-amber flex items-center justify-between text-[15px] text-[color:var(--color-text)]"
    >
      <span>{label}</span>
      <span
        className={`relative h-6 w-11 rounded-[var(--radius-md)] border transition-colors ${
          checked
            ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]"
            : "border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-tertiary)]"
        }`}
      >
        <span
          className={`absolute top-[3px] h-[16px] w-[16px] rounded-[3px] bg-[color:var(--color-bg-elevated)] transition-all ${
            checked ? "left-[23px]" : "left-[3px]"
          }`}
        />
      </span>
    </button>
  );
}

function csv(v: string | null): string[] {
  if (!v) return [];
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}
