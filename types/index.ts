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
}

export interface PrivatkreditEingaben {
  nettoeinkommen: number;
  wunschkredit?: number;
  haushaltsgroesse: 1 | 2 | 3 | 4 | 5;
  laufzeit: 12 | 24 | 36 | 48 | 60 | 84;
  status: BeschaeftigungsStatus;
}

export interface BaufinanzierungErgebnis {
  maxKredit: number;
  monatsRate: number;
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
}

export interface LeadFormData {
  vorname: string;
  nachname: string;
  email: string;
  typ: RechnerTyp;
  eingaben: BaufinanzierungEingaben | PrivatkreditEingaben;
  ergebnis: BaufinanzierungErgebnis | PrivatkreditErgebnis;
  consents: {
    datenschutz: boolean;
    kontakt: boolean;
    newsletter: boolean;
  };
}
