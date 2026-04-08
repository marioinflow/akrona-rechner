import type {
  BaufinanzierungEingaben,
  BaufinanzierungErgebnis,
  BonitaetLabel,
  PrivatkreditEingaben,
  PrivatkreditErgebnis,
  TilgungsPunkt,
} from '@/types';
import { RECHNER_CONFIG } from '@/lib/rechner-config';

// ──────────────────────────────────────────────
// Re-Export für Backward-Kompatibilität (BaufinanzierungRechner.tsx importiert GRUNDERWERBSTEUER)
// ──────────────────────────────────────────────

export const GRUNDERWERBSTEUER = RECHNER_CONFIG.grunderwerbsteuerSaetze;

// ──────────────────────────────────────────────
// Hilfsfunktionen
// ──────────────────────────────────────────────

function getBonitaetLabel(score: number): BonitaetLabel {
  if (score >= RECHNER_CONFIG.bewertungsSchranken.sehrGut) return 'Sehr gut';
  if (score >= RECHNER_CONFIG.bewertungsSchranken.mittel) return 'Mittel';
  return 'Basis';
}

function getZinssatzByLabel(label: BonitaetLabel, typ: 'bau' | 'privat'): number {
  const baender = typ === 'bau'
    ? RECHNER_CONFIG.bauBewertungsBaender
    : RECHNER_CONFIG.privatBewertungsBaender;
  const band = baender.find((b) => b.label === label);
  return band?.zinssatz ?? (typ === 'bau' ? 0.048 : 0.089);
}

// ──────────────────────────────────────────────
// Tilgungsplan generieren
// ──────────────────────────────────────────────

export function berechneTilgungsplan(
  darlehensbetrag: number,
  zinssatz: number,
  laufzeitJahre: number,
  tilgungssatz = 0.02
): TilgungsPunkt[] {
  if (darlehensbetrag <= 0) return [];

  const jahresrate = darlehensbetrag * (zinssatz + tilgungssatz);
  const plan: TilgungsPunkt[] = [];
  let restschuld = darlehensbetrag;
  let gesamtZinsen = 0;
  let gesamtTilgung = 0;

  for (let jahr = 1; jahr <= laufzeitJahre; jahr++) {
    const zinsen = restschuld * zinssatz;
    const tilgung = Math.min(jahresrate - zinsen, restschuld);
    restschuld = Math.max(0, restschuld - tilgung);
    gesamtZinsen += zinsen;
    gesamtTilgung += tilgung;

    plan.push({
      jahr,
      restschuld: Math.round(restschuld),
      gezahlteZinsen: Math.round(gesamtZinsen),
      gezahltesTilgung: Math.round(gesamtTilgung),
      jahresZinsen: Math.round(zinsen),
      jahresTilgung: Math.round(tilgung),
    });
  }

  return plan;
}

// ──────────────────────────────────────────────
// Baufinanzierung
// ──────────────────────────────────────────────

export function berechneBaufinanzierung(
  eingaben: BaufinanzierungEingaben
): BaufinanzierungErgebnis {
  const {
    nettoeinkommen,
    eigenkapital,
    haushaltsgroesse,
    laufzeit,
    status,
    kaufpreis,
    bundesland,
    maklergebuehr = 0,
    tilgungssatz: tilgungssatzEingabe,
    bonitaetOverride,
  } = eingaben;

  const tilgungssatz = tilgungssatzEingabe ?? 0.02;
  const haushaltsAbzug = RECHNER_CONFIG.haushaltsAbzuege[Math.min(haushaltsgroesse, 5)] ?? 1100;
  const multiplikator = RECHNER_CONFIG.beschaeftigungsFaktoren[status] ?? 1.0;

  // ── Kreditrahmen ──
  const verfuegbaresEinkommen = (nettoeinkommen - haushaltsAbzug) * multiplikator;
  const maxKredit = Math.max(0, Math.round((verfuegbaresEinkommen * 100) / 1000) * 1000);

  // ── Nebenkosten & Gesamtkaufkosten ──
  let grunderwerbsteuerBetrag: number | undefined;
  let maklergebuehrBetrag: number | undefined;
  let nebenkosten: number | undefined;
  let gesamtkaufkosten: number | undefined;

  if (kaufpreis && kaufpreis > 0) {
    const gst = bundesland ? (RECHNER_CONFIG.grunderwerbsteuerSaetze[bundesland] ?? 0.05) : 0.05;
    grunderwerbsteuerBetrag = Math.round(kaufpreis * gst);
    maklergebuehrBetrag = Math.round(kaufpreis * (maklergebuehr / 100));
    const notar = Math.round(kaufpreis * RECHNER_CONFIG.notarGrundbuchSatz);
    nebenkosten = grunderwerbsteuerBetrag + maklergebuehrBetrag + notar;
    gesamtkaufkosten = kaufpreis + nebenkosten;
  }

  // ── Finanzierungsbedarf (fachlich korrekte Trennung) ──
  // Wenn Kaufpreis bekannt: max(0, Gesamtkaufkosten - Eigenkapital)
  // Ohne Kaufpreis: maximaler Kreditrahmen (für Rate-Anzeige)
  const finanzierungsbedarf = gesamtkaufkosten !== undefined
    ? Math.max(0, gesamtkaufkosten - eigenkapital)
    : maxKredit;

  // ── Bonitäts-Score ──
  let score = 0;

  if (status === 'beamter') score += 3;
  else if (status === 'angestellt') score += 2;
  else if (status === 'rente') score += 1;

  const referenzwert = (kaufpreis && kaufpreis > 0) ? kaufpreis : maxKredit;
  const ekQuote = referenzwert > 0 ? eigenkapital / referenzwert : 0;
  if (ekQuote >= 0.2) score += 2;
  else if (ekQuote >= 0.1) score += 1;

  if (haushaltsgroesse <= 2) score += 2;
  else if (haushaltsgroesse === 3) score += 1;

  // Belastungstest mit stabilem Referenzzinssatz (0.036 + 0.02) für reproduzierbaren Score
  const kreditFuerBelastungstest = (kaufpreis && kaufpreis > eigenkapital)
    ? Math.min(kaufpreis - eigenkapital, maxKredit)
    : maxKredit;
  const provisorischeRate = kreditFuerBelastungstest * (0.036 + 0.02) / 12;
  const belastung = nettoeinkommen > 0 ? provisorischeRate / nettoeinkommen : 1;
  if (belastung < 0.25) score += 2;
  else if (belastung <= 0.38) score += 1;

  const kaufkraftPrelim = maxKredit + eigenkapital;
  if (kaufpreis && kaufpreis > 0 && kaufpreis < kaufkraftPrelim * 0.70) score += 1;

  // ── Bonität & Zinssatz ──
  const berechneteBonitaet = getBonitaetLabel(score);
  const bonitaetLabel: BonitaetLabel = bonitaetOverride ?? berechneteBonitaet;
  const zinssatz = getZinssatzByLabel(bonitaetLabel, 'bau');

  // ── Monatliche Rate auf Basis FINANZIERUNGSBEDARF ──
  const monatsRate = Math.round(finanzierungsbedarf * (zinssatz + tilgungssatz) / 12);
  const kaufkraft = maxKredit + eigenkapital;

  // ── Tilgungsplan auf Basis FINANZIERUNGSBEDARF ──
  const tilgungsplan = berechneTilgungsplan(finanzierungsbedarf, zinssatz, laufzeit, tilgungssatz);

  return {
    maxKredit,
    finanzierungsbedarf,
    monatsRate,
    kaufkraft,
    bonitaetScore: score,
    bonitaetLabel,
    zinssatz,
    grunderwerbsteuer: grunderwerbsteuerBetrag,
    maklergebuehr: maklergebuehrBetrag,
    nebenkosten,
    gesamtkaufkosten,
    tilgungsplan,
  };
}

