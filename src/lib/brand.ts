/**
 * Central brand identity for Datumskins.
 * Import from here instead of hardcoding company details in components.
 *
 * Company / contact details are env-driven (NEXT_PUBLIC_* so they resolve in
 * both server and client components) with the registered CHANGE IT UP SERVICES LTD
 * particulars as fallbacks. Set the vars in `.env` to override per-deploy.
 */

const env = (key: string, fallback: string) =>
  (process.env[key] ?? "").trim() || fallback;

const company = {
  legalName: env("NEXT_PUBLIC_COMPANY_LEGAL_NAME", "CHANGE IT UP SERVICES LTD"),
  number: env("NEXT_PUBLIC_COMPANY_NUMBER", "16107295"),
  address: {
    line1: env("NEXT_PUBLIC_COMPANY_ADDRESS", "14 Broadway"),
    line2: env("NEXT_PUBLIC_COMPANY_ADDRESS_LINE2", ""),
    city: env("NEXT_PUBLIC_COMPANY_CITY", "Nottingham"),
    region: env("NEXT_PUBLIC_COMPANY_REGION", ""),
    postcode: env("NEXT_PUBLIC_COMPANY_POSTCODE", "NG1 1PS"),
    country: env("NEXT_PUBLIC_COMPANY_COUNTRY", "United Kingdom"),
  },
} as const;

const contactEmail = env("NEXT_PUBLIC_CONTACT_EMAIL", "info@datumskins.com");

export const brand = {
  name: "datumskins",
  displayName: "Datumskins",
  domain: "www.datumskins.com",
  url: "https://www.datumskins.com",
  tagline: "Every skin, fully specified.",
  description:
    "Datumskins — a CS2 skins store that treats every listing as a technical document. Live stock, a stated exterior and float range, pattern seed and trade-lock status on the sheet, priced in the open and delivered to your Steam inventory as a trade offer.",
  applicationName: "Datumskins",

  company,

  contact: {
    email: contactEmail,
    emailB2B: contactEmail,
    phone: env("NEXT_PUBLIC_CONTACT_PHONE", ""),
    phoneHref: `tel:${env("NEXT_PUBLIC_CONTACT_PHONE", "").replace(/\s+/g, "")}`,
    contactPage: "/contact",
  },

  social: {
    linkedin: "https://www.linkedin.com/company/datumskins/",
    instagram: "https://www.instagram.com/datumskins/",
    twitter: "@datumskins",
  },
} as const;

export const brandAddressLine = [
  brand.company.address.line1,
  brand.company.address.line2,
  brand.company.address.city,
  brand.company.address.region,
  brand.company.address.postcode,
  brand.company.address.country,
]
  .filter(Boolean)
  .join(", ");

export const brandLegalLine = [
  brand.company.legalName,
  `Company No. ${brand.company.number}`,
  brandAddressLine,
]
  .filter(Boolean)
  .join(" · ");
