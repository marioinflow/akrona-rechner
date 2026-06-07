/**
 * Immobilienbewertung — Konstanten-Tabellen für die Vergleichswert-Näherung.
 *
 * WICHTIG: Alle Werte sind bewusst grobe Marktnäherungen (Stand: Mitte 2026,
 * Quelle: öffentlich verfügbare Durchschnittswerte je Bundesland). Sie dienen
 * ausschließlich der unverbindlichen Ersteinschätzung mit ±10 %-Spanne.
 *
 * TODO: Bei Anschluss an eine echte Datenquelle (z. B. AVM-API, Sprengnetter,
 * PriceHubble, BORIS-Bodenrichtwerte) diese Tabellen durch Live-Daten ersetzen.
 * Die Berechnungslogik in lib/bewertung.ts bleibt dabei unverändert —
 * nur die Lookup-Funktionen unten austauschen.
 */

import type { ObjektArt, ObjektZustand, ObjektAusstattung, BewertungExtra } from '@/types';

// ── Durchschnittlicher Wohnflächen-m²-Preis je Bundesland (€/m²) ──
// Basis: Bestandsimmobilien, mittlere Lage, mittlerer Zustand.
export const QM_PREISE_BUNDESLAND: Record<string, number> = {
  'Baden-Württemberg':      3600,
  'Bayern':                 4100,
  'Berlin':                 4900,
  'Brandenburg':            2700,
  'Bremen':                 2800,
  'Hamburg':                5200,
  'Hessen':                 3300,
  'Mecklenburg-Vorpommern': 2500,
  'Niedersachsen':          2600,
  'Nordrhein-Westfalen':    2900,
  'Rheinland-Pfalz':        2700,
  'Saarland':               2000,
  'Sachsen':                2300,
  'Sachsen-Anhalt':         1800,
  'Schleswig-Holstein':     3100,
  'Thüringen':              2000,
};

// ── PLZ-Zonen-Zuschläge (Multiplikator auf den Bundesland-Basispreis) ──
// Schlüssel = PLZ-Präfix (2-stellig). Längster Treffer gewinnt.
// Deckt Metropol-Lagen ab, in denen der Landesdurchschnitt deutlich zu
// niedrig wäre. Unbekannte PLZ → Faktor 1.00 (Landesdurchschnitt).
// TODO: Durch echtes PLZ→m²-Preis-Mapping ersetzen (z. B. BORIS / AVM).
export const PLZ_ZONEN_FAKTOREN: Record<string, number> = {
  // München
  '80': 1.55, '81': 1.50, '85': 1.15,
  // Berlin Innenstadt
  '10': 1.20, '12': 1.05, '13': 1.00, '14': 1.10,
  // Hamburg
  '20': 1.15, '22': 1.10,
  // Frankfurt am Main
  '60': 1.45, '61': 1.10,
  // Stuttgart
  '70': 1.25, '71': 1.05,
  // Köln / Bonn
  '50': 1.25, '51': 1.05, '53': 1.10,
  // Düsseldorf
  '40': 1.25,
  // Leipzig / Dresden
  '04': 1.15, '01': 1.15,
  // Nürnberg
  '90': 1.10,
  // Hannover
  '30': 1.10,
  // Freiburg / Heidelberg
  '79': 1.20, '69': 1.20,
};

// ── Bodenrichtwert-Näherung je Bundesland (€/m² Grundstücksfläche) ──
// Mittlere Wohnlage. Fließt bei Häusern zusätzlich ein, bei Grundstücken
// ist er die alleinige Berechnungsgrundlage.
// TODO: Durch echte BORIS-Bodenrichtwerte (PLZ-genau) ersetzen.
export const BODENRICHTWERTE_BUNDESLAND: Record<string, number> = {
  'Baden-Württemberg':      450,
  'Bayern':                 550,
  'Berlin':                 900,
  'Brandenburg':            180,
  'Bremen':                 220,
  'Hamburg':                850,
  'Hessen':                 380,
  'Mecklenburg-Vorpommern': 120,
  'Niedersachsen':          180,
  'Nordrhein-Westfalen':    320,
  'Rheinland-Pfalz':        220,
  'Saarland':               130,
  'Sachsen':                140,
  'Sachsen-Anhalt':         90,
  'Schleswig-Holstein':     240,
  'Thüringen':              100,
};

// ── Zustandsfaktor ──
export const ZUSTANDS_FAKTOREN: Record<ObjektZustand, number> = {
  neuwertig:             1.10,
  gepflegt:              1.00,
  renovierungsbeduerftig: 0.85,
};

// ── Ausstattungsfaktor ──
export const AUSSTATTUNGS_FAKTOREN: Record<ObjektAusstattung, number> = {
  einfach:  0.92,
  standard: 1.00,
  gehoben:  1.12,
};

// ── Objektart-Faktor auf den Wohnflächen-m²-Preis ──
// MFH werden pro m² typischerweise unter EFH/ETW gehandelt (Ertragsobjekt).
export const OBJEKTART_FAKTOREN: Record<Exclude<ObjektArt, 'grundstueck'>, number> = {
  wohnung:          1.00,
  einfamilienhaus:  1.00,
  mehrfamilienhaus: 0.85,
};

// ── Altersfaktor (lineare Alterswertminderung) ──
// 0,6 % Wertminderung pro Jahr wirtschaftlichen Alters, gedeckelt bei 30 %.
// Eine Modernisierung senkt das wirtschaftliche Alter (Gewichtung 40/60).
export const ALTERSWERTMINDERUNG_PRO_JAHR = 0.006;
export const ALTERSWERTMINDERUNG_MAX = 0.30;

// ── Extras-Zuschläge (feste Beträge in €) ──
export const EXTRAS_ZUSCHLAEGE: Record<BewertungExtra, number> = {
  balkon: 8000,   // Balkon / Terrasse
  garten: 12000,
  garage: 15000,  // Garage / Stellplatz
  keller: 10000,
  aufzug: 7000,
};

// ── Lookup-Helfer ──

/** Regionaler m²-Preis: Bundesland-Basis × PLZ-Zonen-Faktor. */
export function getQmPreis(bundesland: string, plz: string): { preis: number; zoneBekannt: boolean } {
  const basis = QM_PREISE_BUNDESLAND[bundesland] ?? 2800; // Fallback: Bundesdurchschnitt
  const prefix = plz.slice(0, 2);
  const faktor = PLZ_ZONEN_FAKTOREN[prefix];
  return {
    preis: Math.round(basis * (faktor ?? 1.0)),
    zoneBekannt: faktor !== undefined,
  };
}

/** Bodenrichtwert-Näherung: Bundesland-Basis × PLZ-Zonen-Faktor. */
export function getBodenrichtwert(bundesland: string, plz: string): number {
  const basis = BODENRICHTWERTE_BUNDESLAND[bundesland] ?? 250;
  const faktor = PLZ_ZONEN_FAKTOREN[plz.slice(0, 2)] ?? 1.0;
  return Math.round(basis * faktor);
}
