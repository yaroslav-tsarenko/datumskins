import { Suspense } from "react";
import type { Metadata } from "next";
import { getSihFacets } from "@/lib/sih/queries";
import { SihCatalogClient } from "@/components/sih/SihCatalogClient";
import { Stamp, DimLine, Dimmed, SheetNum } from "@/components/ui/Stamp";
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
      <header className="border-b border-[color:var(--color-border)]">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-4 py-8 sm:px-6 lg:px-8">
          <DimLine className="max-w-[18rem]" />
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <SheetNum sheet="IDX" rev="A" />
            <span className="label">Index of sheets</span>
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="drawing-title text-[clamp(2rem,5vw,3.25rem)]">
                Every skin <Dimmed>in stock</Dimmed>
              </h1>
              <p className="mt-4 max-w-[54ch] text-[14.5px] leading-relaxed text-[color:var(--color-text-secondary)]">
                Live stock, priced in the open and delivered to your Steam inventory as a trade
                offer. Constrain by grade, wear or budget — the URL keeps your view, so you can
                share it exactly as you set it.
              </p>
            </div>
            <Stamp tone="approve" tilt="right" className="mb-1">
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
