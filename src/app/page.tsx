import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/shared/SEO/JsonLd";
import { querySihCatalog, type SihCatalogItem } from "@/lib/sih/queries";
import { SihItemCard } from "@/components/sih/SihItemCard";
import { brand } from "@/lib/brand";
import { SectionHead } from "@/components/ui/SectionHead";
import { Stamp, SpecTag, SheetNum, DimLine, Dimmed } from "@/components/ui/Stamp";
import { SyncReadout } from "@/components/ui/SyncReadout";
import { WearDiagram, TitleBlock } from "@/components/ui/WearDiagram";
import { Callout } from "@/components/ui/Callout";
import { RarityTag, RarityRule, rarityVars } from "@/components/ui/RarityTag";
import { FloatFinder } from "@/components/home/FloatFinder";
import { RarityExplorer } from "@/components/home/RarityExplorer";
import { TopTen } from "@/components/home/TopTen";
import { HomePrice } from "@/components/home/HomePrice";
import { ArrowRight } from "lucide-react";

/** The catalogue is revalidated on this cadence, which is also the only real
 *  countdown on the page — the store never invents a deadline. */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${brand.displayName} — ${brand.tagline}`,
    description: brand.description,
    alternates: { canonical: "/" },
    openGraph: { url: "/" },
  };
}

const CATEGORY_RAIL = [
  { index: "B", label: "Rifles", href: "/store?category=Rifles" },
  { index: "C", label: "Pistols", href: "/store?category=Pistols" },
  { index: "D", label: "SMGs", href: "/store?category=SMGs" },
  { index: "E", label: "Heavy", href: "/store?category=Heavy" },
  { index: "F", label: "Knives", href: "/store?category=Knives" },
  { index: "G", label: "Gloves", href: "/store?category=Gloves" },
  { index: "H", label: "StatTrak™", href: "/store?stattrak=1" },
  { index: "J", label: "Souvenir", href: "/store?souvenir=1" },
];

const STEPS = [
  {
    title: "Read the sheet",
    body: "Every listing states its exterior, float range, grade and price before you commit to anything.",
  },
  {
    title: "Pay through the processor",
    body: "Card checkout handled by our payment provider. Your Steam password is never asked for and never stored.",
  },
  {
    title: "Accept the trade offer",
    body: "The item arrives in your Steam inventory as a trade offer. Accept it and it is yours.",
  },
];

const NOTES = [
  {
    tag: "Live stock",
    body: "Everything listed is in hand right now. Nothing is published that we cannot send.",
  },
  {
    tag: "Exterior stated",
    body: "Each sheet carries its wear zone drawn against the real float boundaries, not a marketing word.",
  },
  {
    tag: "No password",
    body: "Delivery runs through a Steam trade offer. We never ask for your account.",
  },
  {
    tag: "Refund if undelivered",
    body: "If a trade fails on our side you get your money back. That is the whole policy.",
  },
];

export default async function HomePage() {
  const [fresh, premium, value, knives] = await Promise.all([
    querySihCatalog({ sort: "newest", perPage: 24 }),
    querySihCatalog({ sort: "price_desc", perPage: 12 }),
    querySihCatalog({ sort: "price_asc", perPage: 24 }),
    querySihCatalog({ sort: "price_desc", perPage: 8, categories: ["Knives", "Gloves"] }),
  ]);

  // The featured sheet: the best genuine discount we currently hold, falling
  // back to the newest listing when nothing is marked down.
  const discounted = [...fresh.items, ...premium.items, ...value.items]
    .filter((i) => i.discountPct != null && i.discountPct > 0)
    .sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0));
  const hero: SihCatalogItem | undefined = discounted[0] ?? fresh.items[0];

  const sideTiles = [
    { label: "Lowest price", item: value.items[0] },
    { label: "Highest value knife", item: knives.items[0] },
    { label: "Most recently listed", item: fresh.items[0] },
  ].filter((t) => t.item) as { label: string; item: SihCatalogItem }[];

  const deals = discounted.slice(0, 6);
  const underTen = value.items.filter((i) => i.price <= 10).slice(0, 6);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: brand.displayName,
          legalName: brand.company.legalName,
          alternateName: [brand.domain],
          url: brand.url,
          sameAs: [brand.url],
          description: brand.description,
        }}
      />

      {/* ── SHEET 01 — GENERAL ARRANGEMENT ────────────────────────── */}
      <section className="border-b border-[color:var(--color-border)]">
        <div className="mx-auto w-full max-w-[1360px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <DimLine className="max-w-[18rem]" />
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <SheetNum sheet={1} rev="A" />
                <span className="label">General arrangement</span>
              </div>

              <h1 className="drawing-title mt-4 text-[clamp(2.5rem,7vw,4.5rem)]">
                Every skin,
                <br />
                fully <Dimmed>specified</Dimmed>.
              </h1>

              <p className="mt-6 max-w-[48ch] text-[15.5px] leading-relaxed text-[color:var(--color-text-secondary)]">
                Real CS2 skins, in stock, each one published as a drawing: exterior, float range,
                grade and price stated on the sheet before you buy. Pay once and it lands in your
                Steam inventory as a trade offer.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/store"
                  className="focus-amber inline-flex h-12 items-center gap-2 border border-[color:var(--color-primary-strong)] bg-[color:var(--color-primary-strong)] px-6 text-sm font-semibold text-[color:var(--color-primary-fg)] transition-all hover:bg-[color:var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] active:translate-y-px active:shadow-none"
                >
                  Open the index <ArrowRight size={16} />
                </Link>
                <Link
                  href="/how-it-works"
                  className="focus-amber inline-flex h-12 items-center gap-2 border border-[color:var(--color-accent)] px-6 text-sm font-semibold text-[color:var(--color-accent)] transition-colors hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)]"
                >
                  How it works
                </Link>
              </div>

              {/* The only figure in the hero is one we can actually verify. */}
              <dl className="mt-8 grid max-w-md grid-cols-2 gap-px border border-[color:var(--color-border)] bg-[color:var(--color-border)]">
                <div className="bg-[color:var(--color-bg-elevated)] px-3 py-2.5">
                  <dt className="microlabel">Sheets in stock</dt>
                  <dd className="readout mt-1 text-[22px] font-semibold leading-none text-[color:var(--color-text)]">
                    {fresh.total.toLocaleString()}
                  </dd>
                </div>
                <div className="bg-[color:var(--color-bg-elevated)] px-3 py-2.5">
                  <dt className="microlabel">Prices re-read</dt>
                  <dd className="mt-1.5">
                    <SyncReadout everySeconds={60} tone="quiet" endedLabel="Reading…" />
                  </dd>
                </div>
              </dl>
            </div>

            {/* The featured sheet */}
            {hero ? (
              <Link
                href={`/store/${hero.slug}`}
                style={rarityVars(hero.rarityColor)}
                className="card-lift group relative block overflow-hidden border border-[color:var(--color-accent)] bg-[color:var(--color-bg-elevated)]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[color:var(--color-accent)] bg-[color:var(--color-accent-tint)] px-3 py-1.5">
                  <span className="label text-[10px]">
                    {hero.discountPct != null && hero.discountPct > 0 ? "Marked down" : "Just listed"}
                  </span>
                  <SheetNum sheet="00" rev="A" />
                </div>

                <div className="reg-marks relative aspect-[16/10] overflow-hidden bg-[color:var(--color-bg)]">
                  <span aria-hidden className="gridded pointer-events-none absolute inset-0 opacity-70" />
                  {hero.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hero.imageUrl}
                      alt={hero.name}
                      className="absolute inset-0 h-full w-full object-contain p-10 transition-transform duration-[var(--dur-slow)] group-hover:scale-[1.03]"
                    />
                  ) : null}

                  {hero.discountPct != null && hero.discountPct > 0 ? (
                    <span className="absolute left-4 top-4">
                      <Stamp press>−{hero.discountPct}% vs Steam</Stamp>
                    </span>
                  ) : null}

                  <span className="absolute bottom-6 right-4 hidden sm:block">
                    <Callout side="left">{hero.rarity ?? "Grade unstated"}</Callout>
                  </span>
                </div>

                <RarityRule />

                <div className="grid gap-4 p-4 sm:grid-cols-[1.2fr_1fr] sm:p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <RarityTag rarity={hero.rarity} color={hero.rarityColor} />
                      {hero.isStatTrak ? <SpecTag tone="hold">StatTrak™</SpecTag> : null}
                      {hero.phase ? <SpecTag tone="ink">{hero.phase}</SpecTag> : null}
                    </div>
                    <p className="microlabel mt-3">{hero.weapon ?? hero.category}</p>
                    <h2 className="drawing-title mt-1 text-[clamp(1.4rem,2.8vw,1.9rem)]">
                      {hero.skinName ?? hero.name}
                    </h2>
                    <p className="readout mt-3 text-[clamp(1.6rem,3.6vw,2.25rem)] font-semibold leading-none text-[color:var(--color-text)]">
                      <HomePrice usd={hero.price} />
                    </p>
                    <WearDiagram exterior={hero.exterior} className="mt-4" compact />
                  </div>

                  <TitleBlock
                    dense
                    rows={[
                      { label: "Grade", value: hero.rarity ?? "—", mono: false },
                      hero.count > 0 ? { label: "In stock", value: String(hero.count) } : null,
                      { label: "Ref", value: hero.slug.slice(0, 16) },
                    ]}
                  />
                </div>
              </Link>
            ) : null}
          </div>

          {/* Three real picks, each labelled for exactly what it is */}
          {sideTiles.length > 0 ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {sideTiles.map(({ label, item }) => (
                <Link
                  key={`${label}-${item.slug}`}
                  href={`/store/${item.slug}`}
                  style={rarityVars(item.rarityColor)}
                  className="card-lift group relative flex items-center gap-3 overflow-hidden border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-3"
                >
                  <span className="relative h-14 w-20 shrink-0 border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
                    <span aria-hidden className="gridded absolute inset-0 opacity-70" />
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="relative h-full w-full object-contain p-1"
                      />
                    ) : null}
                    <span className="rarity-rule absolute inset-x-0 bottom-0 h-[2px]" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="microlabel block">{label}</span>
                    <span className="font-display mt-1 block truncate text-[15px] font-semibold tracking-[-0.015em] text-[color:var(--color-accent)]">
                      {item.skinName ?? item.name}
                    </span>
                    <span className="readout mt-1 block text-[16px] font-semibold leading-none text-[color:var(--color-text)]">
                      <HomePrice usd={item.price} />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : null}

          {/* Index of sections */}
          <div className="mt-8 flex flex-wrap gap-1.5">
            {CATEGORY_RAIL.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="group inline-flex items-stretch border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                <span
                  aria-hidden
                  className="grid w-[1.9em] place-items-center border-r border-[color:var(--color-border)] py-2 text-[color:var(--color-text-tertiary)] group-hover:border-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent)]"
                >
                  {c.index}
                </span>
                <span className="px-3 py-2">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">
        {/* ── 02 NEWLY ISSUED ────────────────────────────────────── */}
        <section className="py-12 lg:py-16">
          <SectionHead
            sheet={2}
            eyebrow="Just listed"
            title={<>Newly issued</>}
            action={
              <Link
                href="/store?sort=newest"
                className="inline-flex items-center gap-1.5 border-b border-[color:var(--color-primary)] pb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                See all <ArrowRight size={13} />
              </Link>
            }
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {fresh.items.slice(0, 6).map((item, i) => (
              <div key={item.slug} className="animate-fadeInUp" data-stagger={(i % 6) + 1}>
                <SihItemCard item={item} index={i} />
              </div>
            ))}
          </div>
        </section>

        {/* ── 03 REVISED DOWN — only when something really is ────── */}
        {deals.length > 0 ? (
          <section className="py-12 lg:py-16">
            <SectionHead
              sheet={3}
              rev="B"
              eyebrow="Under Steam price"
              title={
                <>
                  Revised <Dimmed>down</Dimmed>
                </>
              }
              action={<SyncReadout everySeconds={60} label="Re-read in" tone="quiet" />}
            />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {deals.map((item, i) => (
                <SihItemCard key={item.slug} item={item} index={i} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ── 04 WEAR GAUGE ──────────────────────────────────────── */}
        <section className="py-12 lg:py-16">
          <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionHead
              sheet={4}
              eyebrow="Wear"
              title={
                <>
                  Read the <Dimmed>float</Dimmed>
                </>
              }
              lede="Exterior decides how a skin actually looks — and most of what it costs. Move the pointer to the wear you want and the gauge reports what is in that zone right now."
            />
            <FloatFinder />
          </div>
        </section>
      </div>

      {/* ── 05 KNIVES & GLOVES — the cyanotype plate ──────────────── */}
      {knives.items.length > 0 ? (
        <section className="cyanotype border-y border-[color:var(--color-border)]">
          <div className="mx-auto w-full max-w-[1360px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <SectionHead
              sheet={5}
              eyebrow="Knives & gloves"
              title={<>The blue plate</>}
              lede="The highest-value knives and gloves in stock, printed the classic way round."
              action={
                <Link
                  href="/store?category=Knives"
                  className="inline-flex items-center gap-1.5 border-b border-[color:var(--color-primary)] pb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                >
                  See all <ArrowRight size={13} />
                </Link>
              }
            />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {knives.items.slice(0, 8).map((item, i) => (
                <SihItemCard key={item.slug} item={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">
        {/* ── 06 GRADE LEGEND ────────────────────────────────────── */}
        <section className="py-12 lg:py-16">
          <SectionHead
            sheet={6}
            eyebrow="By grade"
            title={<>The grade legend</>}
            lede="Mil-Spec blue through Covert red, plus the knife and glove tier. Pick a grade to see what is in stock at it."
          />
          <RarityExplorer className="mt-8" />
        </section>

        {/* ── 07 UNDER $10 ───────────────────────────────────────── */}
        {underTen.length > 0 ? (
          <section className="py-12 lg:py-16">
            <SectionHead
              sheet={7}
              eyebrow="Entry level"
              title={<>Under $10</>}
              action={
                <Link
                  href="/store?priceMax=10&sort=price_asc"
                  className="inline-flex items-center gap-1.5 border-b border-[color:var(--color-primary)] pb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                >
                  See all <ArrowRight size={13} />
                </Link>
              }
            />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {underTen.map((item, i) => (
                <SihItemCard key={item.slug} item={item} index={i} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ── 08 SCHEDULE OF ITEMS ───────────────────────────────── */}
        {premium.items.length > 0 ? (
          <section className="py-12 lg:py-16">
            <SectionHead
              sheet={8}
              eyebrow="Ranked by price"
              title={<>Schedule of items</>}
              lede="The ten highest-priced listings in stock. No votes and no hype — the order is the price order."
            />
            <TopTen items={premium.items.slice(0, 10)} className="mt-8" />
          </section>
        ) : null}

        {/* ── 09 PROCEDURE ───────────────────────────────────────── */}
        <section className="py-12 lg:py-16">
          <SectionHead sheet={9} eyebrow="Three steps" title={<>Procedure</>} />
          <ol className="mt-8 grid gap-px border border-[color:var(--color-accent)] bg-[color:var(--color-border)] sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-[color:var(--color-bg-elevated)] p-6">
                <span
                  aria-hidden
                  className="inline-flex h-8 w-8 items-center justify-center border border-[color:var(--color-accent)] font-mono text-[14px] font-semibold text-[color:var(--color-accent)]"
                >
                  {i + 1}
                </span>
                <h3 className="font-display mt-4 text-[18px] font-semibold tracking-[-0.015em] text-[color:var(--color-accent)]">
                  {s.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--color-text-secondary)]">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>

          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {NOTES.map((b, i) => (
              <li
                key={b.tag}
                className="border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-4"
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden className="index-num text-[10px]">
                    N{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="label text-[10px]">{b.tag}</span>
                </span>
                <DimLine className="mt-2 opacity-70" />
                <p className="mt-3 text-[13.5px] leading-relaxed text-[color:var(--color-text-secondary)]">
                  {b.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
