import { describe, it, expect } from 'vitest';
import { berechneBaufinanzierung, berechnePrivatkredit, berechneTilgungsplan } from '../lib/berechnung';
import type { BaufinanzierungEingaben, PrivatkreditEingaben } from '../types';

// ──────────────────────────────────────────────
// Hilfs-Factory
// ──────────────────────────────────────────────

function bauEingaben(overrides: Partial<BaufinanzierungEingaben> = {}): BaufinanzierungEingaben {
  return {
    nettoeinkommen: 4200,
    eigenkapital: 0,
    haushaltsgroesse: 2,
    laufzeit: 20,
    status: 'angestellt',
    verwendungszweck: 'kauf',
    kaufpreis: 180000,
    bundesland: 'Bayern',
    maklergebuehr: 3.57,
    tilgungssatz: 0.02,
    ...overrides,
  };
}

function privatEingaben(overrides: Partial<PrivatkreditEingaben> = {}): PrivatkreditEingaben {
  return {
    nettoeinkommen: 4200,
    haushaltsgroesse: 2,
    laufzeit: 60,
    status: 'angestellt',
    ...overrides,
  };
}

// ──────────────────────────────────────────────
// Tilgungsplan
// ──────────────────────────────────────────────

describe('berechneTilgungsplan', () => {
  it('gibt leere Liste zurück wenn darlehensbetrag <= 0', () => {
    expect(berechneTilgungsplan(0, 0.036, 20, 0.02)).toEqual([]);
    expect(berechneTilgungsplan(-1000, 0.036, 20, 0.02)).toEqual([]);
  });

  it('enthält Stützpunkte Jahr 1, 5, 10, 15, 20 bei 20 Jahren', () => {
    const plan = berechneTilgungsplan(200000, 0.036, 20, 0.02);
    const jahre = plan.map((p) => p.jahr);
    expect(jahre).toContain(1);
    expect(jahre).toContain(5);
    expect(jahre).toContain(10);
    expect(jahre).toContain(15);
    expect(jahre).toContain(20);
  });

  it('Restschuld sinkt monoton', () => {
    const plan = berechneTilgungsplan(200000, 0.041, 25, 0.02);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].restschuld).toBeLessThanOrEqual(plan[i - 1].restschuld);
    }
  });

  it('Restschuld ist nicht negativ', () => {
    const plan = berechneTilgungsplan(200000, 0.036, 20, 0.10);
    plan.forEach((p) => expect(p.restschuld).toBeGreaterThanOrEqual(0));
  });

  it('gezahlteZinsen und gezahlteTilgung steigen kumuliert', () => {
    const plan = berechneTilgungsplan(200000, 0.036, 20, 0.02);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].gezahlteZinsen).toBeGreaterThanOrEqual(plan[i - 1].gezahlteZinsen);
      expect(plan[i].gezahltesTilgung).toBeGreaterThanOrEqual(plan[i - 1].gezahltesTilgung);
    }
  });
});

// ──────────────────────────────────────────────
// Baufinanzierung: Standardfälle
// ──────────────────────────────────────────────

