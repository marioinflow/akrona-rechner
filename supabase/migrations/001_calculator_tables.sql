-- ============================================================
-- Akrona Finanzierungsrechner — Vollständiges DB-Schema
-- Ausführen in: Supabase > SQL Editor
-- ============================================================

-- ── 1. Bestehende Tabellen anpassen ──────────────────────────

-- leads: Telefon + calculation_session_id ergänzen (falls noch nicht vorhanden)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS telefon text,
  ADD COLUMN IF NOT EXISTS calculation_session_id uuid;

-- ── 2. Neue Tabellen ──────────────────────────────────────────

-- Versionsverwaltung für Rechner-Konfiguration
CREATE TABLE IF NOT EXISTS calculator_config_versions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  active      boolean NOT NULL DEFAULT false,
  version     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Sicherstellen dass nur eine aktive Version existiert
CREATE UNIQUE INDEX IF NOT EXISTS calculator_config_versions_active_idx
  ON calculator_config_versions (active)
  WHERE active = true;

-- Haushaltsabzüge
CREATE TABLE IF NOT EXISTS household_cost_offsets (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_version_id uuid REFERENCES calculator_config_versions(id) ON DELETE CASCADE,
  household_size    int NOT NULL CHECK (household_size BETWEEN 1 AND 5),
  amount            numeric(10,2) NOT NULL,
  UNIQUE (config_version_id, household_size)
);

-- Beschäftigungs-Faktoren
CREATE TABLE IF NOT EXISTS employment_factors (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_version_id uuid REFERENCES calculator_config_versions(id) ON DELETE CASCADE,
  key               text NOT NULL,   -- angestellt | beamter | selbststaendig | rente
  factor            numeric(5,4) NOT NULL,
  UNIQUE (config_version_id, key)
);

-- Grunderwerbsteuersätze nach Bundesland
CREATE TABLE IF NOT EXISTS state_tax_rates (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_version_id uuid REFERENCES calculator_config_versions(id) ON DELETE CASCADE,
  state_name        text NOT NULL,
  tax_rate          numeric(6,4) NOT NULL,
  UNIQUE (config_version_id, state_name)
);

-- Bonitätsbewertungs-Bänder (Bau + Privat)
CREATE TABLE IF NOT EXISTS rating_bands (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_version_id uuid REFERENCES calculator_config_versions(id) ON DELETE CASCADE,
  product_type      text NOT NULL CHECK (product_type IN ('bau', 'privat')),
  label             text NOT NULL,   -- Sehr gut | Mittel | Basis
  min_score         int NOT NULL,
  interest_rate     numeric(6,4) NOT NULL,
  UNIQUE (config_version_id, product_type, label)
);

-- Gebührenoptionen (Makler etc.)
CREATE TABLE IF NOT EXISTS fee_options (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_version_id uuid REFERENCES calculator_config_versions(id) ON DELETE CASCADE,
  type              text NOT NULL,   -- broker
  label             text NOT NULL,
  numeric_value     numeric(8,4) NOT NULL
);

