# Akrona Finanzierungsrechner — Projekt-Regeln für Claude Code

## Tech Stack
- **Framework:** Next.js (App Router, Turbopack)
- **Styling:** Tailwind v4 (CSS-Variables via `@theme` in `app/globals.css`)
- **Sprache:** TypeScript
- **Backend:** Supabase (lazy init via `getSupabase()` — NICHT module-level)
- **E-Mail:** Resend (`noreply@akrona.de`, Reply-To: `info@akrona.de`)
- **Deploy:** Vercel (Auto-Deploy auf `main` branch → rechner.akrona.de)

## Design System

Alle UI-Arbeiten folgen dem Apple HIG Design System unter:
**`/Users/marioalbrecht/NovaraPro_Claude_Code/design-system/`**

Kompakt-Referenz: `design-system/APPLE_HIG_CORE.md`

### Akrona Brand Colors (bleiben erhalten, HIG-Prinzipien drüber)
```css
--color-dark-green:  #0A3D2C   /* Primary brand — Buttons, Headings */
--color-light-green: #0A5D3F   /* Secondary brand — Hover, Accents */
--color-gold:        #D4AF37   /* Accent — CTA, Highlights */
--color-bg:          #F7F5F0   /* Page background */
--color-border:      #E8E2D9   /* Borders, Separators */
--color-muted:       #6b6b6b   /* Label Secondary */
```

### Spacing (immer Vielfache von 4/8px)
```
4px  → Micro (Icon-to-label)
8px  → Small gap
12px → Compact padding
16px → Standard card padding / page margin
20px → Medium spacing
24px → Section gap
32px → Major section break
```

### Komponenten-Standards
- **Buttons:** min. 44×44px, `border-radius: 10px` (Standard) oder `9999px` (Pill)
- **Inputs:** Höhe 44px, `border-radius: 10px`, Fill-Background
- **Cards:** `border-radius: 12px`, `padding: 16px`, subtiler Shadow
- **Touch Targets:** IMMER min. 44×44px
- **Fokus-Ring:** 3px blauer Ring bei `:focus-visible`
- **Hover:** `translateY(-2px)` + Shadow-Upgrade bei interaktiven Cards
- **Active/Press:** `scale(0.97)` + `opacity: 0.85` bei Buttons

### Animationen
```
Button Press:  100ms ease, scale(0.97)
Card Hover:    200ms ease, translateY(-2px)
Fade In:       300ms ease-out, translateY(8px) → 0
Easing:        cubic-bezier(0.25, 0.46, 0.45, 0.94)  /* Standard */
Spring:        cubic-bezier(0.34, 1.56, 0.64, 1.00)  /* Bouncy Entrance */
```
Kein `transition: all` verwenden. Nur `transform` und `opacity` animieren.

## Wichtige Technische Hinweise

### @react-pdf/renderer (PDF-Template)
- `lib/pdf-template.tsx` — KEINE `borderRadius` Kurzschreibweise!
- Immer einzelne Eigenschaften: `borderTopLeftRadius`, `borderTopRightRadius` etc.
- Bei neuen Stilen: vorher prüfen ob @react-pdf sie unterstützt

### Supabase
- Client NIEMALS auf Module-Level initialisieren (Build-Fehler)
- Immer `getSupabase()` / `createServerClient()` lazy verwenden
- Tabellen: `leads` + `newsletter_subscribers`

### Tailwind v4
- Farben und Fonts werden via `@theme` in `app/globals.css` definiert
- NICHT in `tailwind.config.ts` (existiert nicht / nicht nötig)
- Custom Klassen direkt in globals.css oder als inline-Styles

## Workflow
1. **Vor Änderungen:** Relevante Komponente lesen (`/components/` oder `/app/rechner/`)
2. **Design-Entscheidungen:** Apple HIG Spacing + Akrona Brand Colors kombinieren
3. **Nach Änderungen:** `npm run build` lokal testen bevor Push
4. **Push → main:** Auto-Deploy auf Vercel → rechner.akrona.de testen

## Projektstruktur
```
app/
  globals.css          ← Tailwind @theme, Brand Colors, Base Styles
  layout.tsx           ← Root Layout (Inter Font, Metadata)
  page.tsx             ← Homepage (Rechner-Auswahl)
  rechner/             ← Rechner-Seiten
  api/send-pdf/        ← PDF-Generierung + E-Mail-Versand (maxDuration: 60s)
components/
  rechner/             ← BaufinanzierungRechner, PrivatkreditRechner
  ui/                  ← Header, Footer, LeadModal, BonitaetBadge
lib/
  pdf-template.tsx     ← @react-pdf/renderer Template (4 Seiten)
  supabase.ts          ← Lazy Supabase Client
```
