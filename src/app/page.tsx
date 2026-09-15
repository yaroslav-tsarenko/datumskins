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
  { label: "Rifles", href: "/store?category=Rifles" },
  { label: "Pistols", href: "/store?category=Pistols" },
  { label: "SMGs", href: "/store?category=SMGs" },
  { label: "Heavy", href: "/store?category=Heavy" },
  { label: "Knives", href: "/store?category=Knives" },
  { label: "Gloves", href: "/store?category=Gloves" },
  { label: "StatTrak™", href: "/store?stattrak=1" },
  { label: "Souvenir", href: "/store?souvenir=1" },
];

const STEPS = [
  {
    title: "Read the listing",
    body: "Every skin states its exterior, float range, grade and price before you commit to anything.",
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
    body: "Each listing carries its wear zone measured against the real float boundaries, not a marketing word.",
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

  // The featured listing: the best genuine discount we currently hold, falling
  // back to the newest listing when nothing is marked down.
  const discounted = [...fresh.items, ...premium.items, ...value.items]
    .filter((i) => i.discountPct != null && i.discountPct > 0)
    .sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0));
  const hero: SihCatalogItem | undefined = discounted[0] ?? fresh.items[0];
  const heroExt = hero ? hero.exterior : null;

  const deals = discounted.slice(0, 4);
  const underTen = value.items.filter((i) => i.price <= 10).slice(0, 4);

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

      {/*
        DRAWING MOMENT 1 of 3 — the hero.
        The grid, the leader lines and the dimension rule are allowed here and
        in only two other places on the site. Everything after this section
        alternates back to clean white so the eye gets a rest.
      */}
      <section className="drafting-field border-b border-[color:var(--color-border)]">
        <div className="mx-auto w-full max-w-[1360px] px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-x-14 gap-y-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <DimLine className="max-w-[16rem]" />
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="label">CS2 skins, in stock</span>
                <SheetNum sheet={1} rev="A" />
              </div>

              <h1 className="drawing-title mt-5 text-[clamp(2.5rem,6.4vw,4.25rem)]">
                Every skin,
                <br />
                fully <Dimmed>specified</Dimmed>.
              </h1>

              <p className="measure mt-7 text-[17px] leading-[1.65] text-[color:var(--color-text-secondary)]">
                Real CS2 skins, in stock, each one listed with its exterior, float range, grade and
                price stated up front. Pay once and it lands in your Steam inventory as a trade
                offer — no password, no waiting room.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/store"
                  className="focus-amber inline-flex h-13 items-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-primary-strong)] px-7 text-[16px] font-semibold text-[color:var(--color-primary-fg)] transition-all hover:bg-[color:var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] active:translate-y-px active:shadow-none"
                >
                  Browse all skins <ArrowRight size={17} />
                </Link>
                <Link
                  href="/how-it-works"
                  className="focus-amber inline-flex h-13 items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] px-7 text-[16px] font-semibold text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                >
                  How it works
                </Link>
              </div>

              {/* The only figures in the hero are ones we can actually verify. */}
              <dl className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-5">
                <div>
                  <dt className="microlabel">Skins in stock</dt>
                  <dd className="readout mt-1.5 text-[26px] font-semibold leading-none">
                    {fresh.total.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="microlabel">Prices re-read</dt>
                  <dd className="mt-1.5">
                    <SyncReadout everySeconds={60} tone="quiet" endedLabel="Reading…" />
                  </dd>
                </div>
              </dl>
            </div>

            {/* The featured listing */}
            {hero ? (
              <Link
                href={`/store/${hero.slug}`}
                style={rarityVars(hero.rarityColor)}
                className="card-lift sheet sheet-featured group relative block overflow-hidden"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--color-bg)]">
                  {hero.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hero.imageUrl}
                      alt={hero.name}
                      className="absolute inset-0 h-full w-full object-contain p-12 transition-transform duration-[var(--dur-slow)] group-hover:scale-[1.03]"
                    />
                  ) : null}

                  {/* One stamp. */}
                  <span className="absolute left-5 top-5">
                    <Stamp press>
                      {hero.discountPct != null && hero.discountPct > 0
                        ? `−${hero.discountPct}% vs Steam`
                        : "New arrival"}
                    </Stamp>
                  </span>

                  {/* One callout — and its value is repeated in the block below. */}
                  <span className="absolute bottom-8 right-5 hidden sm:block">
                    <Callout side="left">{hero.rarity ?? "Grade unstated"}</Callout>
                  </span>
                </div>

                <RarityRule />

                <div className="grid gap-5 p-6 sm:grid-cols-[1.15fr_1fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <RarityTag rarity={hero.rarity} color={hero.rarityColor} />
                      {hero.isStatTrak ? <SpecTag tone="hold">ST™</SpecTag> : null}
                      {hero.phase ? <SpecTag tone="ink">{hero.phase}</SpecTag> : null}
                    </div>
                    <p className="microlabel mt-4">{hero.weapon ?? hero.category}</p>
                    <h2 className="drawing-title mt-1.5 text-[clamp(1.4rem,2.6vw,1.8rem)]">
                      {hero.skinName ?? hero.name}
                    </h2>
                    <p className="readout mt-4 text-[clamp(1.6rem,3.4vw,2.1rem)] font-semibold leading-none">
                      <HomePrice usd={hero.price} />
                    </p>
                    {heroExt ? <WearDiagram exterior={heroExt} className="mt-5" compact /> : null}
                  </div>

                  <TitleBlock
                    dense
                    rows={[
                      { label: "Grade", value: hero.rarity ?? "—", mono: false },
                      hero.count > 0 ? { label: "In stock", value: String(hero.count) } : null,
                      { label: "Category", value: hero.weapon ?? hero.category, mono: false },
                    ]}
                  />
                </div>
              </Link>
            ) : null}
          </div>

          {/* Category rail — plain pills of text, no drawing furniture. */}
          <nav aria-label="Categories" className="mt-12 flex flex-wrap gap-2">
            {CATEGORY_RAIL.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="inline-flex items-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-2.5 text-[15px] font-medium text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* CLEAN — newly listed */}
      <section className="bg-[color:var(--color-bg)]">
        <div className="mx-auto w-full max-w-[1360px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHead
            eyebrow="Just listed"
            title={<>Newly listed</>}
            action={
              <Link
                href="/store?sort=newest"
                className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[color:var(--color-accent)] hover:underline"
              >
                See all <ArrowRight size={15} />
              </Link>
            }
          />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {fresh.items.slice(0, 4).map((item, i) => (
              <div key={item.slug} className="animate-fadeInUp" data-stagger={(i % 6) + 1}>
                <SihItemCard item={item} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLEAN — marked down, only when something really is */}
      {deals.length > 0 ? (
        <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]">
          <div className="mx-auto w-full max-w-[1360px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
            <SectionHead
              eyebrow="Under Steam price"
              title={
                <>
                  Marked <Dimmed>down</Dimmed>
                </>
              }
              action={<SyncReadout everySeconds={60} label="Re-read in" tone="quiet" />}
            />
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {deals.map((item, i) => (
                <SihItemCard key={item.slug} item={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/*
        DRAWING MOMENT 2 of 3 — the wear gauge band.
        A section header band on the drafting field, with the reading copy and
        the instrument itself sitting on clean cards inside it.
      */}
      <section className="drafting-field border-y border-[color:var(--color-border)]">
        <div className="mx-auto w-full max-w-[1360px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionHead
              sheet="02"
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
        </div>
      </section>

      {/* CLEAN — grade legend */}
      <section className="bg-[color:var(--color-bg)]">
        <div className="mx-auto w-full max-w-[1360px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHead
            eyebrow="By grade"
            title={<>Pick a grade</>}
            lede="Mil-Spec blue through Covert red, plus the knife and glove tier. Pick a grade to see what is in stock at it."
          />
          <RarityExplorer className="mt-10" />
        </div>
      </section>

      {/*
        DRAWING MOMENT 3 of 3 — knives and gloves.
        The last technical zone on the page; everything below is plain.
      */}
      {knives.items.length > 0 ? (
        <section className="drafting-field border-y border-[color:var(--color-border)]">
          <div className="mx-auto w-full max-w-[1360px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
            <SectionHead
              sheet="03"
              eyebrow="Knives & gloves"
              title={<>The top shelf</>}
              lede="The highest-value knives and gloves currently in stock."
              action={
                <Link
                  href="/store?category=Knives"
                  className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[color:var(--color-accent)] hover:underline"
                >
                  See all <ArrowRight size={15} />
                </Link>
              }
            />
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {knives.items.slice(0, 4).map((item, i) => (
                <SihItemCard key={item.slug} item={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CLEAN — entry level */}
      {underTen.length > 0 ? (
        <section className="bg-[color:var(--color-bg)]">
          <div className="mx-auto w-full max-w-[1360px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
            <SectionHead
              eyebrow="Entry level"
              title={<>Under $10</>}
              action={
                <Link
                  href="/store?priceMax=10&sort=price_asc"
                  className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[color:var(--color-accent)] hover:underline"
                >
                  See all <ArrowRight size={15} />
                </Link>
              }
            />
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {underTen.map((item, i) => (
                <SihItemCard key={item.slug} item={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CLEAN — the ranked list */}
      {premium.items.length > 0 ? (
        <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]">
          <div className="mx-auto w-full max-w-[1360px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
            <SectionHead
              eyebrow="Ranked by price"
              title={<>The ten most expensive</>}
              lede="The ten highest-priced listings in stock. No votes and no hype — the order is the price order."
            />
            <TopTen items={premium.items.slice(0, 10)} className="mt-10" />
          </div>
        </section>
      ) : null}

      {/* CLEAN — steps and notes, plain backgrounds, numbered labels */}
      <section className="bg-[color:var(--color-bg)]">
        <div className="mx-auto w-full max-w-[1360px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHead eyebrow="Three steps" title={<>How it works</>} />

          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span
                  aria-hidden
                  className="readout block text-[15px] font-semibold text-[color:var(--color-accent)]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-3 text-[19px] font-semibold tracking-[-0.015em] text-[color:var(--color-text)]">
                  {s.title}
                </h3>
                <p className="measure-tight mt-2.5 text-[16px] leading-relaxed text-[color:var(--color-text-secondary)]">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {NOTES.map((b) => (
              <li key={b.tag}>
                <p className="label">{b.tag}</p>
                <p className="mt-3 text-[16px] leading-relaxed text-[color:var(--color-text-secondary)]">
                  {b.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
