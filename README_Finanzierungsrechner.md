# Akrona Finanzierungsrechner — Web App

> **Für Claude Code:** Lies diese README vollständig durch, bevor du anfängst. Sie enthält alle Anforderungen, den Tech Stack, die Datenbankstruktur, die Berechnungslogik und alle DSGVO-Anforderungen. Baue die App exakt nach dieser Spezifikation.

---

## Projektübersicht

Eine eigenständige, produktionsreife Web-App für die **Akrona GmbH** (Immobilien & Investment, Stuttgart). Die App ist ein **Finanzierungsrechner mit Lead-Funnel**: Nutzer berechnen ihre Finanzierungsmöglichkeit, sehen ein Teilergebnis sofort, und erhalten das vollständige Ergebnis als **PDF per E-Mail** nach Dateneingabe.

Die App wird auf einer eigenen Domain gehostet und von der Akrona-Website (Framer) verlinkt.

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Styling | **Tailwind CSS** |
| Datenbank | **Supabase** (PostgreSQL) |
| PDF-Generierung | **@react-pdf/renderer** |
| E-Mail-Versand | **Resend** (mit eigenem Template) |
| Deployment | **Vercel** |
| Sprache | TypeScript |

---

## Brand & Design

```
Farben:
  --white:       #FFFFFF
  --bg:          #F7F5F0
  --light-green: #0A5D3F
  --gold:        #D4AF37
  --dark-green:  #0A3D2C
  --border:      #E8E2D9
  --muted:       #6b6b6b

Fonts (Google Fonts):
  Display: Cormorant Garamond (300, 400, 500, 600)
  Body:    DM Sans (300, 400, 500)
```

Design-Prinzip: **Light, elegant, premium**. Weißer Hintergrund, Dark-Green-Header, Gold-Akzente. Kein generisches AI-Design.

---

## Seitenstruktur

```
/                   → Landing Page mit Rechner
/impressum          → Impressum (statisch)
/datenschutz        → Datenschutzerklärung (statisch)
/api/calculate      → POST: Berechnung & Lead speichern
/api/send-pdf       → POST: PDF generieren & E-Mail senden
```

---

## Landing Page — Aufbau (`/`)

### 1. Header
- Logo: "AKRONA GmbH" (Cormorant, Dark Green, "GmbH" in Gold)
- Rechts: "§ 34c & § 34i GewO · IHK Region Stuttgart"

### 2. Hero Section (Dark Green Hintergrund)
- Eyebrow: "Ersteinschätzung · Kostenlos & unverbindlich"
- H1: "Wie viel Finanzierung ist für Sie möglich?"
- Subtext: "Ermitteln Sie Ihre persönliche Finanzierungsmöglichkeit in wenigen Sekunden."

### 3. Info-Sektion (3 Spalten, kurze Texte)
```
Spalte 1: "Bankfaustregel erklärt"
→ Als Faustregel gilt: Nettoeinkommen × 100 = max. Kreditrahmen.
   Faktoren wie Eigenkapital, Beschäftigung und Haushalt beeinflussen den Zinssatz.

Spalte 2: "Was ist Bonität?"
→ Ihre Bonität beeinflusst direkt den Zinssatz. Beamte und Angestellte
   erhalten bessere Konditionen als Selbstständige.

Spalte 3: "Ersteinschätzung vs. Zusage"
→ Dieser Rechner gibt eine realistische Orientierung — keine Bankzusage.
   Für verbindliche Angebote steht Ihnen unser Team persönlich zur Verfügung.
```

### 4. Rechner (Tab-System)
Zwei Tabs: **Baufinanzierung** | **Privatkredit**

### 5. Footer
- Links: Impressum, Datenschutz
- Text: "© 2025 Akrona GmbH · Alperen Akbal · IHK Region Stuttgart"

---

## Rechner — Tab 1: Baufinanzierung

### Eingabefelder

| Feld | Typ | Pflicht |
|---|---|---|
| Monatliches Nettoeinkommen (€) | Number Input | ✅ |
| Eigenkapital (€) | Number Input | ✅ |
| Haushaltsgröße | Select: 1 / 2 / 3 / 4 / 5+ Personen | ✅ |
| Laufzeit | Select: 10 / 15 / 20 / 25 / 30 Jahre | ✅ |
| Beschäftigungsstatus | Radio: Angestellt / Beamter / Selbstständig / Rente | ✅ |
| Verwendungszweck | Radio: Kauf / Neubau / Anschlussfinanzierung | ✅ |

