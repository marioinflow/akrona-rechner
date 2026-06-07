/**
 * Immobilienbewertung — Vergleichswert-Näherung (transparente Heuristik).
 *
 * Basiswert  = Wohnfläche × regionaler m²-Preis (Bundesland + PLZ-Zone)
 *            × Zustandsfaktor × Ausstattungsfaktor × Altersfaktor
 *            + Extras-Zuschläge
 *            + bei Häusern: Grundstücksfläche × Bodenrichtwert-Näherung
 * Grundstück = Grundstücksfläche × Bodenrichtwert-Näherung
 *
 * Ausgabe als Spanne (±10 %) mit Konfidenznote. Läuft ausschließlich
 * serverseitig — das Ergebnis verlässt den Server nur per E-Mail/PDF.
 */

import type { BewertungEingaben, BewertungErgebnis, KonfidenzNote } from '@/types';
import {
  getQmPreis,
  getBodenrichtwert,
  ZUSTANDS_FAKTOREN,
  AUSSTATTUNGS_FAKTOREN,
  OBJEKTART_FAKTOREN,
  EXTRAS_ZUSCHLAEGE,
  ALTERSWERTMINDERUNG_PRO_JAHR,
  ALTERSWERTMINDERUNG_MAX,
} from '@/lib/bewertung-config';

const SPANNE = 0.10; // ±10 %

/** Lineare Alterswertminderung; Modernisierung senkt das wirtschaftliche Alter. */
function berechneAltersfaktor(baujahr?: number, modernisierungsjahr?: number): number {
  if (!baujahr) return 1.0;
  const aktuellesJahr = new Date().getFullYear();
  let effektivesAlter = Math.max(0, aktuellesJahr - baujahr);
  if (modernisierungsjahr && modernisierungsjahr > baujahr && modernisierungsjahr <= aktuellesJahr) {
    const seitModernisierung = Math.max(0, aktuellesJahr - modernisierungsjahr);
    // Gewichtung: 40 % ursprüngliches Alter, 60 % Zeit seit Modernisierung
    effektivesAlter = Math.round(0.4 * effektivesAlter + 0.6 * seitModernisierung);
  }
  const minderung = Math.min(ALTERSWERTMINDERUNG_MAX, effektivesAlter * ALTERSWERTMINDERUNG_PRO_JAHR);
  return 1 - minderung;
}

export function berechneImmobilienbewertung(e: BewertungEingaben): BewertungErgebnis {
  const { preis: qmPreisBasis, zoneBekannt } = getQmPreis(e.bundesland, e.plz);
  const bodenrichtwert = getBodenrichtwert(e.bundesland, e.plz);

  // ── Grundstück: reiner Bodenwert ──
  if (e.objektart === 'grundstueck') {
    const flaeche = e.grundstuecksflaeche ?? 0;
    if (flaeche <= 0) throw new Error('Grundstücksfläche fehlt.');
    const bodenwert = Math.round(flaeche * bodenrichtwert);
    return {
      wertMittel: bodenwert,
      wertVon: Math.round(bodenwert * (1 - SPANNE)),
      wertBis: Math.round(bodenwert * (1 + SPANNE)),
      qmPreis: bodenrichtwert,
      bodenwert,
      extrasZuschlag: 0,
      konfidenz: 'Niedrig', // dünne Datenlage bei reinen Grundstücken
    };
  }

  // ── Wohnung / Haus: Vergleichswert auf Wohnflächenbasis ──
  const wohnflaeche = e.wohnflaeche ?? 0;
  if (wohnflaeche <= 0) throw new Error('Wohnfläche fehlt.');

  const objektFaktor = OBJEKTART_FAKTOREN[e.objektart];
  const zustandsFaktor = ZUSTANDS_FAKTOREN[e.zustand ?? 'gepflegt'];
  const ausstattungsFaktor = AUSSTATTUNGS_FAKTOREN[e.ausstattung ?? 'standard'];
  const altersfaktor = berechneAltersfaktor(e.baujahr, e.modernisierungsjahr);

  const qmPreis = Math.round(qmPreisBasis * objektFaktor);
  const gebaeudewert = wohnflaeche * qmPreis * zustandsFaktor * ausstattungsFaktor * altersfaktor;

  const extrasZuschlag = (e.extras ?? []).reduce((sum, x) => sum + (EXTRAS_ZUSCHLAEGE[x] ?? 0), 0);

  // Bei Häusern fließt der Bodenwert zusätzlich ein (anteilig 70 %,
  // da der Wohnflächen-m²-Preis bereits einen Lageanteil enthält).
  const istHaus = e.objektart === 'einfamilienhaus' || e.objektart === 'mehrfamilienhaus';
  const bodenwert = istHaus && e.grundstuecksflaeche
    ? Math.round(e.grundstuecksflaeche * bodenrichtwert * 0.7)
    : 0;

  const wertMittel = Math.round(gebaeudewert + extrasZuschlag + bodenwert);

  // ── Konfidenznote ──
  // Hoch:    Wohnung in bekannter Marktzone mit vollständigen Eckdaten
  // Mittel:  Standardfälle (Haus, oder Wohnung außerhalb bekannter Zonen)
  // Niedrig: Sonderfälle — MFH, fehlendes Baujahr, sehr alte Objekte
  let konfidenz: KonfidenzNote = 'Mittel';
  if (e.objektart === 'wohnung' && zoneBekannt && e.baujahr) konfidenz = 'Hoch';
  if (e.objektart === 'mehrfamilienhaus' || !e.baujahr) konfidenz = 'Niedrig';

  return {
    wertMittel,
    wertVon: Math.round(wertMittel * (1 - SPANNE)),
    wertBis: Math.round(wertMittel * (1 + SPANNE)),
    qmPreis,
    bodenwert,
    extrasZuschlag,
    konfidenz,
  };
}
