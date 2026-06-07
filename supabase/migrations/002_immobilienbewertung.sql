-- Migration 002: Immobilienbewertung als dritten Rechner-Typ zulassen
-- Muss im Supabase SQL-Editor (Produktion) ausgeführt werden, bevor der
-- Bewertungs-Tab live geht — sonst schlägt der calculation_sessions-Insert
-- fehl (wird in der API zwar abgefangen, Session-Tracking fehlt dann aber).

-- calculation_sessions: CHECK-Constraint um 'immobilienbewertung' erweitern
ALTER TABLE calculation_sessions
  DROP CONSTRAINT IF EXISTS calculation_sessions_product_type_check;

ALTER TABLE calculation_sessions
  ADD CONSTRAINT calculation_sessions_product_type_check
  CHECK (product_type IN ('baufinanzierung', 'privatkredit', 'immobilienbewertung'));

-- leads: Tabelle wurde manuell angelegt (nicht in Migration 001).
-- Falls dort ein CHECK auf rechner_typ existiert, analog erweitern:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'leads' AND column_name = 'rechner_typ'
  ) THEN
    EXECUTE 'ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_rechner_typ_check';
    EXECUTE 'ALTER TABLE leads ADD CONSTRAINT leads_rechner_typ_check
             CHECK (rechner_typ IN (''baufinanzierung'', ''privatkredit'', ''immobilienbewertung''))';
  END IF;
END $$;

-- bonitaet_score / bonitaet_label sind bei Bewertungs-Leads nicht gesetzt.
-- Falls die Spalten NOT NULL sind, nullable machen:
ALTER TABLE leads ALTER COLUMN bonitaet_score DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN bonitaet_label DROP NOT NULL;
