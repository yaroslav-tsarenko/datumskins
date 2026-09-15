import { Suspense } from "react";
import type { Metadata } from "next";
import { getSihFacets } from "@/lib/sih/queries";
import { SihCatalogClient } from "@/components/sih/SihCatalogClient";
import { Stamp, Dimmed } from "@/components/ui/Stamp";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Store — ${brand.displayName}`,
  description:
    "Buy real CS2 skins delivered straight to your Steam inventory. Live stock, live prices, verified exteriors.",
};

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const facets = await getSihFacets();

  return (
    <>
      <header className="drafting-field border-b border-[color:var(--color-border)]">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-5 py-12 sm:px-6 lg:px-8">
          <span className="label">Catalogue</span>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="drawing-title text-[clamp(2rem,4.8vw,3rem)]">
                Every skin <Dimmed>in stock</Dimmed>
              </h1>
              <p className="measure mt-5 text-[17px] leading-[1.65] text-[color:var(--color-text-secondary)]">
                Live stock, priced in the open and delivered to your Steam inventory as a trade
                offer. Filter by grade, wear or budget — the URL keeps your view, so you can share
                it exactly as you set it.
              </p>
            </div>
            <Stamp tone="approve" tilt="right" className="mb-1.5">
              Delivered via Steam trade
            </Stamp>
          </div>
        </div>
      </header>
      <Suspense fallback={null}>
        <SihCatalogClient facets={facets} />
      </Suspense>
    </>
  );
}
