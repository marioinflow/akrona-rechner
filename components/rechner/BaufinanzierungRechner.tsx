'use client';

import { useState, useCallback } from 'react';
import { berechneBaufinanzierung, formatEuro, GRUNDERWERBSTEUER } from '@/lib/berechnung';
import type { BaufinanzierungEingaben, BaufinanzierungErgebnis } from '@/types';
import DetailAuswertung from '@/components/rechner/DetailAuswertung';

const BUNDESLAENDER = Object.keys(GRUNDERWERBSTEUER).sort();
const MAKLERGEBUEHREN = [
  { label: 'Keine Maklergebühr', value: 0 },
  { label: '1,19 % (inkl. MwSt.)', value: 1.19 },
  { label: '2,38 % (inkl. MwSt.)', value: 2.38 },
  { label: '3,57 % (inkl. MwSt.)', value: 3.57 },
];

const DEFAULT: BaufinanzierungEingaben = {
  nettoeinkommen: 3500,
  eigenkapital: 0,
  haushaltsgroesse: 2,
  laufzeit: 20,
  status: 'angestellt',
  verwendungszweck: 'kauf',
  kaufpreis: undefined,
  bundesland: 'Baden-Württemberg',
  maklergebuehr: 0,
};

const IS = {
  height: '50px',
  border: '1.5px solid #E8E2D9',
  borderRadius: '8px',
  padding: '14px 18px',
  backgroundColor: '#F7F5F0',
  fontSize: '15px',
  fontWeight: '300',
  color: '#1a1a1a',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s, background 0.2s',
} as React.CSSProperties;

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = '#0A5D3F';
  e.currentTarget.style.backgroundColor = '#fff';
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = '#E8E2D9';
  e.currentTarget.style.backgroundColor = '#F7F5F0';
};

interface Props {
  onLeadTrigger: (ergebnis: BaufinanzierungErgebnis, eingaben: BaufinanzierungEingaben) => void;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '9px 16px',
        border: '1.5px solid',
        borderColor: active ? '#0A5D3F' : '#E8E2D9',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: active ? 500 : 300,
        color: active ? '#0A5D3F' : '#6b6b6b',
        backgroundColor: active ? 'rgba(10,93,63,0.05)' : '#fff',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#0A5D3F';
          e.currentTarget.style.color = '#0A5D3F';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#E8E2D9';
          e.currentTarget.style.color = '#6b6b6b';
        }
      }}
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 500, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '7px' }}>
      {children}
    </p>
  );
}

