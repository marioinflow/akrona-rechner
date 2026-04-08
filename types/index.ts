export type BeschaeftigungsStatus = 'angestellt' | 'beamter' | 'selbststaendig' | 'rente';
export type Verwendungszweck = 'kauf' | 'neubau' | 'anschlussfinanzierung';
export type BonitaetLabel = 'Sehr gut' | 'Mittel' | 'Basis';
export type RechnerTyp = 'baufinanzierung' | 'privatkredit';

export interface BaufinanzierungEingaben {
  nettoeinkommen: number;
  eigenkapital: number;
  haushaltsgroesse: 1 | 2 | 3 | 4 | 5;
  laufzeit: 10 | 15 | 20 | 25 | 30;
  status: BeschaeftigungsStatus;
  verwendungszweck: Verwendungszweck;
  kaufpreis?: number;
  bundesland?: string;
  maklergebuehr?: 0 | 1.19 | 2.38 | 3.57;
  wohnsitzland?: string;
  staatsangehoerigkeit?: string;
  tilgungssatz?: number;
  finanzierungsanteil?: 100 | 80 | 60;
  /** Manuelle Bonitäts-Überschreibung (überschreibt den berechneten Score) */
  bonitaetOverride?: BonitaetLabel;
}

export interface PrivatkreditEingaben {
  nettoeinkommen: number;
  wunschkredit?: number;
  haushaltsgroesse: 1 | 2 | 3 | 4 | 5;
  laufzeit: 12 | 24 | 36 | 48 | 60 | 84;
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
