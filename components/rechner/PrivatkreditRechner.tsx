'use client';

import { useState, useCallback } from 'react';
import { berechnePrivatkredit, formatEuro } from '@/lib/berechnung';
import type { PrivatkreditEingaben, PrivatkreditErgebnis } from '@/types';
import BonitaetBadge from '@/components/ui/BonitaetBadge';

const DEFAULT: PrivatkreditEingaben = {
  nettoeinkommen: 0,
  wunschkredit: undefined,
  haushaltsgroesse: 1,
  laufzeit: 60,
  status: 'angestellt',
};

const IS: React.CSSProperties = {
  height: '44px',
  border: '1.5px solid #E8E2D9',
  borderRadius: '10px',
  padding: '0 14px',
  backgroundColor: '#F7F5F0',
  fontSize: '14px',
  fontWeight: 400,
  color: '#1a1a1a',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
  appearance: 'none' as React.CSSProperties['appearance'],
  WebkitAppearance: 'none' as React.CSSProperties['WebkitAppearance'],
};

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = '#0A5D3F';
  e.currentTarget.style.backgroundColor = '#fff';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10,93,63,0.1)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = '#E8E2D9';
  e.currentTarget.style.backgroundColor = '#F7F5F0';
  e.currentTarget.style.boxShadow = 'none';
}

