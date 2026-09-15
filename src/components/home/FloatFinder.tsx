"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { EXTERIORS, type ExteriorCode } from "@/lib/skins/shared";
import { WearDiagram } from "@/components/ui/WearDiagram";
import { ArrowRight } from "lucide-react";

/**
 * The wear gauge — the interactive instrument of the identity.
 *
 * Move the pointer along the 0.0000–1.0000 extent; the diagram brackets the
 * zone the pointer falls in, and the count underneath comes from the live
 * catalogue, so the number on screen is the number of skins actually in that
 * wear zone right now. The pointer's value is genuinely yours — it is the one
 * exact float on the page, because you set it.
 */
export function FloatFinder({ className }: { className?: string }) {
  const [pos, setPos] = useState(0.1);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const band = useMemo(() => {
    return (
      EXTERIORS.find((e) => pos >= e.floatMin && pos < e.floatMax) ??
      EXTERIORS[EXTERIORS.length - 1]
    );
  }, [pos]);

  useEffect(() => {
    let cancelled = false;
    const code: ExteriorCode = band.code;
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/sih/catalog?exterior=${code}&perPage=1`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (cancelled) return;
          setCount(typeof data?.total === "number" ? data.total : null);
        })
        .catch(() => {
          if (!cancelled) setCount(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [band]);

  return (
    <div
      className={`sheet p-6 sm:p-8 ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="label">Wear gauge</span>
        <span className="readout text-[17px] font-semibold text-[color:var(--color-text)]">
          {pos.toFixed(4)}
        </span>
      </div>

      {/* The drawing reads the pointer; the pointer is the control. */}
      <WearDiagram exterior={band.code} value={pos} labels={false} className="mt-5" />

      <div className="mt-3">
        <label htmlFor="float-finder" className="sr-only">
          Float value
        </label>
        <input
          id="float-finder"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-valuetext={`${pos.toFixed(4)}, ${band.label}`}
          className="spec-slider w-full cursor-pointer"
        />
        <div className="mt-2.5 flex justify-between">
          {EXTERIORS.map((e) => (
            <button
              key={e.code}
              type="button"
              onClick={() => setPos((e.floatMin + e.floatMax) / 2)}
              className={[
                "focus-amber rounded-[var(--radius-sm)] px-2 py-1 font-mono text-[12px] uppercase tracking-[0.1em] transition-colors",
                e.code === band.code
                  ? "font-semibold text-[color:var(--color-text)]"
                  : "font-medium text-[color:var(--color-text-tertiary)] hover:text-[color:var(--color-text)]",
              ].join(" ")}
            >
              {e.short}
            </button>
          ))}
        </div>
      </div>

      {/* The readout, ruled off like a title block */}
      <div className="mt-8 grid grid-cols-2 items-end gap-4 border-t border-[color:var(--color-border)] pt-6">
        <div>
          <span className="label block">Zone</span>
          <p className="drawing-title mt-2 text-[clamp(1.4rem,3.4vw,1.9rem)]">{band.label}</p>
          <p className="readout mt-1.5 text-[14px] text-[color:var(--color-text-secondary)]">
            {band.floatMin.toFixed(2)} – {band.floatMax.toFixed(2)}
          </p>
        </div>

        <div className="text-right">
          <span className="label block">In stock</span>
          <p
            className="readout mt-2 text-[clamp(1.4rem,3.4vw,1.9rem)] font-semibold leading-none text-[color:var(--color-text)]"
            aria-live="polite"
          >
            {loading && count == null ? "—" : count != null ? count.toLocaleString() : "—"}
          </p>
        </div>
      </div>

      <Link
        href={`/store?exterior=${band.code}`}
        className="focus-amber mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-primary-strong)] text-[15px] font-semibold text-[color:var(--color-primary-fg)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
      >
        Show {band.short} skins <ArrowRight size={15} />
      </Link>
    </div>
  );
}
