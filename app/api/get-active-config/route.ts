import { NextResponse } from 'next/server';
import { RECHNER_CONFIG } from '@/lib/rechner-config';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/get-active-config
 *
 * Gibt die aktive Rechner-Konfiguration zurück.
 * Versucht zunächst, die aktive Version aus der Datenbank zu laden.
 * Fällt auf die eingebetteten Standardwerte zurück wenn die DB-Tabellen
 * noch nicht existieren oder kein aktiver Datensatz vorhanden ist.
 */
export async function GET() {
  try {
    const supabase = createServerClient();

    // Versuche DB-Konfiguration zu laden (schlägt still fehl wenn Tabellen fehlen)
    const { data: versionRow } = await supabase
      .from('calculator_config_versions')
      .select('id, version')
      .eq('active', true)
      .single();

    if (versionRow) {
      // Lade Konfigurationsdaten aus DB-Tabellen
      const [
        { data: haushaltsAbzuege },
        { data: beschaeftigungsFaktoren },
        { data: grunderwerbsteuerSaetze },
        { data: ratingBaender },
      ] = await Promise.all([
        supabase.from('household_cost_offsets').select('household_size, amount').eq('config_version_id', versionRow.id),
        supabase.from('employment_factors').select('key, factor').eq('config_version_id', versionRow.id),
        supabase.from('state_tax_rates').select('state_name, tax_rate').eq('config_version_id', versionRow.id),
        supabase.from('rating_bands').select('product_type, label, min_score, interest_rate').eq('config_version_id', versionRow.id),
      ]);

      if (haushaltsAbzuege && beschaeftigungsFaktoren && grunderwerbsteuerSaetze && ratingBaender) {
        return NextResponse.json({
          success: true,
          source: 'database',
          version: versionRow.version,
          config: {
            haushaltsAbzuege: Object.fromEntries(haushaltsAbzuege.map((r) => [r.household_size, r.amount])),
            beschaeftigungsFaktoren: Object.fromEntries(beschaeftigungsFaktoren.map((r) => [r.key, r.factor])),
            grunderwerbsteuerSaetze: Object.fromEntries(grunderwerbsteuerSaetze.map((r) => [r.state_name, r.tax_rate])),
            bauBewertungsBaender: ratingBaender
              .filter((r) => r.product_type === 'bau')
              .sort((a, b) => b.min_score - a.min_score)
              .map((r) => ({ label: r.label, minScore: r.min_score, zinssatz: r.interest_rate })),
            privatBewertungsBaender: ratingBaender
              .filter((r) => r.product_type === 'privat')
              .sort((a, b) => b.min_score - a.min_score)
              .map((r) => ({ label: r.label, minScore: r.min_score, zinssatz: r.interest_rate })),
            notarGrundbuchSatz: RECHNER_CONFIG.notarGrundbuchSatz,
            bewertungsSchranken: RECHNER_CONFIG.bewertungsSchranken,
            maklerGebuehren: RECHNER_CONFIG.maklerGebuehren,
          },
        });
      }
    }
  } catch {
    // DB nicht erreichbar oder Tabellen existieren noch nicht — Fallback auf eingebettete Konfiguration
  }

  return NextResponse.json({
    success: true,
    source: 'embedded',
    version: '1.0.0',
    config: RECHNER_CONFIG,
  });
}