// ──────────────────────────────────────────────
// Privatkredit
// ──────────────────────────────────────────────

export function berechnePrivatkredit(
  eingaben: PrivatkreditEingaben
): PrivatkreditErgebnis {
  const { nettoeinkommen, wunschkredit, haushaltsgroesse, laufzeit, status, bonitaetOverride } = eingaben;

  const haushaltsAbzug = RECHNER_CONFIG.haushaltsAbzuege[Math.min(haushaltsgroesse, 5)] ?? 1100;
  const multiplikator = RECHNER_CONFIG.beschaeftigungsFaktoren[status] ?? 1.0;

  const verfuegbaresEinkommen = (nettoeinkommen - haushaltsAbzug) * multiplikator;

  // ── Score ──
  let score = 0;

  if (status === 'beamter') score += 3;
  else if (status === 'angestellt') score += 2;
  else if (status === 'rente') score += 1;

  if (haushaltsgroesse <= 2) score += 2;
  else if (haushaltsgroesse === 3) score += 1;

  // Belastungstest mit Referenzzinssatz 6.9%
  const refMonatszins = 0.069 / 12;
  const maxMonatsRate = verfuegbaresEinkommen * 0.33;
  const refMaxKredit = maxMonatsRate * (1 - Math.pow(1 + refMonatszins, -laufzeit)) / refMonatszins;

  const beurteilungsKredit = (wunschkredit && wunschkredit > 0)
    ? Math.min(wunschkredit, refMaxKredit)
    : refMaxKredit;

  const beurteilungsRate = beurteilungsKredit * refMonatszins /
    (1 - Math.pow(1 + refMonatszins, -laufzeit));

  const belastung = nettoeinkommen > 0 ? beurteilungsRate / nettoeinkommen : 1;
  if (belastung < 0.20) score += 2;
  else if (belastung <= 0.33) score += 1;

  if (wunschkredit && wunschkredit > 0 && wunschkredit < refMaxKredit * 0.5) score += 1;

  // ── Bonität & Zinssatz ──
  const berechneteBonitaet = getBonitaetLabel(score);
  const bonitaetLabel: BonitaetLabel = bonitaetOverride ?? berechneteBonitaet;
  const zinssatz = getZinssatzByLabel(bonitaetLabel, 'privat');

  const monatszins = zinssatz / 12;
  const maxKredit = Math.round(
    maxMonatsRate * (1 - Math.pow(1 + monatszins, -laufzeit)) / monatszins
  );

  const aktuellerKredit = wunschkredit
    ? Math.min(wunschkredit, maxKredit)
    : maxKredit;

  const monatsRate = aktuellerKredit * monatszins /
    (1 - Math.pow(1 + monatszins, -laufzeit));

  const gesamtkosten = Math.round(monatsRate * laufzeit);

  return {
    maxKredit,
    aktuellerKredit: Math.round(aktuellerKredit),
    monatsRate: Math.round(monatsRate),
    gesamtkosten,
    bonitaetScore: score,
    bonitaetLabel,
    zinssatz,
  };
}

// ──────────────────────────────────────────────
// Formatierung
// ──────────────────────────────────────────────

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatProzent(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
