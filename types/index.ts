export type BeschaeftigungsStatus = 'angestellt' | 'beamter' | 'selbststaendig' | 'rente';
export type Verwendungszweck = 'kauf' | 'neubau' | 'anschlussfinanzierung';
export type BonitaetLabel = 'Sehr gut' | 'Mittel' | 'Basis';
export type RechnerTyp = 'baufinanzierung' | 'privatkredit' | 'immobilienbewertung';

// ── Immobilienbewertung ──
export type ObjektArt = 'wohnung' | 'einfamilienhaus' | 'mehrfamilienhaus' | 'grundstueck';
export type ObjektZustand = 'neuwertig' | 'gepflegt' | 'renovierungsbeduerftig';
export type ObjektAusstattung = 'einfach' | 'standard' | 'gehoben';
export type BewertungAnlass = 'verkauf' | 'kauf' | 'anschlussfinanzierung' | 'interesse';
export type VerkaufsZeitraum = 'schnellstmoeglich' | 'sechs_monate' | 'zwei_jahre' | 'spaeter';
export type EigentuemerStatus = 'ja' | 'teileigentuemer' | 'angehoeriger' | 'nein';
export type BewertungExtra = 'balkon' | 'garten' | 'garage' | 'keller' | 'aufzug';
export type KonfidenzNote = 'Hoch' | 'Mittel' | 'Niedrig';

export interface BewertungEingaben {
  objektart: ObjektArt;
  plz: string;
  ort?: string;
  bundesland: string;
  /** Wohnfläche in m² — entfällt bei Grundstück */
  wohnflaeche?: number;
  zimmer?: number;
  baujahr?: number;
  /** Grundstücksfläche in m² — nur bei Haus/Grundstück */
  grundstuecksflaeche?: number;
  zustand?: ObjektZustand;
  ausstattung?: ObjektAusstattung;
  modernisierungsjahr?: number;
  extras?: BewertungExtra[];
  anlass?: BewertungAnlass;
  /** Lead-Qualifizierung: geplanter Verkaufszeitraum */
  verkaufszeitraum?: VerkaufsZeitraum;
  /** Lead-Qualifizierung: Eigentümer-Status */
  eigentuemer?: EigentuemerStatus;
}

export interface BewertungErgebnis {
  /** Geschätzter Mittelwert (Vergleichswert-Näherung) */
  wertMittel: number;
  /** Untere Grenze der Spanne (−10 %) */
  wertVon: number;
  /** Obere Grenze der Spanne (+10 %) */
  wertBis: number;
  /** Verwendeter regionaler m²-Preis (nach Zone-Zuschlag) */
  qmPreis: number;
  /** Bodenwert-Anteil (nur Haus/Grundstück) */
  bodenwert: number;
  /** Summe der Extras-Zuschläge */
  extrasZuschlag: number;
  konfidenz: KonfidenzNote;
}

export interface BewertungLeadData {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  lang?: 'de' | 'ro';
  eingaben: BewertungEingaben;
  consents: {
    datenschutz: boolean;
  };
  /** Honeypot — muss leer sein, sonst Bot */
  website?: string;
}

export interface BaufinanzierungEingaben {
  nettoeinkommen: number;
  /** Einkommen 2. Kreditnehmer (nur bei Gemeinschaftsantrag) */
  nettoeinkommen2?: number;
  eigenkapital: number;
  haushaltsgroesse: 1 | 2 | 3 | 4 | 5;
  laufzeit: 10 | 15 | 20 | 25 | 30 | 35;
  status: BeschaeftigungsStatus;
  verwendungszweck: Verwendungszweck;
  kaufpreis?: number;
  bundesland?: string;
  maklergebuehr?: 0 | 1.19 | 2.38 | 3.57;
  wohnsitzland?: string;
  staatsangehoerigkeit?: string;
  tilgungssatz?: number;
  finanzierungsanteil?: 110 | 100 | 80 | 60;
  /** Manuelle Bonitäts-Überschreibung (überschreibt den berechneten Score) */
  bonitaetOverride?: BonitaetLabel;
  /** Antragsteller-Konstellation: 'allein' = einzelner Kreditnehmer, 'gemeinschaft' = zwei Kreditnehmer */
  kreditnehmer?: 'allein' | 'gemeinschaft';
}

export interface PrivatkreditEingaben {
  nettoeinkommen: number;
  /** Einkommen 2. Kreditnehmer (nur bei Gemeinschaftsantrag) */
  nettoeinkommen2?: number;
  wunschkredit?: number;
  haushaltsgroesse: 1 | 2 | 3 | 4 | 5;
  laufzeit: 12 | 24 | 36 | 48 | 60 | 84 | 96 | 120;
  status: BeschaeftigungsStatus;
  /** Manuelle Bonitäts-Überschreibung (überschreibt den berechneten Score) */
  bonitaetOverride?: BonitaetLabel;
}

export interface BaufinanzierungErgebnis {
  /** Maximal tragbarer Kreditrahmen auf Basis Einkommensformel */
  maxKredit: number;
  /**
   * Tatsächlicher Finanzierungsbedarf = max(0, gesamtkaufkosten - eigenkapital).
   * Wenn kein Kaufpreis angegeben: finanzierungsbedarf = maxKredit.
   */
  finanzierungsbedarf: number;
  /** Monatliche Rate auf Basis finanzierungsbedarf (korrekte fachliche Größe) */
  monatsRate: number;
  /** Kaufkraft = maxKredit + eigenkapital */
  kaufkraft: number;
  bonitaetScore: number;
  bonitaetLabel: BonitaetLabel;
  zinssatz: number;
  grunderwerbsteuer?: number;
  notar?: number;
  maklergebuehr?: number;
  nebenkosten?: number;
  gesamtkaufkosten?: number;
  tilgungsplan?: TilgungsPunkt[];
}

export interface PrivatkreditErgebnis {
  maxKredit: number;
  aktuellerKredit: number;
  monatsRate: number;
  gesamtkosten: number;
  bonitaetScore: number;
  bonitaetLabel: BonitaetLabel;
  zinssatz: number;
}

export interface TilgungsPunkt {
  jahr: number;
  restschuld: number;
  gezahlteZinsen: number;
  gezahltesTilgung: number;
  /** Zinsen in diesem Jahr (für Charts) */
  jahresZinsen: number;
  /** Tilgung in diesem Jahr (für Charts) */
  jahresTilgung: number;
}

export interface LeadFormData {
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  typ: RechnerTyp;
  lang?: 'de' | 'ro';
  eingaben: BaufinanzierungEingaben | PrivatkreditEingaben;
  ergebnis: BaufinanzierungErgebnis | PrivatkreditErgebnis;
  consents: {
    datenschutz: boolean;
    kontakt: boolean;
    newsletter: boolean;
  };
  /** ID der calculation_session (serverseitig erzeugt und zurückgegeben) */
  calculationSessionId?: string;
}
