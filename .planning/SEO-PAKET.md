# SEO-Paket rechner.akrona.de — Nächste Schritte

> Stand 2026-07-13, nach Audit + Hero-Tab-Switch (live, `5b923a9`).
> Befund: SEO-Basis fehlt komplett — kein robots.txt, keine Sitemap, kein Canonical, keine OG-Tags, kein hreflang, kein Schema, kein Analytics.

## Schritt 1 — Metadata-Basis (app/layout.tsx + app/romania/)

- [ ] `metadataBase: new URL('https://rechner.akrona.de')` setzen
- [ ] Meta-Description erweitern: Immobilienbewertung erwähnen (aktuell nur Bau + Privatkredit)
- [ ] OpenGraph + Twitter-Card: `og:title`, `og:description`, `og:image` (1200×630 im Akrona-Look — Dark Green, Gold, Logo; liegt evtl. Material in `~/Kunden/Akrona/_assets/`)
- [ ] `alternates.canonical` pro Route (`/`, `/romania`, Impressum/Datenschutz)
- [ ] `alternates.languages`: hreflang `de` ↔ `ro` (`/` ↔ `/romania`)

## Schritt 2 — robots.txt + Sitemap (Next App Router Conventions)

- [ ] `app/robots.ts` — allow all, Sitemap-Verweis, `/api/` disallow
- [ ] `app/sitemap.ts` — `/`, `/romania`, `/impressum`, `/datenschutz`, `/romania/impressum`, `/romania/datenschutz`

## Schritt 3 — Structured Data (JSON-LD)

- [ ] `FAQPage`-Schema aus den 6 FAQ-Einträgen (`lib/translations.ts` faqQ1–6) — DE auf `/`, RO auf `/romania`
- [ ] `FinancialService`-Schema: Akrona GmbH, Alperen Akbal, Esslinger Str. 9, § 34c/34i GewO, IHK Stuttgart, `sameAs: https://akrona.de`
- [ ] Als `<script type="application/ld+json">` im Layout/Page rendern

## Schritt 4 — Analytics (Entscheidung Mario/Alperen nötig)

- [ ] Empfehlung: **Vercel Web Analytics** — cookieless, kein Consent-Banner, `@vercel/analytics` + `<Analytics />` im Layout
- [ ] Custom Events: `rechner_started` (erster Input je Tab), `lead_submitted` (LeadModal + Bewertungs-Wizard Success)
- [ ] Alternative GA4 nur falls explizit gewünscht → bräuchte Cookie-Consent-Banner (DSGVO)

## Schritt 5 — Content-Konsistenz (Quick Wins, gleiche Session)

- [ ] „400+ Banken" vs. akrona.de „über 500 Banken" — mit Alperen klären, dann überall gleiche Zahl (translations.ts `banksCount` + `bentoNetwork*`)
- [ ] CTA unten: `mailto:info@akrona.de` ersetzen durch Link auf akrona.de-Kontakt oder `tel:` — mailto ist Desktop-Sackgasse
- [ ] `next/image` Warnung: `sizes`-Prop am Hero-Mockup (`akrona-mockup.png`, fill)

## Später / separat

- Multi-Zone-Rewrite: akrona.de rewritet `/rechner/*` auf dieses Deployment (basePath nötig) → Domain-Autorität auf Hauptdomain. Erst wenn SEO-Traffic echtes Ziel ist.
- Hero-Mockup-PNG: EN/DE-Mix im Phone-UI („Repayment Chart") — Grafik neu exportieren.

## Verification

- `npm run build` grün
- `curl https://rechner.akrona.de/robots.txt` + `/sitemap.xml` → 200
- OG-Preview: opengraph.xyz oder WhatsApp-Link-Test
- Rich-Results-Test (Google) für FAQPage + FinancialService
- Vercel-Dashboard: Analytics-Events sichtbar nach Test-Lead