### Berechnung

**Schritt 1 — Bonitäts-Score berechnen (intern, 0–9 Punkte):**

```
Beschäftigung:
  Beamter       → +3
  Angestellt    → +2
  Rente         → +1
  Selbstständig → +0

Eigenkapital-Quote (EK / max. Kredit):
  > 20%         → +2
  10–20%        → +1
  < 10%         → +0

Haushaltsgröße:
  1–2 Personen  → +2
  3 Personen    → +1
  4+ Personen   → +0

Einkommensbelastung (Rate / Netto):
  < 25%         → +2
  25–33%        → +1
  > 33%         → +0
```

**Schritt 2 — Zinssatz aus Score:**

```
Score 7–9  → Bonität: "Sehr gut"  → Zinssatz: 3,6%
Score 4–6  → Bonität: "Mittel"    → Zinssatz: 4,1%
Score 0–3  → Bonität: "Basis"     → Zinssatz: 4,8%
```

**Schritt 3 — Kernberechnung:**

```
Haushaltsabzug:
  1 Person  → 0 €
  2 Personen → 350 €
  3 Personen → 600 €
  4 Personen → 850 €
  5+ Personen → 1.100 €

Statusmultiplikator:
  Angestellt    → 1,0
  Beamter       → 1,1
  Selbstständig → 0,85
  Rente         → 0,9

verfuegbaresEinkommen = (nettoeinkommen - haushaltsabzug) * statusMultiplikator
maxKredit = Math.round(verfuegbaresEinkommen * 100 / 1000) * 1000
kaufkraft = maxKredit + eigenkapital

monatlicheRate = maxKredit * (zinssatz + 0.02) / 12
  // 0.02 = 2% Tilgung p.a.
```

### Teilergebnis (sofort sichtbar)
- Max. Kreditsumme
- Monatliche Rate (ca.)
- Kaufkraft gesamt (inkl. Eigenkapital)
- Bonitäts-Badge: 🟢 Sehr gut / 🟡 Mittel / 🔴 Basis

---

## Rechner — Tab 2: Privatkredit

### Eingabefelder

| Feld | Typ | Pflicht |
|---|---|---|
| Monatliches Nettoeinkommen (€) | Number Input | ✅ |
| Gewünschte Kreditsumme (€) | Number Input | optional |
| Haushaltsgröße | Select: 1–5+ | ✅ |
| Laufzeit | Select: 12 / 24 / 36 / 48 / 60 / 84 Monate | ✅ |
| Beschäftigungsstatus | Radio: Angestellt / Beamter / Selbstständig / Rente | ✅ |

### Berechnung

**Bonitäts-Score:** gleiche Logik wie Baufinanzierung (ohne EK-Faktor)

```
Score 7–8  → Zinssatz: 5,9%
Score 4–6  → Zinssatz: 6,9%
Score 0–3  → Zinssatz: 8,9%
```

**Kernberechnung (Annuitätenformel):**

```
maxMonatsRate = verfuegbaresEinkommen * 0.33
monatszins = zinssatz / 12

maxKredit = maxMonatsRate * (1 - (1 + monatszins)^(-laufzeit)) / monatszins

aktuellerKredit = min(wunschkredit || maxKredit, maxKredit)

monatsRate = aktuellerKredit * monatszins / (1 - (1 + monatszins)^(-laufzeit))
gesamtkosten = monatsRate * laufzeit
```

### Teilergebnis (sofort sichtbar)
- Max. Kreditrahmen
- Monatliche Rate
- Gesamtkosten inkl. Zinsen
- Bonitäts-Badge

---

## Lead-Funnel & DSGVO

### Ablauf
1. Nutzer sieht Teilergebnis
2. Unterhalb: unscharfer Detailbereich + CTA "Vollständige Auswertung per E-Mail erhalten"
3. Modal öffnet sich mit Formular
4. Nach Eintragung: Bestätigung + automatischer PDF-Versand

### Pflichtfelder im Modal
- Vorname (Text)
- Nachname (Text)
- E-Mail-Adresse (Email, validiert)

### DSGVO-Checkboxen (alle Pflicht, einzeln anklickbar)

```
☐ [PFLICHT] Ich habe die Datenschutzerklärung gelesen und stimme der 
  Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage zu. 
  (Art. 6 Abs. 1 lit. b DSGVO)
  → Link zur /datenschutz Seite

☐ [PFLICHT] Ich bin damit einverstanden, dass Akrona GmbH mich per 
  E-Mail zu meiner Anfrage kontaktiert.

☐ [OPTIONAL] Ich möchte den Akrona Newsletter erhalten und stimme der 
  Verwendung meiner E-Mail-Adresse für Marketingzwecke zu. 
  Diese Einwilligung kann ich jederzeit widerrufen.
```

