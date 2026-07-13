# Akrona E-Mail-Templates

4 HTML-E-Mail-Vorlagen im Akrona-Design. Eigenständige Dateien, kein Build nötig — HTML kopieren, Platzhalter ersetzen, versenden (z. B. via Resend, oder als HTML-Mail im Mail-Client).

## Vorschau

`index.html` im Browser öffnen → alle 4 Templates nebeneinander.

## Templates

| Datei | Zweck |
|---|---|
| `newsletter.html` | Zins-Update / Broadcast an Newsletter-Abonnenten |
| `lead-followup.html` | Nachfass-Mail nach Versand der Finanzierungsanalyse |
| `termin-bestaetigung.html` | Bestätigung Beratungstermin + Dokumenten-Checkliste |
| `expose-versand.html` | Exposé-Anschreiben mit Objekt-Karte, PDF im Anhang |

## Platzhalter

Format `{{NAME}}` — vor Versand ersetzen:

### Alle Templates
| Platzhalter | Beispiel |
|---|---|
| `{{VORNAME}}` | Max |

### newsletter.html
| Platzhalter | Beispiel |
|---|---|
| `{{PREHEADER}}` | Bauzinsen im Juni: Das ändert sich |
| `{{MONAT_JAHR}}` | Juni 2026 |
| `{{HEADLINE}}` | Bauzinsen stabil — Ihr Zeitfenster für die Anschlussfinanzierung |
| `{{INTRO_TEXT}}` | 2–3 Sätze Einleitung |
| `{{ZINS_10J}}` / `{{ZINS_15J}}` / `{{ZINS_20J}}` | 3,4 / 3,6 / 3,8 |
| `{{ZINS_STAND_DATUM}}` | 05.06.2026 |
| `{{BLOCK1_TITEL}}` / `{{BLOCK1_TEXT}}` | Tipp-Überschrift + Absatz |
| `{{BLOCK2_TITEL}}` / `{{BLOCK2_TEXT}}` | Zweiter Tipp / KfW-Hinweis |
| `{{ABMELDE_LINK}}` | Abmelde-URL (Pflicht bei Newsletter!) |

### lead-followup.html
| Platzhalter | Beispiel |
|---|---|
| `{{TERMIN_LINK}}` | Calendly-/Buchungs-URL |
| `{{TELEFON}}` | +4971112345678 (für `tel:`-Link, ohne Leerzeichen) |
| `{{TELEFON_ANZEIGE}}` | 0711 / 123 456 78 |

### termin-bestaetigung.html
| Platzhalter | Beispiel |
|---|---|
| `{{TERMIN_DATUM}}` | Montag, 15. Juni 2026 |
| `{{TERMIN_UHRZEIT}}` | 14:00 |
| `{{TERMIN_ART}}` | Video-Beratung *oder* Persönlich vor Ort |
| `{{TERMIN_ORT}}` | Meet-Link *oder* Adresse |
| `{{TELEFON}}` / `{{TELEFON_ANZEIGE}}` | wie oben |

### expose-versand.html
| Platzhalter | Beispiel |
|---|---|
| `{{OBJEKT_TITEL}}` | Mehrfamilienhaus „Im Städtle 8 & 10" |
| `{{OBJEKT_ORT}}` | 89073 Ulm |
| `{{OBJEKT_BILD_URL}}` | Öffentlich erreichbare Bild-URL (≥ 1040 px breit, wegen Retina) |
| `{{KAUFPREIS}}` | 1.250.000 € |
| `{{WOHNFLAECHE}}` | 420 |
| `{{ZIMMER}}` | 14 |
| `{{BAUJAHR}}` | 1998 |
| `{{PDF_DATEINAME}}` | Expose_Im_Staedtle.pdf |
| `{{CTA_LINK}}` | Rechner- oder Kontakt-URL |

## Design-Regeln (beim Anpassen einhalten)

- **Nur Tabellen-Layout + Inline-Styles.** Kein Flexbox/Grid, kein externes CSS, kein `<style>`-Block — Outlook & Co. ignorieren das.
- **Farben:** Dark Green `#0A3D2C` · Light Green `#0A5D3F` · Gold `#D4AF37` · Creme `#F7F5F0` · Border `#E8E2D9` · Muted `#6b6b6b`
- **Font:** Arial/Helvetica-Stack — Webfonts (Manrope) sind in Mail-Clients unzuverlässig.
- **Breite:** 600 px Karte, Bilder mit festem `width`-Attribut + `style="display:block"`.
- **Buttons:** gepolsterte Tabellenzelle mit Hintergrundfarbe (bulletproof). Haupt-CTA Gold auf Dark Green-Text, Standard-CTA Dark Green auf Weiß.
- **Logo:** `https://rechner.akrona.de/akrona-logo-transparent.png` (muss öffentlich erreichbar bleiben).
- **Umlaute** als HTML-Entities (`&auml;` etc.) — robust gegen Encoding-Probleme beim Kopieren.

## Versand-Checkliste

1. Platzhalter ersetzt? (Suche nach `{{` muss leer sein)
2. Test-Mail an eigene Adresse — Gmail, Apple Mail, Outlook prüfen
3. Newsletter: Abmelde-Link funktioniert? (rechtlich Pflicht)
4. Absender: `Akrona GmbH <noreply@akrona.de>`, Reply-To `info@akrona.de`
