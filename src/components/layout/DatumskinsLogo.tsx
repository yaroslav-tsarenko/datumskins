/**
 * Datumskins mark — a drafting compass mid-sweep.
 *
 * Pivot, two legs, the needle point marked with an inspection-red datum dot
 * and the sweep it has just drawn dashed in beneath. It is the instrument that
 * makes a drawing, which is what this store does to a skin. Drawn on a 32×32
 * grid so it stays crisp down to 16px. Original artwork — no game assets.
 */
export function DatumskinsMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* The swept arc — what the compass has already drawn. */}
      <path
        d="M9 24.5A20 20 0 0 0 23 24.5"
        stroke="var(--color-blueprint-soft)"
        strokeWidth="1.2"
        strokeDasharray="2.6 2.2"
        strokeLinecap="round"
      />
      {/* The two legs, hinged at the pivot. */}
      <g
        stroke="var(--color-accent)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 7.4 9.2 24.6" />
        <path d="M16 7.4 22.8 24.6" />
      </g>
      {/* The pivot head. */}
      <circle cx="16" cy="5.2" r="2.8" fill="var(--color-accent)" />
      <circle cx="16" cy="5.2" r="0.9" fill="var(--color-bg-elevated)" />
      {/* The needle point sets the datum. */}
      <circle cx="9.2" cy="25.2" r="2" fill="var(--color-primary)" />
    </svg>
  );
}

/**
 * The wordmark. "Datum" in blueprint ink, "skins" in drafting charcoal, with
 * the whole extent dimensioned underneath by a ticked rule — the identity in
 * miniature: a measured thing, labelled.
 *
 * `size` is the cap height in px; everything else scales from it.
 */
export function DatumskinsLogo({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <DatumskinsMark size={size * 1.4} />
      <span className="inline-flex flex-col gap-[0.22em]">
        <span
          className="font-display inline-flex items-baseline leading-none"
          style={{ fontSize: size, fontWeight: 700 }}
        >
          <span className="text-[color:var(--color-accent)]">Datum</span>
          <span className="text-[color:var(--color-text)]" style={{ fontWeight: 400 }}>
            skins
          </span>
        </span>
        <span aria-hidden className="dim-line block w-full" />
      </span>
    </span>
  );
}
