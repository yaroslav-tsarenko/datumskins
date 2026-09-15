import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { ReactNode } from "react";
import { brand, brandAddressLine } from "@/lib/brand";

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Policy pages keep the drawing masthead but drop into a plain, readable
 * measure — long legal copy is the one place where the identity gets out of
 * the way and lets the text do its job.
 */
export function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 [overflow-wrap:anywhere] [word-break:break-word]">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Policies", href: "/policies" },
          { label: title },
        ]}
      />
      <span aria-hidden className="tape-rule" />
      <span className="label mt-5 block">Policies</span>
      <h1 className="drawing-title mb-4 mt-3 text-[clamp(1.75rem,4.5vw,2.6rem)]">{title}</h1>
      <p className="readout mb-10 text-[14px] text-[color:var(--color-text-tertiary)]">
        Last updated: {lastUpdated}
      </p>
      <div
        className="prose-policy measure text-[16px] leading-[1.7] text-[color:var(--color-text-secondary)] max-sm:text-sm max-sm:leading-[1.65] [&_h2]:font-display [&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h2]:text-[color:var(--color-accent)] max-sm:[&_h2]:mt-7 max-sm:[&_h2]:text-[17px] [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[color:var(--color-text)] max-sm:[&_h3]:text-[15px] [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:ml-6 [&_ul]:mt-2 [&_ul]:list-disc [&_ul>li]:mb-1 [&_a]:text-[color:var(--color-accent)] [&_a]:underline [&_a]:underline-offset-2 [&_table]:my-4 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:text-sm [&_th]:border [&_th]:border-[color:var(--color-line)] [&_th]:bg-[color:var(--color-bg-secondary)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-[color:var(--color-text)] [&_th]:[word-break:break-word] [&_td]:border [&_td]:border-[color:var(--color-line)] [&_td]:px-3 [&_td]:py-2 [&_td]:text-left [&_td]:[word-break:break-word]"
      >
        {children}
      </div>
    </div>
  );
}

export function ContactBlock() {
  return (
    <div className="mt-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] border-l-[3px] border-l-[color:var(--color-accent)] bg-[color:var(--color-bg-elevated)] px-5 py-4 text-[15px] leading-relaxed">
      <p>
        <strong>{brand.company.legalName}</strong>
        <br />
        Company number: {brand.company.number}
        <br />
        Registered office: {brandAddressLine}
        <br />
        General email: {brand.contact.email}
      </p>
    </div>
  );
}
