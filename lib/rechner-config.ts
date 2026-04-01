/**
 * Zentrale Rechner-Konfiguration — einzige Quelle der Wahrheit für alle Kalkulationsparameter.
 * Zukünftig durch calculator_config_versions aus der Datenbank überschreibbar.
 * Wird sowohl serverseitig (API-Routen) als auch clientseitig (Live-Berechnung) genutzt.
 */

export const RECHNER_CONFIG = {
  // Haushaltsabzüge vom Nettoeinkommen je Haushaltsgröße
  haushaltsAbzuege: {
    1: 0,
    2: 350,
    3: 600,
    4: 850,
    5: 1100,
  } as Record<number, number>,

  // Multiplikatoren je Beschäftigungsstatus
  beschaeftigungsFaktoren: {
    angestellt: 1.00,
    beamter: 1.10,
    selbststaendig: 0.85,
    rente: 0.90,
  } as Record<string, number>,

  // Grunderwerbsteuersätze nach Bundesland
  grunderwerbsteuerSaetze: {
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
  } as Record<string, number>,

  // Notar & Grundbuch Pauschale
  notarGrundbuchSatz: 0.02,

  // Maklergebühren-Optionen (Prozent)
  maklerGebuehren: [0, 1.19, 2.38, 3.57] as const,

  // Bonitätsbewertungs-Schwellen
  bewertungsSchranken: {
    sehrGut: 6,
    mittel: 3,
  },

  // Baufinanzierung: Zinsbänder nach Score
  bauBewertungsBaender: [
    { label: 'Sehr gut', minScore: 6, zinssatz: 0.036 },
    { label: 'Mittel',   minScore: 3, zinssatz: 0.041 },
    { label: 'Basis',    minScore: 0, zinssatz: 0.048 },
  ] as const,

  // Privatkredit: Zinsbänder nach Score
  privatBewertungsBaender: [
    { label: 'Sehr gut', minScore: 6, zinssatz: 0.059 },
    { label: 'Mittel',   minScore: 3, zinssatz: 0.069 },
    { label: 'Basis',    minScore: 0, zinssatz: 0.089 },
  ] as const,
} as const;

export type RechnerConfig = typeof RECHNER_CONFIG;
