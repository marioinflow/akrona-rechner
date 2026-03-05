'use client';

import { useState, useCallback } from 'react';
import { berechnePrivatkredit, formatEuro } from '@/lib/berechnung';
import type { PrivatkreditEingaben, PrivatkreditErgebnis } from '@/types';
import BonitaetBadge from '@/components/ui/BonitaetBadge';

const DEFAULT: PrivatkreditEingaben = {
  nettoeinkommen: 3000,
  wunschkredit: undefined,
  haushaltsgroesse: 1,
  laufzeit: 60,
  status: 'angestellt',
};

interface Props {
  onLeadTrigger: (ergebnis: PrivatkreditErgebnis, eingaben: PrivatkreditEingaben) => void;
}

export default function PrivatkreditRechner({ onLeadTrigger }: Props) {
  const [form, setForm] = useState<PrivatkreditEingaben>(DEFAULT);
  const [ergebnis, setErgebnis] = useState<PrivatkreditErgebnis | null>(null);
  const [loading, setLoading] = useState(false);

  const update = useCallback(<K extends keyof PrivatkreditEingaben>(
    key: K,
    value: PrivatkreditEingaben[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErgebnis(null);
  }, []);

  const berechnen = () => {
    if (!form.nettoeinkommen) return;
    setLoading(true);
    setTimeout(() => {
      const res = berechnePrivatkredit(form);
      setErgebnis(res);
      setLoading(false);
    }, 300);
  };

  const inputClass = 'w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all';
  const inputStyle = { borderColor: '#E8E2D9', backgroundColor: '#fff', color: '#1a1a1a' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Formular */}
      <div className="lg:col-span-3 space-y-5">
        <div className="rounded-xl border p-5" style={{ borderColor: '#E8E2D9', backgroundColor: '#fff' }}>
          <h3 className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: '#0A3D2C' }}>
            Ihre Angaben
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b6b6b' }}>
                Monatliches Nettoeinkommen (€) *
              </label>
              <input
                type="number"
                value={form.nettoeinkommen || ''}
                onChange={(e) => update('nettoeinkommen', Number(e.target.value))}
                placeholder="3.000"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b6b6b' }}>
                Gewünschte Kreditsumme (€) <span style={{ color: '#6b6b6b' }}>optional</span>
              </label>
              <input
                type="number"
                value={form.wunschkredit || ''}
                onChange={(e) => update('wunschkredit', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max. möglich"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b6b6b' }}>
                Haushaltsgröße *
              </label>
              <select
                value={form.haushaltsgroesse}
                onChange={(e) => update('haushaltsgroesse', Number(e.target.value) as 1|2|3|4|5)}
                className={inputClass}
                style={inputStyle}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}{n === 5 ? '+' : ''} {n === 1 ? 'Person' : 'Personen'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b6b6b' }}>
                Laufzeit *
              </label>
              <select
                value={form.laufzeit}
                onChange={(e) => update('laufzeit', Number(e.target.value) as 12|24|36|48|60|84)}
                className={inputClass}
                style={inputStyle}
              >
                {[12, 24, 36, 48, 60, 84].map((n) => (
                  <option key={n} value={n}>{n} Monate</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium mb-2" style={{ color: '#6b6b6b' }}>
              Beschäftigungsstatus *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['angestellt', 'beamter', 'selbststaendig', 'rente'] as const).map((s) => {
                const label = { angestellt: 'Angestellt', beamter: 'Beamter', selbststaendig: 'Selbstständig', rente: 'Rente' }[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('status', s)}
                    className="rounded-lg border px-3 py-2.5 text-sm font-medium transition-all"
                    style={{
                      borderColor: form.status === s ? '#0A3D2C' : '#E8E2D9',
                      backgroundColor: form.status === s ? '#0A3D2C' : '#fff',
                      color: form.status === s ? '#fff' : '#1a1a1a',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={berechnen}
          disabled={loading || !form.nettoeinkommen}
          className="w-full py-4 rounded-xl font-semibold text-base transition-all duration-200"
          style={{
            backgroundColor: form.nettoeinkommen ? '#D4AF37' : '#E8E2D9',
            color: form.nettoeinkommen ? '#0A3D2C' : '#6b6b6b',
            cursor: form.nettoeinkommen ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Berechnung läuft…' : 'Kreditrahmen berechnen'}
        </button>

        <p className="text-center text-xs" style={{ color: '#6b6b6b' }}>
          Unverbindliche Ersteinschätzung — keine Bankzusage
        </p>
      </div>

      {/* Ergebnis */}
      <div className="lg:col-span-2">
        {ergebnis ? (
          <div className="space-y-4 fade-in-up">
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#E8E2D9' }}>
              <div className="px-5 py-4" style={{ backgroundColor: '#0A3D2C' }}>
                <h3 className="font-semibold text-sm uppercase tracking-widest" style={{ color: '#D4AF37' }}>
                  Ihr Kreditrahmen
                </h3>
              </div>
              <div className="p-5 space-y-4" style={{ backgroundColor: '#fff' }}>
                <BonitaetBadge
                  label={ergebnis.bonitaetLabel}
                  score={ergebnis.bonitaetScore}
                  zinssatz={ergebnis.zinssatz}
                />

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Max. Kreditrahmen', value: formatEuro(ergebnis.maxKredit), highlight: true },
                    ...(form.wunschkredit ? [{ label: 'Ihr Wunschkredit', value: formatEuro(ergebnis.aktuellerKredit), highlight: false }] : []),
                    { label: 'Monatliche Rate', value: formatEuro(ergebnis.monatsRate), highlight: false },
                    { label: 'Gesamtkosten inkl. Zinsen', value: formatEuro(ergebnis.gesamtkosten), highlight: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center py-3 px-4 rounded-lg"
                      style={{ backgroundColor: item.highlight ? '#F7F5F0' : '#fff', border: '1px solid #E8E2D9' }}
                    >
                      <span className="text-sm" style={{ color: '#6b6b6b' }}>{item.label}</span>
                      <span
                        className="font-semibold text-base"
                        style={{ color: item.highlight ? '#0A3D2C' : '#1a1a1a' }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onLeadTrigger(ergebnis, form)}
                  className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
                  style={{ backgroundColor: '#D4AF37', color: '#0A3D2C' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c4a030')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4AF37')}
                >
                  Vollständige Auswertung per E-Mail erhalten
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl border p-8 flex flex-col items-center justify-center text-center h-full min-h-64"
            style={{ borderColor: '#E8E2D9', backgroundColor: '#fff' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#F7F5F0' }}
            >
              <svg width="24" height="24" fill="none" stroke="#0A3D2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <p className="font-medium mb-1" style={{ color: '#0A3D2C' }}>Bereit zur Berechnung</p>
            <p className="text-sm" style={{ color: '#6b6b6b' }}>
              Füllen Sie die Felder aus und klicken Sie auf „Berechnen".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
