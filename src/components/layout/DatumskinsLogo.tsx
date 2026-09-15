/**
 * Datumskins mark — a drafting compass mid-sweep.
 *
 * Pivot, two legs, the needle point marked with an inspection-red datum dot
 * and the arc it has just drawn dashed in beneath. It is the instrument that
 * makes a drawing, which is what this store does to a skin. Drawn on a 32×32
 * grid so it stays crisp down to 16px. Original artwork — no game assets.
 *
 * The blue here is one of the places the brand thread is allowed to be solid
 * colour: the logo, the active nav rule, section-title rules, and icon strokes.
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
        strokeWidth="1.3"
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
 * The wordmark. "Datum" in charcoal at semibold, "skins" in the same charcoal
 * at regular — the contrast is weight, not colour, so the name reads as text.
 * The one blue element is the short rule beneath it: the same rule that marks
 * an active nav tab and underlines a section title.
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
      <span className="inline-flex flex-col gap-[0.24em]">
        <span
          className="font-display inline-flex items-baseline leading-none text-[color:var(--color-text)]"
          style={{ fontSize: size, fontWeight: 600 }}
        >
          Datum
          <span style={{ fontWeight: 400 }}>skins</span>
        </span>
        <span
          aria-hidden
          className="block h-[2px] w-full rounded-[1px] bg-[color:var(--color-accent)]"
        />
      </span>
    </span>
  );
}