export default function BaufinanzierungRechner({ onLeadTrigger }: Props) {
  const [form, setForm] = useState<BaufinanzierungEingaben>(DEFAULT);
  const [ergebnis, setErgebnis] = useState<BaufinanzierungErgebnis | null>(null);
  const [loading, setLoading] = useState(false);

  const update = useCallback(<K extends keyof BaufinanzierungEingaben>(
    key: K,
    value: BaufinanzierungEingaben[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErgebnis(null);
  }, []);

  const berechnen = () => {
    if (!form.nettoeinkommen) return;
    setLoading(true);
    setTimeout(() => {
      setErgebnis(berechneBaufinanzierung(form));
      setLoading(false);
    }, 300);
  };

  const canCalc = !!form.nettoeinkommen;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ─── Formular ─── */}
        <div className="lg:col-span-3" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Grunddaten */}
          <div style={{ border: '1px solid #E8E2D9', borderRadius: '14px', padding: '32px', backgroundColor: '#fff' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '20px' }}>
              Ihre Angaben
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <Label>Nettoeinkommen (€) *</Label>
                <input type="number" value={form.nettoeinkommen || ''} onChange={(e) => update('nettoeinkommen', Number(e.target.value))} placeholder="3.500" style={IS} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <Label>Eigenkapital (€)</Label>
                <input type="number" value={form.eigenkapital || ''} onChange={(e) => update('eigenkapital', Number(e.target.value))} placeholder="0" style={IS} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <Label>Haushaltsgröße *</Label>
                <select value={form.haushaltsgroesse} onChange={(e) => update('haushaltsgroesse', Number(e.target.value) as 1|2|3|4|5)} style={IS} onFocus={onFocus} onBlur={onBlur}>
                  {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}{n===5?'+':''} {n===1?'Person':'Personen'}</option>)}
                </select>
              </div>
              <div>
                <Label>Laufzeit *</Label>
                <select value={form.laufzeit} onChange={(e) => update('laufzeit', Number(e.target.value) as 10|15|20|25|30)} style={IS} onFocus={onFocus} onBlur={onBlur}>
                  {[10,15,20,25,30].map((n) => <option key={n} value={n}>{n} Jahre</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Label>Beschäftigungsstatus *</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(['angestellt','beamter','selbststaendig','rente'] as const).map((s) => (
                  <Chip key={s} active={form.status===s} onClick={() => update('status', s)}>
                    {{angestellt:'Angestellt',beamter:'Beamter',selbststaendig:'Selbstständig',rente:'Rente'}[s]}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <Label>Verwendungszweck *</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(['kauf','neubau','anschlussfinanzierung'] as const).map((z) => (
                  <Chip key={z} active={form.verwendungszweck===z} onClick={() => update('verwendungszweck', z)}>
                    {{kauf:'Kauf',neubau:'Neubau',anschlussfinanzierung:'Anschlussfinanzierung'}[z]}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          {/* Kaufdetails */}
          <div style={{ border: '1px solid #E8E2D9', borderRadius: '14px', padding: '32px', backgroundColor: '#fff' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '4px' }}>
              Kaufdetails
            </p>
            <p style={{ fontSize: '13px', fontWeight: 300, color: '#6b6b6b', marginBottom: '20px' }}>
              Optional — für Grunderwerbsteuer, Notar & Maklergebühr
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Kaufpreis (€)</Label>
                <input type="number" value={form.kaufpreis||''} onChange={(e) => update('kaufpreis', e.target.value?Number(e.target.value):undefined)} placeholder="400.000" style={IS} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <Label>Bundesland</Label>
                <select value={form.bundesland} onChange={(e) => update('bundesland', e.target.value)} style={IS} onFocus={onFocus} onBlur={onBlur}>
                  {BUNDESLAENDER.map((bl) => <option key={bl} value={bl}>{bl}</option>)}
                </select>
              </div>
              <div>
                <Label>Maklergebühr</Label>
                <select value={form.maklergebuehr} onChange={(e) => update('maklergebuehr', Number(e.target.value) as 0|1.19|2.38|3.57)} style={IS} onFocus={onFocus} onBlur={onBlur}>
                  {MAKLERGEBUEHREN.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Berechnen */}
          <button
            onClick={berechnen}
            disabled={loading || !canCalc}
            style={{
              width: '100%',
              height: '52px',
              backgroundColor: canCalc ? '#0A3D2C' : '#E8E2D9',
              color: canCalc ? '#fff' : '#6b6b6b',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: canCalc ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { if (canCalc) { e.currentTarget.style.transform='scale(1.02)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(10,61,44,0.25)'; e.currentTarget.style.backgroundColor='#0A5D3F'; }}}
            onMouseLeave={(e) => { if (canCalc) { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.backgroundColor='#0A3D2C'; }}}
          >
            {loading ? 'Berechnung läuft…' : 'Finanzierungsmöglichkeit berechnen'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b6b6b' }}>
            Unverbindliche Ersteinschätzung — keine Bankzusage
          </p>
        </div>

        {/* ─── Schnellübersicht (Dark Green Panel) ─── */}
        <div className="lg:col-span-2">
          {ergebnis ? (
            <div style={{ backgroundColor: '#0A3D2C', borderRadius: '14px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                  Ersteinschätzung
                </p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 11px', borderRadius: '4px', fontSize: '11px', fontWeight: 500,
                  backgroundColor: ergebnis.bonitaetLabel==='Sehr gut' ? 'rgba(212,175,55,0.12)' : ergebnis.bonitaetLabel==='Mittel' ? 'rgba(255,193,7,0.1)' : 'rgba(255,100,100,0.1)',
                  color: ergebnis.bonitaetLabel==='Sehr gut' ? '#D4AF37' : ergebnis.bonitaetLabel==='Mittel' ? '#f5c842' : '#ff8080',
                  border: `1px solid ${ergebnis.bonitaetLabel==='Sehr gut' ? 'rgba(212,175,55,0.25)' : ergebnis.bonitaetLabel==='Mittel' ? 'rgba(255,193,7,0.25)' : 'rgba(255,100,100,0.25)'}`,
                }}>
                  <span style={{ width:'5px', height:'5px', borderRadius:'50%', backgroundColor:'currentColor', display:'inline-block' }} />
                  Bonität: {ergebnis.bonitaetLabel}
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />

              {[
                { label: 'Max. Kreditsumme', value: formatEuro(ergebnis.maxKredit), big: true },
                { label: 'Monatliche Rate (ca.)', value: formatEuro(ergebnis.monatsRate), big: false },
                { label: 'Kaufkraft gesamt', value: formatEuro(ergebnis.kaufkraft), big: false },
                { label: 'Zinssatz-Basis', value: `${(ergebnis.zinssatz*100).toFixed(1)} %`, big: false },
              ].map((item) => (
                <div key={item.label}>
                  <p style={{ fontSize: '11px', fontWeight: 300, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: item.big ? '28px' : '20px', fontWeight: item.big ? 600 : 400, color: item.big ? '#D4AF37' : '#fff', letterSpacing: item.big ? '-0.01em' : 0 }}>
                    {item.value}
                  </p>
                </div>
              ))}

              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />

              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                ↓ Vollständige Auswertung unten
              </p>
            </div>
          ) : (
            <div style={{ border: '1px solid #E8E2D9', borderRadius: '14px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '280px', backgroundColor: '#fff' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F7F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="22" height="22" fill="none" stroke="#0A3D2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="9" /><polyline points="11 6 11 11 14.5 13" />
                </svg>
              </div>
              <p style={{ fontWeight: 500, color: '#0A3D2C', marginBottom: '6px' }}>Bereit zur Berechnung</p>
              <p style={{ fontSize: '14px', fontWeight: 300, color: '#6b6b6b' }}>Füllen Sie die Felder aus und klicken Sie auf „Berechnen".</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail-Auswertung (volle Breite) */}
      {ergebnis && (
        <DetailAuswertung
          ergebnis={ergebnis}
          form={form}
          onLeadTrigger={() => onLeadTrigger(ergebnis, form)}
        />
      )}
    </div>
  );
}