-- Berechnungs-Sessions (jede Anfrage wird gespeichert)
CREATE TABLE IF NOT EXISTS calculation_sessions (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_type          text NOT NULL CHECK (product_type IN ('baufinanzierung', 'privatkredit')),
  request_payload_json  jsonb NOT NULL,
  response_payload_json jsonb NOT NULL,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- PDF-Reports
CREATE TABLE IF NOT EXISTS pdf_reports (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_session_id uuid REFERENCES calculation_sessions(id),
  lead_id               uuid REFERENCES leads(id),
  file_path_or_url      text,
  email_status          text NOT NULL DEFAULT 'pending'
                          CHECK (email_status IN ('pending', 'sent', 'failed')),
  email_sent_at         timestamptz,
  provider_message_id   text,
  created_at            timestamptz DEFAULT now()
);

-- E-Mail-Protokoll
CREATE TABLE IF NOT EXISTS email_logs (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pdf_report_id   uuid REFERENCES pdf_reports(id),
  recipient_email text NOT NULL,
  subject         text NOT NULL,
  status          text NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  error_message   text,
  created_at      timestamptz DEFAULT now()
);

-- ── 3. Standard-Konfiguration einspielen ──────────────────────

-- Aktive Version anlegen
INSERT INTO calculator_config_versions (active, version)
VALUES (true, '1.0.0')
ON CONFLICT DO NOTHING;

-- Die ID der gerade angelegten Version
DO $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id FROM calculator_config_versions WHERE active = true LIMIT 1;

  -- Haushaltsabzüge
  INSERT INTO household_cost_offsets (config_version_id, household_size, amount) VALUES
    (v_id, 1, 0),
    (v_id, 2, 350),
    (v_id, 3, 600),
    (v_id, 4, 850),
    (v_id, 5, 1100)
  ON CONFLICT (config_version_id, household_size) DO NOTHING;

  -- Beschäftigungs-Faktoren
  INSERT INTO employment_factors (config_version_id, key, factor) VALUES
    (v_id, 'angestellt',    1.00),
    (v_id, 'beamter',       1.10),
    (v_id, 'selbststaendig',0.85),
    (v_id, 'rente',         0.90)
  ON CONFLICT (config_version_id, key) DO NOTHING;

  -- Grunderwerbsteuersätze
  INSERT INTO state_tax_rates (config_version_id, state_name, tax_rate) VALUES
    (v_id, 'Baden-Württemberg',        0.050),
    (v_id, 'Bayern',                   0.035),
    (v_id, 'Berlin',                   0.060),
    (v_id, 'Brandenburg',              0.065),
    (v_id, 'Bremen',                   0.050),
    (v_id, 'Hamburg',                  0.045),
    (v_id, 'Hessen',                   0.060),
    (v_id, 'Mecklenburg-Vorpommern',   0.060),
    (v_id, 'Niedersachsen',            0.050),
    (v_id, 'Nordrhein-Westfalen',      0.065),
    (v_id, 'Rheinland-Pfalz',          0.050),
    (v_id, 'Saarland',                 0.065),
    (v_id, 'Sachsen',                  0.035),
    (v_id, 'Sachsen-Anhalt',           0.050),
    (v_id, 'Schleswig-Holstein',       0.065),
    (v_id, 'Thüringen',                0.065)
  ON CONFLICT (config_version_id, state_name) DO NOTHING;

  -- Baufinanzierung Zinsbänder
  INSERT INTO rating_bands (config_version_id, product_type, label, min_score, interest_rate) VALUES
    (v_id, 'bau', 'Sehr gut', 6, 0.036),
    (v_id, 'bau', 'Mittel',   3, 0.041),
    (v_id, 'bau', 'Basis',    0, 0.048)
  ON CONFLICT (config_version_id, product_type, label) DO NOTHING;

  -- Privatkredit Zinsbänder
  INSERT INTO rating_bands (config_version_id, product_type, label, min_score, interest_rate) VALUES
    (v_id, 'privat', 'Sehr gut', 6, 0.059),
    (v_id, 'privat', 'Mittel',   3, 0.069),
    (v_id, 'privat', 'Basis',    0, 0.089)
  ON CONFLICT (config_version_id, product_type, label) DO NOTHING;

  -- Maklergebühren
  INSERT INTO fee_options (config_version_id, type, label, numeric_value) VALUES
    (v_id, 'broker', 'Keine Maklergebühr', 0.00),
    (v_id, 'broker', '1,19 %',             1.19),
    (v_id, 'broker', '2,38 %',             2.38),
    (v_id, 'broker', '3,57 %',             3.57)
  ON CONFLICT DO NOTHING;
END $$;

-- ── 4. Kommentare ──────────────────────────────────────────────

COMMENT ON TABLE calculator_config_versions IS 'Versionsverwaltung für Rechner-Konfigurationsparameter';
COMMENT ON TABLE household_cost_offsets IS 'Haushaltsabzüge vom Nettoeinkommen je Haushaltsgröße';
COMMENT ON TABLE employment_factors IS 'Multiplikatoren je Beschäftigungsstatus (angestellt, beamter, ...)';
COMMENT ON TABLE state_tax_rates IS 'Grunderwerbsteuersätze nach Bundesland';
COMMENT ON TABLE rating_bands IS 'Bonitätsbewertungsbänder mit Zinssatz für Bau- und Privatkredit';
COMMENT ON TABLE fee_options IS 'Konfigurierbare Gebührenoptionen (Makler etc.)';
COMMENT ON TABLE calculation_sessions IS 'Jede Rechneranfrage wird als Session gespeichert';
COMMENT ON TABLE pdf_reports IS 'Erzeugte PDF-Reports mit E-Mail-Versandstatus';
COMMENT ON TABLE email_logs IS 'Protokoll aller E-Mail-Versandversuche';
