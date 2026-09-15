import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NotFoundSearch } from "@/components/shared/NotFoundSearch";
import { Stamp } from "@/components/ui/Stamp";

/**
 * 404: the number set large in charcoal with a single stamp pressed across it,
 * then one clear way back. No drawing furniture — an error page is the last
 * place anyone wants to decode a diagram.
 */
export default function NotFound() {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <main className="mx-auto flex min-h-screen max-w-[760px] flex-col justify-center gap-6 px-5 py-16">
          <span aria-hidden className="tape-rule" />
          <div className="relative">
            <span
              aria-hidden
              className="font-display block select-none text-[clamp(5rem,22vw,12rem)] font-semibold leading-[0.85] tracking-[-0.03em] text-[color:var(--color-text)]"
            >
              404
            </span>
            <span className="absolute left-[18%] top-[48%]">
              <Stamp tone="hold" press>
                Not found
              </Stamp>
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label">Page not found</span>
            <h1 className="drawing-title text-[clamp(1.75rem,4.6vw,2.5rem)]">
              Nothing at this address.
            </h1>
            <p className="measure text-[17px] leading-[1.65] text-[color:var(--color-text-secondary)]">
              The link may be out of date, or the item may have sold. Search for the skin, or head
              back to the catalogue.
            </p>
          </div>

          <NotFoundSearch />

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/store"
              className="inline-flex h-13 items-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-primary-strong)] px-6 text-[16px] font-semibold text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
            >
              Browse all skins <ArrowRight size={16} />
            </Link>
            <Link
              href="/"
              className="inline-flex h-13 items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-6 text-[16px] font-semibold text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
            >
              Return home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