**Hinweis unter dem Formular:**
> "Ihre Daten werden nicht an Dritte weitergegeben. Speicherung gemäß DSGVO. Widerruf jederzeit möglich unter datenschutz@akrona-gmbh.de"

---

## Datenbank (Supabase)

### Tabelle: `leads`

```sql
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  -- Kontakt
  vorname         TEXT NOT NULL,
  nachname        TEXT NOT NULL,
  email           TEXT NOT NULL,
  
  -- Rechner-Typ
  rechner_typ     TEXT NOT NULL, -- 'baufinanzierung' | 'privatkredit'
  
  -- Einwilligungen (DSGVO)
  consent_datenschutz   BOOLEAN NOT NULL DEFAULT FALSE,
  consent_kontakt       BOOLEAN NOT NULL DEFAULT FALSE,
  consent_newsletter    BOOLEAN DEFAULT FALSE,
  consent_timestamp     TIMESTAMPTZ DEFAULT NOW(),
  consent_ip            TEXT, -- IP-Adresse zum Zeitpunkt der Einwilligung
  
  -- Eingabewerte (als JSONB gespeichert)
  eingaben        JSONB NOT NULL,
  
  -- Berechnungsergebnis (als JSONB gespeichert)
  ergebnis        JSONB NOT NULL,
  
  -- Bonitätsscore
  bonitaet_score  INTEGER,
  bonitaet_label  TEXT, -- 'Sehr gut' | 'Mittel' | 'Basis'
  
  -- Status
  pdf_sent        BOOLEAN DEFAULT FALSE,
  pdf_sent_at     TIMESTAMPTZ
);
```

### Tabelle: `newsletter_subscribers` (nur bei Opt-in)

```sql
CREATE TABLE newsletter_subscribers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  email       TEXT UNIQUE NOT NULL,
  vorname     TEXT,
  nachname    TEXT,
  lead_id     UUID REFERENCES leads(id),
  active      BOOLEAN DEFAULT TRUE
);
```

---

## PDF-Generierung (`@react-pdf/renderer`)

Das PDF wird serverseitig in `/api/send-pdf` generiert.

### PDF-Inhalt

**Seite 1 — Deckblatt**
- Akrona Logo (Text-basiert, Dark Green)
- Titel: "Ihre persönliche Finanzierungsauswertung"
- Name des Nutzers
- Datum der Berechnung
- Rechner-Typ (Baufinanzierung / Privatkredit)

**Seite 2 — Ihre Angaben**
- Tabelle aller Eingabewerte

**Seite 3 — Ergebnis**
- Bonitäts-Badge (Sehr gut / Mittel / Basis)
- Zinssatz-Basis
- Kernkennzahlen (Max. Kredit, Monatsrate, Kaufkraft/Gesamtkosten)
- Tilgungsplan (vereinfacht, 5 Stützpunkte: Jahr 1, 5, 10, 15, Ende)

**Seite 4 — Nächste Schritte**
- "Ihr persönlicher Berater bei Akrona:"
- Name: Alperen Akbal
- Text: "Diese Auswertung ist eine unverbindliche Ersteinschätzung. Für ein persönliches Beratungsgespräch stehen wir Ihnen gerne zur Verfügung."
- Kontakt: info@akrona-gmbh.de
- Disclaimer (rechtlich)

---

## E-Mail-Versand (Resend)

### Setup
- Absender: `noreply@akrona-gmbh.de` (oder eigene Domain)
- Antwort-Adresse: `info@akrona-gmbh.de`

### E-Mail an Nutzer

**Betreff:** `Ihre Finanzierungsauswertung von Akrona GmbH`

**HTML-Template (inline gestaltet, Dark Green / Gold):**
```
Guten Tag [Vorname],

vielen Dank für Ihre Anfrage. Anbei finden Sie Ihre persönliche 
Finanzierungsauswertung als PDF.

[Bonitäts-Badge]
Ihre Bonität: [Label] | Zinssatz-Basis: [X,X%]

Max. [Kreditart]: [Betrag]
Monatliche Rate: ca. [Betrag]

Für ein persönliches Beratungsgespräch stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
Alperen Akbal
Akrona GmbH
```

