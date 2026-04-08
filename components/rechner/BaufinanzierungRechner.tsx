'use client';

import { useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { berechneBaufinanzierung, formatEuro, GRUNDERWERBSTEUER } from '@/lib/berechnung';
import type { BaufinanzierungEingaben, BaufinanzierungErgebnis } from '@/types';
import BonitaetBadge from '@/components/ui/BonitaetBadge';

const BUNDESLAENDER = Object.keys(GRUNDERWERBSTEUER).sort();

const LAENDER = [
  'Deutschland', 'Österreich', 'Schweiz',
  'Belgien', 'Bulgarien', 'Dänemark', 'Estland', 'Finnland',
  'Frankreich', 'Griechenland', 'Irland', 'Italien', 'Kroatien',
  'Lettland', 'Litauen', 'Luxemburg', 'Malta', 'Niederlande',
  'Polen', 'Portugal', 'Rumänien', 'Schweden', 'Slowakei',
  'Slowenien', 'Spanien', 'Tschechien', 'Ungarn', 'Zypern', 'Sonstiges',
];

const MAKLERGEBUEHREN = [
  { label: 'Keine Maklergebühr', value: 0 },
  { label: '1,19 %', value: 1.19 },
  { label: '2,38 %', value: 2.38 },
  { label: '3,57 %', value: 3.57 },
];

const FINANZIERUNGSOPTIONEN: {
  anteil: 100 | 80 | 60;
  label: string;
  sublabel: string;
  badge: string;
  approxZins: number;
}[] = [
  { anteil: 100, label: '100 %', sublabel: 'Vollfinanzierung', badge: '', approxZins: 4.8 },
  { anteil: 80,  label: '80 %',  sublabel: 'Empfohlen',        badge: 'Beliebt', approxZins: 3.6 },
  { anteil: 60,  label: '60 %',  sublabel: 'Sicherste Option', badge: '',  approxZins: 3.6 },
];

const DEFAULT: BaufinanzierungEingaben = {
  nettoeinkommen: 0,
  eigenkapital: 0,
  haushaltsgroesse: 2,
  laufzeit: 20,
  status: 'angestellt',
  verwendungszweck: 'kauf',
  kaufpreis: undefined,
  bundesland: 'Baden-Württemberg',
  maklergebuehr: 0,
  wohnsitzland: 'Deutschland',
  staatsangehoerigkeit: 'Deutschland',
  tilgungssatz: 0.02,
  finanzierungsanteil: 80,
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
  onLeadTrigger: (ergebnis: BaufinanzierungErgebnis, eingaben: BaufinanzierungEingaben) => void;
}

export default function BaufinanzierungRechner({ onLeadTrigger }: Props) {
  const [form, setForm] = useState<BaufinanzierungEingaben>(DEFAULT);
  const [ergebnis, setErgebnis] = useState<BaufinanzierungErgebnis | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  const [validationError, setValidationError] = useState('');

  const update = useCallback(<K extends keyof BaufinanzierungEingaben>(
    key: K,
    value: BaufinanzierungEingaben[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'kaufpreis' && next.finanzierungsanteil !== undefined) {
        const kp = Number(value) || 0;
        next.eigenkapital = Math.round(kp * (1 - next.finanzierungsanteil / 100));
      }
      if (key === 'eigenkapital') {
        next.finanzierungsanteil = undefined;
      }
      return next;
    });
    if (ergebnis) setFormChanged(true);
    setValidationError('');
  }, [ergebnis]);

  const selectFinanzierung = (anteil: 100 | 80 | 60) => {
    const kp = form.kaufpreis || 0;
    const eigenkapital = Math.round(kp * (1 - anteil / 100));
    setForm((prev) => ({ ...prev, finanzierungsanteil: anteil, eigenkapital }));
    if (ergebnis) setFormChanged(true);
  };

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
    setErgebnis(berechneBaufinanzierung(form));
    setFormChanged(false);
    setValidationError('');
  };

  const tSatz = form.tilgungssatz ?? 0.02;
  const tSatzPct = (tSatz * 100).toFixed(1);
  const sliderFillTilgung = (((tSatz * 100) - 2) / 8) * 100;
  const anzahlungMax = form.kaufpreis || 500000;
  const sliderFillAnzahlung = anzahlungMax > 0 ? (form.eigenkapital / anzahlungMax) * 100 : 0;

  const zinsenMonatlich = ergebnis ? Math.round(ergebnis.finanzierungsbedarf * ergebnis.zinssatz / 12) : 0;
  const restschuld = ergebnis?.tilgungsplan?.[ergebnis.tilgungsplan.length - 1]?.restschuld ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* ════════════════════ FORM — 8 Spalten ════════════════════ */}
      <div className="lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* 01: Persönliche Daten */}
        <SectionCard step="01" title="Persönliche Daten">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Wohnsitzland</FieldLabel>
              <SelectWrapper>
                <select value={form.wohnsitzland ?? 'Deutschland'} onChange={(e) => update('wohnsitzland', e.target.value)} style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                  {LAENDER.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </SelectWrapper>
            </div>

            <div>
              <FieldLabel>Staatsangehörigkeit</FieldLabel>
              <SelectWrapper>
                <select value={form.staatsangehoerigkeit ?? 'Deutschland'} onChange={(e) => update('staatsangehoerigkeit', e.target.value)} style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                  {LAENDER.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </SelectWrapper>
            </div>

            <div>
              <FieldLabel required>Beschäftigungsstatus</FieldLabel>
              <SelectWrapper>
                <select value={form.status} onChange={(e) => update('status', e.target.value as BaufinanzierungEingaben['status'])} style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
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
                  <input type="number" value={form.nettoeinkommen || ''} onChange={(e) => update('nettoeinkommen', Number(e.target.value))} placeholder="z.B. 3.500"
                    style={{ ...IS, height: '52px', paddingRight: '44px', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }} onFocus={onFocus} onBlur={onBlur} />
                  <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#6b6b6b', fontWeight: 600, pointerEvents: 'none' }}>€</span>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <FieldLabel required>Nettoeinkommen KN 1</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <input type="number" value={form.nettoeinkommen || ''} onChange={(e) => update('nettoeinkommen', Number(e.target.value))} placeholder="z.B. 2.500"
                      style={{ ...IS, height: '52px', paddingRight: '44px', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }} onFocus={onFocus} onBlur={onBlur} />
                    <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#6b6b6b', fontWeight: 600, pointerEvents: 'none' }}>€</span>
                  </div>
                </div>
                <div>
                  <FieldLabel required>Nettoeinkommen KN 2</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <input type="number" value={form.nettoeinkommen2 || ''} onChange={(e) => update('nettoeinkommen2', Number(e.target.value))} placeholder="z.B. 2.000"
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

        {/* 02: Immobilien-Daten */}
        <SectionCard step="02" title="Immobilien-Daten" subtitle="Optional — für Kaufnebenkosten & Szenarien">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FieldLabel>Kaufpreis</FieldLabel>
              <div style={{ position: 'relative' }}>
                <input type="number" value={form.kaufpreis || ''} onChange={(e) => update('kaufpreis', e.target.value ? Number(e.target.value) : undefined)} placeholder="z.B. 400.000"
                  style={{ ...IS, height: '56px', paddingRight: '44px', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }} onFocus={onFocus} onBlur={onBlur} />
                <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#6b6b6b', fontWeight: 700, pointerEvents: 'none' }}>€</span>
              </div>
            </div>

            <div>
              <FieldLabel>Bundesland</FieldLabel>
              <SelectWrapper>
                <select value={form.bundesland ?? 'Baden-Württemberg'} onChange={(e) => update('bundesland', e.target.value)} style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                  {BUNDESLAENDER.map((bl) => <option key={bl} value={bl}>{bl}</option>)}
                </select>
              </SelectWrapper>
            </div>

            <div>
              <FieldLabel>Verwendungszweck</FieldLabel>
              <SelectWrapper>
                <select value={form.verwendungszweck} onChange={(e) => update('verwendungszweck', e.target.value as BaufinanzierungEingaben['verwendungszweck'])} style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="kauf">Kauf</option>
                  <option value="neubau">Neubau</option>
                  <option value="anschlussfinanzierung">Anschlussfinanzierung</option>
                </select>
              </SelectWrapper>
            </div>

            <div>
              <FieldLabel>Laufzeit</FieldLabel>
              <SelectWrapper>
                <select value={form.laufzeit} onChange={(e) => update('laufzeit', Number(e.target.value) as 10 | 15 | 20 | 25 | 30)} style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                  {[10, 15, 20, 25, 30].map((n) => <option key={n} value={n}>{n} Jahre</option>)}
                </select>
              </SelectWrapper>
            </div>

            <div>
              <FieldLabel>Maklergebühr</FieldLabel>
              <SelectWrapper>
                <select value={form.maklergebuehr ?? 0} onChange={(e) => update('maklergebuehr', Number(e.target.value) as 0 | 1.19 | 2.38 | 3.57)} style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                  {MAKLERGEBUEHREN.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </SelectWrapper>
            </div>
          </div>
        </SectionCard>

        {/* 03: Finanzierungsoptionen */}
        <SectionCard step="03" title="Finanzierungsoptionen">
          <div className="grid grid-cols-3 gap-3">
            {FINANZIERUNGSOPTIONEN.map((opt) => {
              const isActive = form.finanzierungsanteil === opt.anteil;
              const anzahlung = form.kaufpreis ? Math.round(form.kaufpreis * (1 - opt.anteil / 100)) : null;
              return (
                <button key={opt.anteil} type="button" onClick={() => selectFinanzierung(opt.anteil)}
                  style={{ position: 'relative', border: `2px solid ${isActive ? '#0A5D3F' : '#E8E2D9'}`, borderRadius: '14px', padding: '16px 14px', backgroundColor: isActive ? 'rgba(10,93,63,0.05)' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, background-color 0.15s' }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = '#0A3D2C'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = '#E8E2D9'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {opt.badge && (
                    <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 700, color: '#fff', backgroundColor: '#0A3D2C', padding: '2px 10px', borderRadius: '99px', whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                      {opt.badge}
                    </span>
                  )}
                  {isActive && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#0A5D3F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 4 7 9 1" /></svg>
                    </span>
                  )}
                  <p style={{ fontSize: '22px', fontWeight: 800, color: isActive ? '#0A5D3F' : '#0A3D2C', lineHeight: 1, margin: '0 0 3px' }}>{opt.label}</p>
                  <p style={{ fontSize: '11px', color: '#6b6b6b', margin: '0 0 10px' }}>{opt.sublabel}</p>
                  <div style={{ borderTop: '1px solid #E8E2D9', paddingTop: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#6b6b6b', margin: '0 0 2px' }}>ab {opt.approxZins.toFixed(1)} % p.a.</p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#0A3D2C', margin: 0 }}>
                      {anzahlung !== null ? (anzahlung === 0 ? '0 € Anzahlung' : formatEuro(anzahlung)) : '— €'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '11px', color: '#6b6b6b', marginTop: '10px' }}>
            Anzahlung wird automatisch berechnet sobald ein Kaufpreis angegeben ist.
          </p>
        </SectionCard>

        {/* 04: Details */}
        <SectionCard step="04" title="Details">
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <FieldLabel>Tilgungsrate</FieldLabel>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', backgroundColor: '#3b82f6', padding: '3px 12px', borderRadius: '99px', letterSpacing: '0.03em' }}>
                {tSatzPct} %
              </span>
            </div>
            <input type="range" min={2} max={10} step={0.5} value={tSatz * 100}
              onChange={(e) => update('tilgungssatz', Number(e.target.value) / 100)}
              style={{ background: `linear-gradient(to right, #0A3D2C 0%, #0A3D2C ${sliderFillTilgung}%, #E8E2D9 ${sliderFillTilgung}%, #E8E2D9 100%)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
              <span style={{ fontSize: '11px', color: '#6b6b6b' }}>2,0 %</span>
              <span style={{ fontSize: '11px', color: '#6b6b6b' }}>10,0 %</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <FieldLabel>Anzahlung / Eigenkapital</FieldLabel>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0A3D2C' }}>
                {formatEuro(form.eigenkapital)}
                {form.kaufpreis && form.kaufpreis > 0 && (
                  <span style={{ fontSize: '11px', color: '#6b6b6b', marginLeft: '6px', fontWeight: 500 }}>
                    ({Math.round((form.eigenkapital / form.kaufpreis) * 100)} %)
                  </span>
                )}
              </span>
            </div>
            <input type="range" min={0} max={anzahlungMax} step={5000} value={form.eigenkapital}
              onChange={(e) => update('eigenkapital', Number(e.target.value))}
              style={{ background: `linear-gradient(to right, #0A3D2C 0%, #0A3D2C ${sliderFillAnzahlung}%, #E8E2D9 ${sliderFillAnzahlung}%, #E8E2D9 100%)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
              <span style={{ fontSize: '11px', color: '#6b6b6b' }}>0 €</span>
              <span style={{ fontSize: '11px', color: '#6b6b6b' }}>{formatEuro(anzahlungMax)}</span>
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
                <p style={{ fontSize: '12px', color: '#6b6b6b', margin: '0 0 5px', fontWeight: 500 }}>
                  {form.kaufpreis ? 'Monatliche Rate' : 'Rate bei max. Kreditrahmen'}
                </p>
                <p style={{ fontSize: '44px', fontWeight: 800, color: '#0A3D2C', lineHeight: 1, letterSpacing: '-0.03em', margin: '0 0 5px' }}>
                  {formatEuro(ergebnis.monatsRate)}
                </p>
                <p style={{ fontSize: '12px', color: '#6b6b6b', margin: 0 }}>
                  pro Monat · {form.laufzeit} Jahre · {(tSatz * 100).toFixed(1)} % Tilgung
                </p>
              </div>

              {/* Kennzahlen */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #F0EDE8' }}>
                {[
                  { label: 'Zinssatz p.a.', value: `${(ergebnis.zinssatz * 100).toFixed(1)} %` },
                  { label: 'Zinsen mtl.', value: formatEuro(zinsenMonatlich) },
                  ...(form.kaufpreis ? [{ label: 'Finanzierungsbedarf', value: formatEuro(ergebnis.finanzierungsbedarf) }] : []),
                  { label: `Restschuld (${form.laufzeit} J.)`, value: formatEuro(restschuld) },
                  { label: 'Max. Kreditrahmen', value: formatEuro(ergebnis.maxKredit) },
                  { label: 'Kaufkraft gesamt', value: formatEuro(ergebnis.kaufkraft) },
                  ...(ergebnis.gesamtkaufkosten ? [{ label: 'Gesamtkaufkosten', value: formatEuro(ergebnis.gesamtkaufkosten) }] : []),
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
                  Tilgungsplan, Szenarien & Beratung — kostenlos per E-Mail
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

      {/* ════════════════════ VOLLSTÄNDIGER TILGUNGSPLAN + CHARTS ════════════════════ */}
      {ergebnis && !formChanged && (() => {
        const startJahr = new Date().getFullYear() + 1;
        const chartData = ergebnis.tilgungsplan?.map((p) => ({
          jahr: startJahr + p.jahr - 1,
          restschuld: p.restschuld,
          zinsen: p.jahresZinsen,
          tilgung: p.jahresTilgung,
        })) ?? [];

        const fK = (v: number) => {
          if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} M€`;
          if (v >= 1_000) return `${Math.round(v / 1_000)} k€`;
          return `${v} €`;
        };

        return (
          <>
            {/* — Vollständige Tilgungsplan-Tabelle — */}
            <div className="lg:col-span-12 fade-in-up">
              <div style={{ border: '1px solid #E8E2D9', borderRadius: '18px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ padding: '24px 28px 18px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#0A3D2C', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
                    Jahres-Tilgungsplan
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6b6b6b', margin: 0 }}>
                    {form.laufzeit} Jahre · {(ergebnis.zinssatz * 100).toFixed(1)} % Zinssatz · {(tSatz * 100).toFixed(1)} % Tilgung
                    {form.kaufpreis ? ` · Darlehensbetrag: ${formatEuro(ergebnis.finanzierungsbedarf)}` : ''}
                  </p>
                </div>
                <div style={{ overflowX: 'auto', maxHeight: '360px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr style={{ backgroundColor: '#F7F5F0' }}>
                        {['Jahr', 'Jahres-Zinsen', 'Jahres-Tilgung', 'Restschuld', 'Kum. Zinsen', 'Kum. Tilgung'].map((h, i) => (
                          <th key={h} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#0A3D2C', textAlign: i === 0 ? 'left' : 'right', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E8E2D9', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ergebnis.tilgungsplan?.map((punkt, i) => (
                        <tr key={punkt.jahr} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAF8', borderBottom: '1px solid #F0EDE8' }}>
                          <td style={{ padding: '9px 16px', fontWeight: 600, color: '#0A3D2C', whiteSpace: 'nowrap' }}>{startJahr + punkt.jahr - 1}</td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: '#3b82f6', fontWeight: 500 }}>{formatEuro(punkt.jahresZinsen)}</td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: '#0A5D3F', fontWeight: 500 }}>{formatEuro(punkt.jahresTilgung)}</td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', fontWeight: 700, color: punkt.restschuld === 0 ? '#16a34a' : '#0A3D2C' }}>{formatEuro(punkt.restschuld)}</td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: '#6b6b6b' }}>{formatEuro(punkt.gezahlteZinsen)}</td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: '#6b6b6b' }}>{formatEuro(punkt.gezahltesTilgung)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* — Charts — */}
            <div className="lg:col-span-12 fade-in-up">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Chart 1: Restschuld */}
                <div style={{ border: '1px solid #E8E2D9', borderRadius: '18px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '24px 20px 16px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#0A3D2C', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Restschuld</h4>
                  <p style={{ fontSize: '12px', color: '#6b6b6b', margin: '0 0 20px' }}>Entwicklung über {form.laufzeit} Jahre</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradRestschuld" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                      <XAxis dataKey="jahr" tick={{ fontSize: 11, fill: '#6b6b6b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tickFormatter={fK} tick={{ fontSize: 11, fill: '#6b6b6b' }} tickLine={false} axisLine={false} width={60} />
                      <Tooltip
                        contentStyle={{ borderRadius: '10px', border: '1px solid #E8E2D9', fontSize: '13px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                        formatter={(value) => [formatEuro(Number(value)), 'Restschuld']}
                        labelFormatter={(label) => `Jahr ${label}`}
                      />
                      <Area type="monotone" dataKey="restschuld" stroke="#3b82f6" strokeWidth={2} fill="url(#gradRestschuld)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Chart 2: Zinsen vs. Tilgung */}
                <div style={{ border: '1px solid #E8E2D9', borderRadius: '18px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '24px 20px 16px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#0A3D2C', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Zinsen vs. Tilgung</h4>
                  <div style={{ display: 'flex', gap: '16px', margin: '0 0 16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#6b6b6b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />Zinsen
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b6b6b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0A5D3F' }} />Tilgung
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradZinsen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradTilgung" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0A5D3F" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0A5D3F" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                      <XAxis dataKey="jahr" tick={{ fontSize: 11, fill: '#6b6b6b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tickFormatter={fK} tick={{ fontSize: 11, fill: '#6b6b6b' }} tickLine={false} axisLine={false} width={60} />
                      <Tooltip
                        contentStyle={{ borderRadius: '10px', border: '1px solid #E8E2D9', fontSize: '13px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                        formatter={(value, name) => [formatEuro(Number(value)), name === 'zinsen' ? 'Zinsen' : 'Tilgung']}
                        labelFormatter={(label) => `Jahr ${label}`}
                      />
                      <Area type="monotone" dataKey="zinsen" stroke="#3b82f6" strokeWidth={2} fill="url(#gradZinsen)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
                      <Area type="monotone" dataKey="tilgung" stroke="#0A5D3F" strokeWidth={2} fill="url(#gradTilgung)" dot={false} activeDot={{ r: 4, fill: '#0A5D3F' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
