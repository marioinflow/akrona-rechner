# Akrona Finanzierungsrechner — Next.js Lead-Funnel für Akrona Immobilien, live auf rechner.akrona.de

## Start
- Vor Push: `npm run build` lokal testen
- Push → `main` → Auto-Deploy Vercel → rechner.akrona.de prüfen

## Struktur
```
app/
  globals.css     ← Tailwind @theme, Brand Colors, Base Styles
  layout.tsx      ← Root Layout (Inter Font, Metadata)
  page.tsx        ← Homepage (Rechner-Auswahl)
  rechner/        ← Rechner-Seiten
  api/send-pdf/   ← PDF-Generierung + E-Mail-Versand (maxDuration: 60s)
components/
  rechner/        ← BaufinanzierungRechner, PrivatkreditRechner
  ui/             ← Header, Footer, LeadModal, BonitaetBadge
lib/
  pdf-template.tsx ← @react-pdf/renderer Template (4 Seiten)
  supabase.ts      ← Lazy Supabase Client
```
- Supabase-Tabellen: `leads`, `newsletter_subscribers`
- E-Mail: Resend, Absender `noreply@akrona.de`, Reply-To `info@akrona.de`
- Design-System: `/Users/marioalbrecht/NovaraPro_Claude_Code/design-system/APPLE_HIG_CORE.md` (Apple HIG + Akrona-Brand drüber)

## Regeln
- Kunde: Alperen, Akrona Immobilien Esslingen, Details in `~/Kunden/Akrona/CLAUDE.md`
- Supabase-Client NIE auf Module-Level initialisieren (Build-Fehler) → immer `getSupabase()`/`createServerClient()` lazy
- Tailwind-Farben/Fonts nur via `@theme` in `app/globals.css`, kein `tailwind.config.ts`
- `lib/pdf-template.tsx`: @react-pdf/renderer kennt kein `borderRadius`-Shorthand → einzeln (`borderTopLeftRadius` etc.), neue Stile vorher prüfen
- Kein `transition: all`, nur `transform`/`opacity` animieren
```
Farben: dark-green #0A3D2C(Primary/Buttons/Headings), light-green #0A5D3F(Hover/Accent), gold #D4AF37(CTA), bg #F7F5F0, border #E8E2D9, muted #6b6b6b
Spacing 4/8px-Basis: 4 Micro, 8 Small, 12 Padding, 16 Card/Page-Margin, 20 Medium, 24 Section, 32 Major
Targets min. 44×44px, Radius 10px (Pill 9999px), Cards 12px
Fokus-Ring 3px blau, Hover translateY(-2px)+Shadow, Active scale(0.97)/opacity:0.85
Timing: Press 100ms, Hover 200ms, Fade-In 300ms translateY(8px)→0
Easing cubic-bezier(0.25,0.46,0.45,0.94), Spring cubic-bezier(0.34,1.56,0.64,1.00)
```

## Stand
- Live auf rechner.akrona.de, Auto-Deploy über Vercel ab `main`