PDF als Anhang.

### Interne Benachrichtigung an Akrona

**An:** info@akrona-gmbh.de  
**Betreff:** `🔔 Neuer Lead: [Vorname Nachname] – [Rechner-Typ]`

```
Neuer Lead eingegangen:

Name:    [Vorname Nachname]
E-Mail:  [Email]
Typ:     [Baufinanzierung / Privatkredit]
Bonität: [Label]
Max. Kredit: [Betrag]
Newsletter: [Ja / Nein]

Zeitpunkt: [Timestamp]
```

---

## API Routen

### POST `/api/calculate`
Nimmt Formular-Eingaben entgegen, führt Berechnung durch, gibt Ergebnis zurück.

```typescript
// Request Body
{
  typ: 'baufinanzierung' | 'privatkredit',
  eingaben: { ... }
}

// Response
{
  success: boolean,
  teilergebnis: {
    maxKredit: number,
    monatsRate: number,
    kaufkraft?: number,       // nur Bau
    gesamtkosten?: number,    // nur Privat
    bonitaetScore: number,
    bonitaetLabel: string,
    zinssatz: number
  }
}
```

### POST `/api/send-pdf`
Speichert Lead in Supabase, generiert PDF, sendet E-Mails.

```typescript
// Request Body
{
  vorname: string,
  nachname: string,
  email: string,
  typ: 'baufinanzierung' | 'privatkredit',
  eingaben: { ... },
  ergebnis: { ... },
  consents: {
    datenschutz: boolean,  // muss true sein
    kontakt: boolean,      // muss true sein
    newsletter: boolean
  }
}

// Response
{
  success: boolean,
  leadId: string,
  message: string
}
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# Akrona
AKRONA_EMAIL=info@akrona-gmbh.de
AKRONA_FROM_EMAIL=noreply@akrona-gmbh.de
```

---

## Deployment (Vercel)

```bash
# Projekt initialisieren
npx create-next-app@latest akrona-rechner --typescript --tailwind --app

# Dependencies installieren
npm install @supabase/supabase-js resend @react-pdf/renderer

# Vercel deployen
npx vercel --prod
```

Custom Domain in Vercel hinterlegen: z.B. `rechner.akrona-gmbh.de`

---

## Impressum & Datenschutz (statische Seiten)

### `/impressum` — Pflichtangaben
```
Akrona GmbH
Alperen Akbal (Geschäftsführer)
[Adresse Stuttgart/Plochingen]
E-Mail: info@akrona-gmbh.de

Erlaubnis nach § 34c GewO (Immobilienmakler)
Erlaubnis nach § 34i GewO (Immobiliendarlehensvermittler)
Zuständige Behörde: IHK Region Stuttgart
```

### `/datenschutz` — DSGVO-konforme Erklärung
Muss folgende Punkte abdecken:
- Verantwortlicher (Akrona GmbH)
- Welche Daten erhoben werden (Name, E-Mail, Finanzdaten aus Rechner)
- Zweck der Verarbeitung (Anfragenbearbeitung, ggf. Newsletter)
- Rechtsgrundlage (Art. 6 Abs. 1 lit. b und lit. a DSGVO)
- Speicherdauer (Leads: 3 Jahre, Newsletter bis Widerruf)
- Eingesetzte Dienste: Supabase (EU-Server), Resend, Vercel
- Rechte der Nutzer: Auskunft, Löschung, Widerruf
- Kontakt Datenschutz: datenschutz@akrona-gmbh.de
- Beschwerderecht: Landesbeauftragter für Datenschutz Baden-Württemberg

---

## Wichtige Hinweise für Claude Code

1. **Berechnungslogik** muss exakt der Spezifikation in dieser README entsprechen — keine Abweichungen
2. **DSGVO-Checkboxen** sind nicht optional — beide Pflicht-Checkboxen müssen checked sein, bevor Submit möglich ist
3. **PDF** muss als echter Anhang in der E-Mail ankommen, nicht als Link
4. **IP-Adresse** des Nutzers bei Einwilligung in DB speichern (für DSGVO-Nachweis)
5. **Keine localStorage** für sensible Daten
6. **Fehlerbehandlung** bei API-Aufrufen immer mit nutzerfreundlichen deutschen Fehlermeldungen
7. **Mobile-first** — der Rechner muss auf Smartphone perfekt bedienbar sein
8. **Disclaimer** auf der Seite und im PDF: "Unverbindliche Ersteinschätzung — keine Bankzusage"
