import type {
  BaufinanzierungEingaben,
  BaufinanzierungErgebnis,
  BonitaetLabel,
  PrivatkreditEingaben,
  PrivatkreditErgebnis,
  TilgungsPunkt,
} from '@/types';

// ──────────────────────────────────────────────
// Hilfsfunktionen
// ──────────────────────────────────────────────

const HAUSHALTSABZUG: Record<number, number> = {
  1: 0,
  2: 350,
  3: 600,
  4: 850,
  5: 1100,
};

const STATUS_MULTIPLIKATOR: Record<string, number> = {
  angestellt: 1.0,
  beamter: 1.1,
  selbststaendig: 0.85,
  rente: 0.9,
};

function getBonitaetLabel(score: number): BonitaetLabel {
  if (score >= 6) return 'Sehr gut';
  if (score >= 3) return 'Mittel';
  return 'Basis';
}

function getZinssatz(score: number, typ: 'bau' | 'privat'): number {
  if (typ === 'bau') {
    if (score >= 6) return 0.036;
    if (score >= 3) return 0.041;
    return 0.048;
  } else {
    if (score >= 6) return 0.059;
    if (score >= 3) return 0.069;
    return 0.089;
  }
}

// ──────────────────────────────────────────────
// Grunderwerbsteuer nach Bundesland
// ──────────────────────────────────────────────

export const GRUNDERWERBSTEUER: Record<string, number> = {
  'Baden-Württemberg': 0.05,
  'Bayern': 0.035,
  'Berlin': 0.06,
  'Brandenburg': 0.065,
  'Bremen': 0.05,
  'Hamburg': 0.045,
  'Hessen': 0.06,
  'Mecklenburg-Vorpommern': 0.06,
  'Niedersachsen': 0.05,
  'Nordrhein-Westfalen': 0.065,
  'Rheinland-Pfalz': 0.05,
  'Saarland': 0.065,
  'Sachsen': 0.035,
  'Sachsen-Anhalt': 0.05,
  'Schleswig-Holstein': 0.065,
  'Thüringen': 0.065,
};

// ──────────────────────────────────────────────
// Tilgungsplan generieren
// ──────────────────────────────────────────────

export function berechneTilgungsplan(
  kredit: number,
  zinssatz: number,
  laufzeitJahre: number,
  tilgungssatz = 0.02
): TilgungsPunkt[] {
  const jahresrate = kredit * (zinssatz + tilgungssatz);
  const plan: TilgungsPunkt[] = [];
  let restschuld = kredit;
  let gesamtZinsen = 0;
  let gesamtTilgung = 0;

  const stützpunkte = [1, 5, 10, 15, laufzeitJahre].filter(
    (j) => j <= laufzeitJahre
  );
  const uniqueStützpunkte = [...new Set(stützpunkte)];

  for (let jahr = 1; jahr <= laufzeitJahre; jahr++) {
    const zinsen = restschuld * zinssatz;
    const tilgung = jahresrate - zinsen;
    restschuld = Math.max(0, restschuld - tilgung);
    gesamtZinsen += zinsen;
    gesamtTilgung += tilgung;

    if (uniqueStützpunkte.includes(jahr)) {
      plan.push({
        jahr,
        restschuld: Math.round(restschuld),
        gezahlteZinsen: Math.round(gesamtZinsen),
        gezahltesTilgung: Math.round(gesamtTilgung),
      });
    }
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
  } = eingaben;

  const tilgungssatz = tilgungssatzEingabe ?? 0.02;
  const haushaltsAbzug = HAUSHALTSABZUG[Math.min(haushaltsgroesse, 5)] ?? 1100;
  const multiplikator = STATUS_MULTIPLIKATOR[status] ?? 1.0;

  const verfuegbaresEinkommen = (nettoeinkommen - haushaltsAbzug) * multiplikator;
  const maxKredit = Math.round((verfuegbaresEinkommen * 100) / 1000) * 1000;

  // ── Bonitäts-Score (Algorithmus unverändert) ──
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

  const tatsaecklicherKredit = (kaufpreis && kaufpreis > eigenkapital)
    ? Math.min(kaufpreis - eigenkapital, maxKredit)
    : maxKredit;
  const provisorischeRate = tatsaecklicherKredit * (0.036 + 0.02) / 12;
  const belastung = nettoeinkommen > 0 ? provisorischeRate / nettoeinkommen : 1;
  if (belastung < 0.25) score += 2;
  else if (belastung <= 0.38) score += 1;

  const kaufkraftPrelim = maxKredit + eigenkapital;
  if (kaufpreis && kaufpreis > 0 && kaufpreis < kaufkraftPrelim * 0.70) score += 1;

  const bonitaetLabel = getBonitaetLabel(score);
  const zinssatz = getZinssatz(score, 'bau');

  // Monatsrate mit user-gewähltem Tilgungssatz
  const monatsRate = maxKredit * (zinssatz + tilgungssatz) / 12;
  const kaufkraft = maxKredit + eigenkapital;

  // Nebenkosten
  let grunderwerbsteuerBetrag: number | undefined;
  let maklergebuehrBetrag: number | undefined;
  let nebenkosten: number | undefined;
  let gesamtkaufkosten: number | undefined;

  if (kaufpreis && kaufpreis > 0) {
    const gst = bundesland ? GRUNDERWERBSTEUER[bundesland] ?? 0.05 : 0.05;
    grunderwerbsteuerBetrag = Math.round(kaufpreis * gst);
    maklergebuehrBetrag = Math.round(kaufpreis * (maklergebuehr / 100));
    const notar = Math.round(kaufpreis * 0.02);
    nebenkosten = grunderwerbsteuerBetrag + maklergebuehrBetrag + notar;
    gesamtkaufkosten = kaufpreis + nebenkosten;
  }

  const tilgungsplan = berechneTilgungsplan(maxKredit, zinssatz, laufzeit, tilgungssatz);

  return {
    maxKredit,
    monatsRate: Math.round(monatsRate),
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
  const { nettoeinkommen, wunschkredit, haushaltsgroesse, laufzeit, status } = eingaben;

  const haushaltsAbzug = HAUSHALTSABZUG[Math.min(haushaltsgroesse, 5)] ?? 1100;
  const multiplikator = STATUS_MULTIPLIKATOR[status] ?? 1.0;

  const verfuegbaresEinkommen = (nettoeinkommen - haushaltsAbzug) * multiplikator;

  let score = 0;

  if (status === 'beamter') score += 3;
  else if (status === 'angestellt') score += 2;
  else if (status === 'rente') score += 1;

  if (haushaltsgroesse <= 2) score += 2;
  else if (haushaltsgroesse === 3) score += 1;

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

  const bonitaetLabel = getBonitaetLabel(score);
  const zinssatz = getZinssatz(score, 'privat');

  const monatszins = zinssatz / 12;

  const maxKredit = Math.round(
    maxMonatsRate * (1 - Math.pow(1 + monatszins, -laufzeit)) / monatszins
  );

  const aktuellerKredit = wunschkredit
    ? Math.min(wunschkredit, maxKredit)
    : maxKredit;

  const monatsRate =
    aktuellerKredit * monatszins /
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