function SectionCard({ step, title, subtitle, children }: {
  step: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ border: '1px solid #E8E2D9', borderRadius: '18px', padding: '28px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '22px' }}>
        <span style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#0A3D2C', color: '#D4AF37', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, letterSpacing: '0.04em' }}>
          {step}
        </span>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0A3D2C', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</p>
          {subtitle && <p style={{ fontSize: '12px', color: '#6b6b6b', margin: '2px 0 0', fontWeight: 400 }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
      {children}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
    </p>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <svg width="14" height="14" fill="none" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <polyline points="4 6 8 10 12 6" />
      </svg>
    </div>
  );
}

interface Props {
  onLeadTrigger: (ergebnis: PrivatkreditErgebnis, eingaben: PrivatkreditEingaben) => void;
}

export default function PrivatkreditRechner({ onLeadTrigger }: Props) {
  const [form, setForm] = useState<PrivatkreditEingaben>(DEFAULT);
  const [ergebnis, setErgebnis] = useState<PrivatkreditErgebnis | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  const [validationError, setValidationError] = useState('');

  const update = useCallback(<K extends keyof PrivatkreditEingaben>(
    key: K,
    value: PrivatkreditEingaben[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (ergebnis) setFormChanged(true);
    setValidationError('');
  }, [ergebnis]);

  const berechnen = () => {
    const gesamtEinkommen = (form.nettoeinkommen || 0) + (form.nettoeinkommen2 || 0);
    if (!form.nettoeinkommen || form.nettoeinkommen <= 0) {
      setValidationError('Bitte geben Sie das Nettoeinkommen des 1. Kreditnehmers ein.');
      return;
    }
    if (form.haushaltsgroesse === 2 && (!form.nettoeinkommen2 || form.nettoeinkommen2 <= 0)) {
      setValidationError('Bitte geben Sie das Nettoeinkommen des 2. Kreditnehmers ein.');
      return;
    }
    const haushaltsAbzug = { 1: 0, 2: 350, 3: 600, 4: 850, 5: 1100 }[form.haushaltsgroesse] ?? 1100;
    if (gesamtEinkommen <= haushaltsAbzug) {
      setValidationError(`Das Gesamteinkommen liegt unter dem Haushaltsabzug von ${formatEuro(haushaltsAbzug)}. Eine Finanzierung ist nicht möglich.`);
      return;
    }
    setErgebnis(berechnePrivatkredit(form));
    setFormChanged(false);
    setValidationError('');
  };

  const zinsenMonatlich = ergebnis
    ? Math.round(ergebnis.aktuellerKredit * ergebnis.zinssatz / 12)
    : 0;
  const zinsgesamt = ergebnis
    ? ergebnis.gesamtkosten - ergebnis.aktuellerKredit
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* ════════════════════ FORM — 8 Spalten ════════════════════ */}
      <div className="lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* 01: Persönliche Daten */}
        <SectionCard step="01" title="Persönliche Daten">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Beschäftigungsstatus</FieldLabel>
              <SelectWrapper>
                <select value={form.status} onChange={(e) => update('status', e.target.value as PrivatkreditEingaben['status'])} style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="angestellt">Angestellt</option>
                  <option value="beamter">Beamter / Beamtin</option>
                  <option value="selbststaendig">Selbstständig</option>
                  <option value="rente">Rentner / Rentnerin</option>
                </select>
              </SelectWrapper>
            </div>

            <div>
              <FieldLabel required>Kreditnehmer</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {([
                  { value: 1, label: 'Alleinantrag', sub: '1 Person' },
                  { value: 2, label: 'Gemeinschaft', sub: '2 Personen' },
                ] as const).map((opt) => {
                  const active = form.haushaltsgroesse === opt.value;
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => update('haushaltsgroesse', opt.value)}
                      style={{ height: '44px', border: `1.5px solid ${active ? '#0A5D3F' : '#E8E2D9'}`, borderRadius: '10px', backgroundColor: active ? '#0A3D2C' : '#F7F5F0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px', transition: 'border-color 0.15s, background-color 0.15s' }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: active ? '#fff' : '#1a1a1a', lineHeight: 1 }}>{opt.label}</span>
                      <span style={{ fontSize: '10px', color: active ? 'rgba(255,255,255,0.6)' : '#6b6b6b', lineHeight: 1 }}>{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {form.haushaltsgroesse === 1 ? (
              <div className="sm:col-span-2">
                <FieldLabel required>Monatliches Nettoeinkommen</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <input type="number" value={form.nettoeinkommen || ''} onChange={(e) => update('nettoeinkommen', Number(e.target.value))} placeholder="z.B. 3.000"
                    style={{ ...IS, height: '52px', paddingRight: '44px', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }} onFocus={onFocus} onBlur={onBlur} />
                  <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#6b6b6b', fontWeight: 600, pointerEvents: 'none' }}>€</span>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <FieldLabel required>Nettoeinkommen KN 1</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <input type="number" value={form.nettoeinkommen || ''} onChange={(e) => update('nettoeinkommen', Number(e.target.value))} placeholder="z.B. 2.000"
                      style={{ ...IS, height: '52px', paddingRight: '44px', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }} onFocus={onFocus} onBlur={onBlur} />
                    <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#6b6b6b', fontWeight: 600, pointerEvents: 'none' }}>€</span>
                  </div>
                </div>
                <div>
                  <FieldLabel required>Nettoeinkommen KN 2</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <input type="number" value={form.nettoeinkommen2 || ''} onChange={(e) => update('nettoeinkommen2', Number(e.target.value))} placeholder="z.B. 1.500"
                      style={{ ...IS, height: '52px', paddingRight: '44px', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }} onFocus={onFocus} onBlur={onBlur} />
                    <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#6b6b6b', fontWeight: 600, pointerEvents: 'none' }}>€</span>
                  </div>
                </div>
                <div className="sm:col-span-2" style={{ backgroundColor: '#F7F5F0', borderRadius: '8px', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b6b6b' }}>Gemeinsames Nettoeinkommen</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0A3D2C' }}>{formatEuro((form.nettoeinkommen || 0) + (form.nettoeinkommen2 || 0))}</span>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* 02: Kreditwunsch */}
        <SectionCard step="02" title="Kreditwunsch" subtitle="Optional — leer lassen für maximalen Kreditrahmen">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FieldLabel>Gewünschte Kreditsumme</FieldLabel>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={form.wunschkredit || ''}
                  onChange={(e) => update('wunschkredit', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Max. möglich"
                  style={{ ...IS, height: '56px', paddingRight: '44px', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}
                  onFocus={onFocus} onBlur={onBlur}
                />
                <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#6b6b6b', fontWeight: 700, pointerEvents: 'none' }}>€</span>
              </div>
            </div>

            <div>
              <FieldLabel required>Laufzeit</FieldLabel>
              <SelectWrapper>
                <select value={form.laufzeit} onChange={(e) => update('laufzeit', Number(e.target.value) as 12 | 24 | 36 | 48 | 60 | 84)} style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                  {[12, 24, 36, 48, 60, 84].map((n) => (
                    <option key={n} value={n}>{n} Monate</option>
                  ))}
                </select>
              </SelectWrapper>
            </div>
          </div>
        </SectionCard>

        {/* ── Validierungsfehler ── */}
        {validationError && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: '#991b1b', margin: 0 }}>{validationError}</p>
          </div>
        )}

        {/* ── Berechnen-Button ── */}
        <button
          onClick={berechnen}
          style={{
            width: '100%', height: '56px',
            backgroundColor: formChanged ? '#D4AF37' : '#0A3D2C',
            color: formChanged ? '#0A3D2C' : '#fff',
            border: 'none', borderRadius: '14px',
            fontSize: '16px', fontWeight: 800,
            cursor: 'pointer', letterSpacing: '0.03em',
            transition: 'transform 0.1s ease, opacity 0.1s ease, background-color 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" transform="scale(0.75) translate(3,3)" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          {formChanged ? 'Neu berechnen' : ergebnis ? 'Neu berechnen' : 'Jetzt berechnen'}
        </button>
      </div>

      {/* ════════════════════ RESULTS PANEL — 4 Spalten, sticky ════════════════════ */}
      <div className="lg:col-span-4">
        <div
          className="slide-in-right"
          style={{
            position: 'sticky', top: '88px',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(232,226,217,0.9)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {ergebnis && !formChanged ? (
            <div className="fade-in">
              <div style={{ backgroundColor: '#0A3D2C', padding: '18px 24px' }}>
                <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(212,175,55,0.85)', textTransform: 'uppercase', letterSpacing: '0.18em', margin: 0 }}>
                  IHRE ERSTEINSCHÄTZUNG
                </p>
              </div>

              {/* Rate */}
              <div style={{ padding: '22px 24px', borderBottom: '1px solid #F0EDE8' }}>
                <p style={{ fontSize: '12px', color: '#6b6b6b', margin: '0 0 5px', fontWeight: 500 }}>Monatliche Rate</p>
                <p style={{ fontSize: '44px', fontWeight: 800, color: '#0A3D2C', lineHeight: 1, letterSpacing: '-0.03em', margin: '0 0 5px' }}>
                  {formatEuro(ergebnis.monatsRate)}
                </p>
                <p style={{ fontSize: '12px', color: '#6b6b6b', margin: 0 }}>
                  pro Monat · {form.laufzeit} Monate Laufzeit
                </p>
              </div>

              {/* Kennzahlen */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #F0EDE8' }}>
                {[
                  { label: 'Kreditbetrag', value: formatEuro(ergebnis.aktuellerKredit) },
                  { label: 'Max. Kreditrahmen', value: formatEuro(ergebnis.maxKredit) },
                  { label: 'Zinssatz p.a.', value: `${(ergebnis.zinssatz * 100).toFixed(1)} %` },
                  { label: 'Zinsen mtl.', value: formatEuro(zinsenMonatlich) },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #F7F5F0' }}>
                    <span style={{ fontSize: '12px', color: '#6b6b6b' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0A3D2C' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Bonität — subtil */}
              <div style={{ padding: '14px 24px', borderBottom: '1px solid #F0EDE8' }}>
                <BonitaetBadge label={ergebnis.bonitaetLabel} score={ergebnis.bonitaetScore} zinssatz={ergebnis.zinssatz} size="sm" />
              </div>

              {/* CTA */}
              <div style={{ padding: '18px 24px' }}>
                <button
                  onClick={() => onLeadTrigger(ergebnis, form)}
                  style={{ width: '100%', height: '48px', backgroundColor: '#D4AF37', color: '#0A3D2C', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em', transition: 'transform 0.1s ease, opacity 0.1s ease', marginBottom: '12px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Vollständige Auswertung erhalten
                </button>
                <p style={{ fontSize: '11px', color: '#6b6b6b', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                  Detailauswertung & Beratung — kostenlos per E-Mail
                </p>
              </div>
            </div>
          ) : (
            /* Placeholder / Formular geändert */
            <div style={{ padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: formChanged ? 'rgba(212,175,55,0.12)' : '#F7F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: formChanged ? '2px solid rgba(212,175,55,0.4)' : 'none' }}>
                <svg width="24" height="24" fill="none" stroke={formChanged ? '#D4AF37' : '#0A5D3F'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <p style={{ fontWeight: 700, color: '#0A3D2C', fontSize: '15px', margin: '0 0 8px' }}>
                {formChanged ? 'Eingaben geändert' : 'Bereit zur Berechnung'}
              </p>
              <p style={{ fontSize: '13px', color: '#6b6b6b', lineHeight: 1.6, margin: '0 0 20px' }}>
                {formChanged
                  ? 'Klicken Sie auf „Neu berechnen" um Ihre aktualisierten Konditionen zu sehen.'
                  : 'Füllen Sie das Formular aus und klicken Sie auf „Jetzt berechnen".'}
              </p>
              <button
                onClick={berechnen}
                style={{ width: '100%', height: '44px', backgroundColor: formChanged ? '#D4AF37' : '#0A3D2C', color: formChanged ? '#0A3D2C' : '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {formChanged ? 'Neu berechnen' : 'Jetzt berechnen'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════ TEASER KOSTEN-ÜBERSICHT ════════════════════ */}
      {ergebnis && !formChanged && (
        <div className="lg:col-span-12 fade-in-up">
          <div style={{ border: '1px solid #E8E2D9', borderRadius: '18px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '24px 28px 18px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#0A3D2C', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
                Kosten-Übersicht
              </h4>
              <p style={{ fontSize: '12px', color: '#6b6b6b', margin: 0 }}>
                Vorschau · {form.laufzeit} Monate · {(ergebnis.zinssatz * 100).toFixed(1)} % Zinssatz · {formatEuro(ergebnis.aktuellerKredit)} Kreditbetrag
              </p>
            </div>

            {/* Sichtbare Zeilen */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F7F5F0' }}>
                    {['Kennzahl', 'Betrag'].map((h, i) => (
                      <th key={h} style={{ padding: '10px 20px', fontSize: '11px', fontWeight: 700, color: '#0A3D2C', textAlign: i === 0 ? 'left' : 'right', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Monatliche Rate', value: formatEuro(ergebnis.monatsRate) },
                    { label: 'Kreditbetrag', value: formatEuro(ergebnis.aktuellerKredit) },
                  ].map((row, i) => (
                    <tr key={row.label} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAF8', borderBottom: '1px solid #F0EDE8' }}>
                      <td style={{ padding: '10px 20px', fontWeight: 600, color: '#0A3D2C' }}>{row.label}</td>
                      <td style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 700 }}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Blur-Overlay über Rest */}
            <div style={{ position: 'relative' }}>
              {[
                { label: 'Zinskosten gesamt', value: formatEuro(zinsgesamt) },
                { label: 'Gesamtbetrag', value: formatEuro(ergebnis.gesamtkosten) },
                { label: 'Effektiver Jahreszins', value: `${(ergebnis.zinssatz * 100).toFixed(2)} %` },
              ].map((row, i) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #F0EDE8', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAF8', filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0A3D2C' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{row.value}</span>
                </div>
              ))}

              {/* CTA-Overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.96) 50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '24px' }}>
                <div style={{ textAlign: 'center', maxWidth: '420px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#0A3D2C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <svg width="18" height="20" fill="none" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="8" width="13" height="12" rx="2" /><path d="M7 8V5a4 4 0 018 0v3" />
                    </svg>
                  </div>
                  <p style={{ fontWeight: 700, color: '#0A3D2C', fontSize: '15px', margin: '0 0 6px' }}>
                    Vollständige Auswertung + persönliche Beratung
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b6b6b', margin: '0 0 16px', lineHeight: 1.5 }}>
                    Mit allen Kosten, Zinsentwicklung und individueller Einschätzung — kostenlos per E-Mail.
                  </p>
                  <button
                    onClick={() => onLeadTrigger(ergebnis, form)}
                    style={{ height: '44px', padding: '0 28px', backgroundColor: '#D4AF37', color: '#0A3D2C', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.1s ease, opacity 0.1s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    Jetzt kostenlos erhalten
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
