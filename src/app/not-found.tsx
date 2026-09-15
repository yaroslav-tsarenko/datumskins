import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NotFoundSearch } from "@/components/shared/NotFoundSearch";
import { Stamp } from "@/components/ui/Stamp";

/**
 * 404 as a missing sheet: the number set enormous in blueprint ink, a VOID
 * stamp pressed across it, and one way back to the index.
 */
export default function NotFound() {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <main className="mx-auto flex min-h-screen max-w-[760px] flex-col justify-center gap-6 px-5 py-16">
          <hr className="tape-rule border-0" />
          <div className="relative">
            <span
              aria-hidden
              className="font-display block select-none text-[clamp(6rem,26vw,14rem)] font-bold leading-[0.78] tracking-[-0.03em] text-[color:var(--color-accent)]"
            >
              404
            </span>
            <span className="absolute left-[22%] top-[46%] text-[1.6rem]">
              <Stamp tone="hold" press>
                Sheet not issued
              </Stamp>
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label">Page not found</span>
            <h1 className="drawing-title text-[clamp(1.75rem,5vw,2.75rem)]">
              No sheet at this reference.
            </h1>
            <p className="max-w-[52ch] text-[15px] leading-relaxed text-[color:var(--color-text-secondary)]">
              The link may be out of date, or the item may have sold. Look the designation up, or
              go back to the index.
            </p>
          </div>

          <NotFoundSearch />

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 bg-[color:var(--color-primary-strong)] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
            >
              Back to the index <ArrowRight size={13} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-[color:var(--color-accent)] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)] transition-colors hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)]"
            >
              Return home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