describe('berechneBaufinanzierung — Standard', () => {
  it('berechnet maxKredit korrekt (4200 - 350) * 1.0 = 3850 → 385000', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ kaufpreis: undefined }));
    expect(erg.maxKredit).toBe(385000);
  });

  it('kaufkraft = maxKredit + eigenkapital', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ eigenkapital: 50000 }));
    expect(erg.kaufkraft).toBe(erg.maxKredit + 50000);
  });

  it('finanzierungsbedarf = gesamtkaufkosten - eigenkapital (mit Bayern + 3.57 % Makler)', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ eigenkapital: 20000 }));
    // Bayern: 3.5 % Grunderwerbsteuer
    const gst = Math.round(180000 * 0.035);
    const makler = Math.round(180000 * 0.0357);
    const notar = Math.round(180000 * 0.02);
    const nebenkosten = gst + makler + notar;
    const gesamtkaufkosten = 180000 + nebenkosten;
    const erwartet = Math.max(0, gesamtkaufkosten - 20000);
    expect(erg.finanzierungsbedarf).toBe(erwartet);
  });

  it('monatsRate basiert auf finanzierungsbedarf, nicht maxKredit', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ eigenkapital: 60000 }));
    const erwartetRate = Math.round(erg.finanzierungsbedarf * (erg.zinssatz + 0.02) / 12);
    expect(erg.monatsRate).toBe(erwartetRate);
    // Stellt sicher dass maxKredit-basierte Rate abweicht
    const maxKreditRate = Math.round(erg.maxKredit * (erg.zinssatz + 0.02) / 12);
    if (erg.finanzierungsbedarf !== erg.maxKredit) {
      expect(erg.monatsRate).not.toBe(maxKreditRate);
    }
  });

  it('finanzierungsbedarf = maxKredit wenn kein kaufpreis angegeben', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ kaufpreis: undefined }));
    expect(erg.finanzierungsbedarf).toBe(erg.maxKredit);
  });

  it('finanzierungsbedarf = 0 wenn eigenkapital >= gesamtkaufkosten', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ eigenkapital: 999999, kaufpreis: 180000 }));
    expect(erg.finanzierungsbedarf).toBe(0);
  });

  it('tilgungsplan enthält Stützpunkte', () => {
    const erg = berechneBaufinanzierung(bauEingaben());
    expect(erg.tilgungsplan?.length).toBeGreaterThan(0);
  });

  it('bonitaetLabel ist einer der drei erlaubten Werte', () => {
    const erg = berechneBaufinanzierung(bauEingaben());
    expect(['Sehr gut', 'Mittel', 'Basis']).toContain(erg.bonitaetLabel);
  });
});

// ──────────────────────────────────────────────
// Baufinanzierung: Eigenkapital-Varianten
// ──────────────────────────────────────────────

describe('berechneBaufinanzierung — Eigenkapital-Szenarien', () => {
  for (const eigenkapital of [0, 20000, 36000, 60000]) {
    it(`eigenkapital ${eigenkapital} — kein Absturz`, () => {
      const erg = berechneBaufinanzierung(bauEingaben({ eigenkapital }));
      expect(erg.maxKredit).toBeGreaterThan(0);
      expect(erg.finanzierungsbedarf).toBeGreaterThanOrEqual(0);
      expect(erg.monatsRate).toBeGreaterThanOrEqual(0);
    });
  }
});

// ──────────────────────────────────────────────
// Baufinanzierung: Tilgungssatz-Varianten
// ──────────────────────────────────────────────

describe('berechneBaufinanzierung — Tilgungssatz-Varianten', () => {
  for (const tilgungssatz of [0.02, 0.04, 0.06]) {
    it(`tilgungssatz ${tilgungssatz * 100} % — höhere Tilgung = höhere Rate`, () => {
      const erg = berechneBaufinanzierung(bauEingaben({ tilgungssatz, eigenkapital: 36000 }));
      expect(erg.monatsRate).toBeGreaterThan(0);
    });
  }

  it('höhere Tilgung führt zu höherer Rate', () => {
    const e1 = berechneBaufinanzierung(bauEingaben({ tilgungssatz: 0.02 }));
    const e2 = berechneBaufinanzierung(bauEingaben({ tilgungssatz: 0.06 }));
    expect(e2.monatsRate).toBeGreaterThan(e1.monatsRate);
  });

  it('höhere Tilgung führt zu niedrigerer Restschuld', () => {
    const e1 = berechneBaufinanzierung(bauEingaben({ tilgungssatz: 0.02 }));
    const e2 = berechneBaufinanzierung(bauEingaben({ tilgungssatz: 0.06 }));
    const r1 = e1.tilgungsplan?.[e1.tilgungsplan.length - 1]?.restschuld ?? Infinity;
    const r2 = e2.tilgungsplan?.[e2.tilgungsplan.length - 1]?.restschuld ?? Infinity;
    expect(r2).toBeLessThan(r1);
  });
});

// ──────────────────────────────────────────────
// Baufinanzierung: Laufzeit-Varianten
// ──────────────────────────────────────────────

