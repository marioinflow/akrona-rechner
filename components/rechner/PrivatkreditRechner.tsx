'use client';

import { useState, useMemo } from 'react';
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
      <svg width="14" height="14" fill="none" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
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

  const ergebnis = useMemo<PrivatkreditErgebnis | null>(() => {
    if (!form.nettoeinkommen || form.nettoeinkommen <= 0) return null;
    return berechnePrivatkredit(form);
  }, [form]);

  const update = <K extends keyof PrivatkreditEingaben>(
    key: K,
    value: PrivatkreditEingaben[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const zinsenMonatlich = ergebnis
    ? Math.round(ergebnis.aktuellerKredit * ergebnis.zinssatz / 12)
    : 0;

  const zinsgesamt = ergebnis
    ? ergebnis.gesamtkosten - ergebnis.aktuellerKredit
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* ════════════════════════════════
          FORM — 8 Spalten
      ════════════════════════════════ */}
      <div className="lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* SEKTION 1 */}
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
              <FieldLabel required>Haushaltsgröße</FieldLabel>
              <SelectWrapper>
                <select value={form.haushaltsgroesse} onChange={(e) => update('haushaltsgroesse', Number(e.target.value) as 1 | 2 | 3 | 4 | 5)} style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}{n === 5 ? '+' : ''} {n === 1 ? 'Person' : 'Personen'}</option>
                  ))}
                </select>
              </SelectWrapper>
            </div>

            <div className="sm:col-span-2">
              <FieldLabel required>Monatliches Nettoeinkommen</FieldLabel>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={form.nettoeinkommen || ''}
                  onChange={(e) => update('nettoeinkommen', Number(e.target.value))}
                  placeholder="z.B. 3.000"
                  style={{ ...IS, height: '52px', paddingRight: '44px', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}
                  onFocus={onFocus} onBlur={onBlur}
                />
                <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#6b6b6b', fontWeight: 600, pointerEvents: 'none' }}>€</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* SEKTION 2 */}
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
      </div>

      {/* ════════════════════════════════
          RESULTS PANEL — 4 Spalten
      ════════════════════════════════ */}
      <div className="lg:col-span-4">
        <div
          className="slide-in-right"
          style={{
            position: 'sticky',
            top: '88px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(232,226,217,0.9)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {ergebnis ? (
            <div className="fade-in">
              <div style={{ backgroundColor: '#0A3D2C', padding: '18px 24px' }}>
                <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(212,175,55,0.85)', textTransform: 'uppercase', letterSpacing: '0.18em', margin: 0 }}>
                  IHRE KONDITIONEN
                </p>
              </div>

              <div style={{ padding: '22px 24px', borderBottom: '1px solid #F0EDE8' }}>
                <p style={{ fontSize: '12px', color: '#6b6b6b', margin: '0 0 5px', fontWeight: 500 }}>Monatliche Rate</p>
                <p style={{ fontSize: '44px', fontWeight: 800, color: '#0A3D2C', lineHeight: 1, letterSpacing: '-0.03em', margin: '0 0 5px' }}>
                  {formatEuro(ergebnis.monatsRate)}
                </p>
                <p style={{ fontSize: '12px', color: '#6b6b6b', margin: 0 }}>
                  pro Monat · {form.laufzeit} Monate Laufzeit
                </p>
              </div>

              <div style={{ padding: '16px 24px', borderBottom: '1px solid #F0EDE8' }}>
                {[
                  { label: 'Kreditbetrag', value: formatEuro(ergebnis.aktuellerKredit) },
                  { label: 'Max. Kreditrahmen', value: formatEuro(ergebnis.maxKredit) },
                  { label: 'Zinsen monatlich', value: formatEuro(zinsenMonatlich) },
                  { label: 'Zinssatz p.a.', value: `${(ergebnis.zinssatz * 100).toFixed(1)} %` },
                  { label: 'Zinskosten gesamt', value: formatEuro(zinsgesamt) },
                  { label: 'Gesamtbetrag', value: formatEuro(ergebnis.gesamtkosten) },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #F7F5F0' }}>
                    <span style={{ fontSize: '12px', color: '#6b6b6b' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0A3D2C' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '14px 24px', borderBottom: '1px solid #F0EDE8' }}>
                <BonitaetBadge label={ergebnis.bonitaetLabel} score={ergebnis.bonitaetScore} zinssatz={ergebnis.zinssatz} size="sm" />
              </div>

              <div style={{ padding: '18px 24px' }}>
                <button
                  onClick={() => onLeadTrigger(ergebnis, form)}
                  style={{ width: '100%', height: '48px', backgroundColor: '#0A3D2C', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.03em', transition: 'transform 0.1s ease, opacity 0.1s ease', marginBottom: '12px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Unverbindlich anfragen
                </button>
                <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <svg width="11" height="13" fill="none" stroke="#0A5D3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1.5" y="5.5" width="8" height="7" rx="1.5" />
                    <path d="M3.5 5.5V3.5a2.5 2.5 0 015 0v2" />
                  </svg>
                  <p style={{ fontSize: '11px', color: '#6b6b6b', margin: 0 }}>SSL-gesichert · 100 % kostenlos</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#F7F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" fill="none" stroke="#0A5D3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <p style={{ fontWeight: 700, color: '#0A3D2C', fontSize: '15px', margin: '0 0 8px' }}>Ergebnis erscheint hier</p>
              <p style={{ fontSize: '13px', color: '#6b6b6b', lineHeight: 1.6, margin: 0 }}>
                Geben Sie Ihr Nettoeinkommen ein — Ihre Konditionen werden sofort berechnet.
              </p>
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Monatliche Rate', 'Kreditrahmen', 'Zinssatz', 'Gesamtbetrag'].map((item) => (
                  <div key={item} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F7F5F0' }}>
                    <span style={{ fontSize: '12px', color: '#6b6b6b' }}>{item}</span>
                    <span style={{ width: '60px', height: '12px', borderRadius: '4px', backgroundColor: '#E8E2D9', display: 'inline-block' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