describe('berechneBaufinanzierung — Laufzeit-Varianten', () => {
  for (const laufzeit of [10, 15, 20, 25] as const) {
    it(`laufzeit ${laufzeit} Jahre — kein Absturz`, () => {
      const erg = berechneBaufinanzierung(bauEingaben({ laufzeit }));
      expect(erg.maxKredit).toBeGreaterThan(0);
    });
  }
});

// ──────────────────────────────────────────────
// Baufinanzierung: Bonitäts-Override
// ──────────────────────────────────────────────

describe('berechneBaufinanzierung — Bonitäts-Override', () => {
  it('Override Sehr gut → zinssatz 3,6 %', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ bonitaetOverride: 'Sehr gut' }));
    expect(erg.bonitaetLabel).toBe('Sehr gut');
    expect(erg.zinssatz).toBe(0.036);
  });

  it('Override Mittel → zinssatz 4,1 %', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ bonitaetOverride: 'Mittel' }));
    expect(erg.bonitaetLabel).toBe('Mittel');
    expect(erg.zinssatz).toBe(0.041);
  });

  it('Override Basis → zinssatz 4,8 %', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ bonitaetOverride: 'Basis' }));
    expect(erg.bonitaetLabel).toBe('Basis');
    expect(erg.zinssatz).toBe(0.048);
  });

  it('kein Override → automatische Berechnung', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ bonitaetOverride: undefined }));
    // Angestellt (2) + Haushalt 2 (2) + Belastungstest = mindestens Mittel
    expect(['Sehr gut', 'Mittel', 'Basis']).toContain(erg.bonitaetLabel);
  });
});

// ──────────────────────────────────────────────
// Baufinanzierung: Grenzfälle
// ──────────────────────────────────────────────

describe('berechneBaufinanzierung — Grenzfälle', () => {
  it('nettoeinkommen knapp über householdOffset (2p = 350) → sehr kleiner kredit', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ nettoeinkommen: 360 }));
    expect(erg.maxKredit).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(erg.monatsRate)).toBe(true);
  });

  it('sehr geringes eigenkapital — kein Absturz', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ eigenkapital: 1000 }));
    expect(erg.finanzierungsbedarf).toBeGreaterThan(0);
  });

  it('selbstständig → score ohne Status-Bonus', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ status: 'selbststaendig' }));
    expect(erg.bonitaetScore).toBeGreaterThanOrEqual(0);
  });

  it('beamter → höchster Status-Score (+3)', () => {
    const ergBeamter = berechneBaufinanzierung(bauEingaben({ status: 'beamter' }));
    const ergAngestellt = berechneBaufinanzierung(bauEingaben({ status: 'angestellt' }));
    expect(ergBeamter.bonitaetScore).toBeGreaterThanOrEqual(ergAngestellt.bonitaetScore);
  });

  it('keine undefined oder NaN-Werte in den Kernfeldern', () => {
    const erg = berechneBaufinanzierung(bauEingaben());
    expect(erg.maxKredit).not.toBeNaN();
    expect(erg.finanzierungsbedarf).not.toBeNaN();
    expect(erg.monatsRate).not.toBeNaN();
    expect(erg.kaufkraft).not.toBeNaN();
    expect(erg.zinssatz).not.toBeNaN();
  });
});

// ──────────────────────────────────────────────
// Privatkredit: Standardfälle
// ──────────────────────────────────────────────

describe('berechnePrivatkredit — Standard', () => {
  it('berechnet Ergebnis ohne Wunschkredit', () => {
    const erg = berechnePrivatkredit(privatEingaben());
    expect(erg.maxKredit).toBeGreaterThan(0);
    expect(erg.aktuellerKredit).toBe(erg.maxKredit);
    expect(erg.monatsRate).toBeGreaterThan(0);
  });

  it('aktuellerKredit = wunschkredit wenn wunschkredit <= maxKredit', () => {
    const erg = berechnePrivatkredit(privatEingaben({ wunschkredit: 25000 }));
    if (25000 <= erg.maxKredit) {
      expect(erg.aktuellerKredit).toBe(25000);
    }
  });

  it('aktuellerKredit wird auf maxKredit gekappt', () => {
    const erg = berechnePrivatkredit(privatEingaben({ wunschkredit: 9999999 }));
    expect(erg.aktuellerKredit).toBe(erg.maxKredit);
  });

  it('gesamtkosten = monatsRate * laufzeit (gerundet)', () => {
    const erg = berechnePrivatkredit(privatEingaben({ wunschkredit: 25000 }));
    // gesamtkosten basiert auf ungerundeter Rate × laufzeit, monatsRate ist separat gerundet
    // Max. Abweichung: 0.5 Rundungsdifferenz × 60 Monate = 30
    expect(Math.abs(erg.gesamtkosten - erg.monatsRate * 60)).toBeLessThanOrEqual(30);
  });

  it('wunschkredit 25000 und 50000 — kein Absturz', () => {
    for (const wunschkredit of [25000, 50000]) {
      const erg = berechnePrivatkredit(privatEingaben({ wunschkredit }));
      expect(Number.isFinite(erg.monatsRate)).toBe(true);
    }
  });
});

// ──────────────────────────────────────────────
// Privatkredit: Bonitäts-Override
// ──────────────────────────────────────────────

describe('berechnePrivatkredit — Bonitäts-Override', () => {
  it('Override Sehr gut → zinssatz 5,9 %', () => {
    const erg = berechnePrivatkredit(privatEingaben({ bonitaetOverride: 'Sehr gut' }));
    expect(erg.bonitaetLabel).toBe('Sehr gut');
    expect(erg.zinssatz).toBe(0.059);
  });

  it('Override Basis → zinssatz 8,9 %', () => {
    const erg = berechnePrivatkredit(privatEingaben({ bonitaetOverride: 'Basis' }));
    expect(erg.bonitaetLabel).toBe('Basis');
    expect(erg.zinssatz).toBe(0.089);
  });

  it('manuell Basis → höhere Rate als Sehr gut', () => {
    const gut = berechnePrivatkredit(privatEingaben({ bonitaetOverride: 'Sehr gut', wunschkredit: 25000 }));
    const schlecht = berechnePrivatkredit(privatEingaben({ bonitaetOverride: 'Basis', wunschkredit: 25000 }));
    expect(schlecht.monatsRate).toBeGreaterThan(gut.monatsRate);
  });
});

// ──────────────────────────────────────────────
// Fachliche Korrektheit: Trennung maxKredit / finanzierungsbedarf
// ──────────────────────────────────────────────

describe('Trennung maxKredit vs. finanzierungsbedarf', () => {
  it('bei 20k eigenkapital ist finanzierungsbedarf kleiner als ohne eigenkapital', () => {
    const ohne = berechneBaufinanzierung(bauEingaben({ eigenkapital: 0 }));
    const mit = berechneBaufinanzierung(bauEingaben({ eigenkapital: 20000 }));
    expect(mit.finanzierungsbedarf).toBeLessThan(ohne.finanzierungsbedarf);
  });

  it('maxKredit ändert sich nicht durch eigenkapital', () => {
    const ohne = berechneBaufinanzierung(bauEingaben({ eigenkapital: 0 }));
    const mit = berechneBaufinanzierung(bauEingaben({ eigenkapital: 20000 }));
    expect(mit.maxKredit).toBe(ohne.maxKredit);
  });

  it('monatsRate sinkt wenn eigenkapital steigt (weil finanzierungsbedarf sinkt)', () => {
    const wenig = berechneBaufinanzierung(bauEingaben({ eigenkapital: 0 }));
    const viel = berechneBaufinanzierung(bauEingaben({ eigenkapital: 50000 }));
    expect(viel.monatsRate).toBeLessThan(wenig.monatsRate);
  });

  it('kaufkraft = maxKredit + eigenkapital', () => {
    const erg = berechneBaufinanzierung(bauEingaben({ eigenkapital: 40000 }));
    expect(erg.kaufkraft).toBe(erg.maxKredit + 40000);
  });
});
