'use client';

import { formatEuro } from '@/lib/berechnung';
import { berechneTilgungsplan } from '@/lib/berechnung';
import type { BaufinanzierungErgebnis, BaufinanzierungEingaben } from '@/types';

interface Props {
  ergebnis: BaufinanzierungErgebnis;
  form: BaufinanzierungEingaben;
  onLeadTrigger: () => void;
}

const SZENARIEN = [
  { label: 'Sehr gut', zinssatz: 0.036, color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
  { label: 'Mittel',   zinssatz: 0.041, color: '#eab308', bg: '#fefce8', border: '#fef08a' },
  { label: 'Basis',    zinssatz: 0.048, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
];

function RestschuldChart({ kredit, zinssatz, laufzeit }: { kredit: number; zinssatz: number; laufzeit: number }) {
  const W = 520;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 32, left: 56 };

  // Datenpunkte: jedes Jahr
  const punkte: { jahr: number; restschuld: number }[] = [];
  const tilgungssatz = 0.02;
  const jahresrate = kredit * (zinssatz + tilgungssatz);
  let rest = kredit;
  punkte.push({ jahr: 0, restschuld: kredit });
  for (let j = 1; j <= laufzeit; j++) {
    const zinsen = rest * zinssatz;
    const tilgung = jahresrate - zinsen;
    rest = Math.max(0, rest - tilgung);
    punkte.push({ jahr: j, restschuld: rest });
  }

  const maxY = kredit;
  const toX = (j: number) => PAD.left + (j / laufzeit) * (W - PAD.left - PAD.right);
  const toY = (v: number) => PAD.top + (1 - v / maxY) * (H - PAD.top - PAD.bottom);

  const pathD = punkte
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.jahr).toFixed(1)} ${toY(p.restschuld).toFixed(1)}`)
    .join(' ');

  // Füllfläche
  const fillD =
    pathD +
    ` L ${toX(laufzeit).toFixed(1)} ${toY(0).toFixed(1)} L ${toX(0).toFixed(1)} ${toY(0).toFixed(1)} Z`;

  // Y-Achse Ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: kredit * f,
    y: toY(kredit * f),
  }));

  // X-Achse Ticks (alle 5 Jahre)
  const xTicks: number[] = [];
  for (let j = 0; j <= laufzeit; j += 5) xTicks.push(j);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="restschuldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A5D3F" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0A5D3F" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Gitterlinien */}
      {yTicks.map((t) => (
        <line
          key={t.value}
          x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
          stroke="#E8E2D9" strokeWidth="1"
        />
      ))}

      {/* Füllfläche */}
      <path d={fillD} fill="url(#restschuldGrad)" />

      {/* Linie */}
      <path d={pathD} fill="none" stroke="#0A5D3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Y-Achse Labels */}
      {yTicks.map((t) => (
        <text
          key={t.value}
          x={PAD.left - 6} y={t.y + 4}
          textAnchor="end" fontSize="10" fill="#6b6b6b"
        >
          {t.value >= 1000 ? `${Math.round(t.value / 1000)}k` : '0'}
        </text>
      ))}

      {/* X-Achse Labels */}
      {xTicks.map((j) => (
        <text
          key={j}
          x={toX(j)} y={H - PAD.bottom + 14}
          textAnchor="middle" fontSize="10" fill="#6b6b6b"
        >
          {j === 0 ? 'Start' : `J${j}`}
        </text>
      ))}

      {/* Startpunkt */}
      <circle cx={toX(0)} cy={toY(kredit)} r="4" fill="#0A3D2C" />
      {/* Endpunkt */}
      <circle cx={toX(laufzeit)} cy={toY(punkte[punkte.length - 1].restschuld)} r="4" fill="#D4AF37" />
    </svg>
  );
}

export default function DetailAuswertung({ ergebnis, form, onLeadTrigger }: Props) {
  const tilgungsplan = berechneTilgungsplan(ergebnis.maxKredit, ergebnis.zinssatz, form.laufzeit);

  return (
    <div className="space-y-5 fade-in-up">

      {/* ── Hypotheken-Szenarien ── */}
      <div className="rounded-xl border p-5" style={{ borderColor: '#E8E2D9', backgroundColor: '#fff' }}>
        <h4 className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: '#0A3D2C' }}>
          Hypotheken-Szenarien
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {SZENARIEN.map((s) => {
            const rate = Math.round(ergebnis.maxKredit * (s.zinssatz + 0.02) / 12);
            const isAktiv = s.label === ergebnis.bonitaetLabel;
            return (
              <div
                key={s.label}
                className="rounded-lg border p-3 text-center relative"
                style={{
                  borderColor: isAktiv ? s.color : '#E8E2D9',
                  backgroundColor: isAktiv ? s.bg : '#fafaf9',
                  borderWidth: isAktiv ? 2 : 1,
                }}
              >
                {isAktiv && (
                  <span
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: s.color, color: '#fff', fontSize: '10px' }}
                  >
                    Ihre Bonität
                  </span>
                )}
                <p className="text-xs font-medium mb-1" style={{ color: s.color }}>{s.label}</p>
                <p className="text-sm font-bold mb-0.5" style={{ color: '#0A3D2C' }}>
                  {(s.zinssatz * 100).toFixed(1)} %
                </p>
                <p className="text-xs" style={{ color: '#6b6b6b' }}>Zinssatz p.a.</p>
                <div className="border-t mt-2 pt-2" style={{ borderColor: '#E8E2D9' }}>
                  <p className="text-xs font-semibold" style={{ color: '#1a1a1a' }}>{formatEuro(rate)}/Monat</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Gesamtkaufkosten (nur wenn Kaufpreis angegeben) ── */}
      {ergebnis.gesamtkaufkosten && form.kaufpreis && (
        <div className="rounded-xl border p-5" style={{ borderColor: '#E8E2D9', backgroundColor: '#fff' }}>
          <h4 className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: '#0A3D2C' }}>
            Gesamtkaufkosten
          </h4>
          <table className="w-full text-sm">
            <tbody>
              {[
                { label: 'Kaufpreis', value: formatEuro(form.kaufpreis) },
                { label: `Grunderwerbsteuer (${form.bundesland})`, value: formatEuro(ergebnis.grunderwerbsteuer ?? 0) },
                { label: `Maklergebühr (${form.maklergebuehr ?? 0} %)`, value: formatEuro(ergebnis.maklergebuehr ?? 0) },
                { label: 'Notar & Grundbuch (ca. 1,5 %)', value: formatEuro((ergebnis.nebenkosten ?? 0) - (ergebnis.grunderwerbsteuer ?? 0) - (ergebnis.maklergebuehr ?? 0)) },
                { label: 'Nebenkosten gesamt', value: formatEuro(ergebnis.nebenkosten ?? 0), sub: true },
              ].map((row) => (
                <tr key={row.label} className="border-b last:border-0" style={{ borderColor: '#E8E2D9' }}>
                  <td className="py-2.5" style={{ color: row.sub ? '#0A3D2C' : '#6b6b6b', fontWeight: row.sub ? 600 : 400 }}>{row.label}</td>
                  <td className="py-2.5 text-right" style={{ color: row.sub ? '#0A3D2C' : '#1a1a1a', fontWeight: row.sub ? 600 : 500 }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#F7F5F0' }}>
                <td className="py-3 px-2 rounded-bl-lg font-bold" style={{ color: '#0A3D2C' }}>Gesamtkosten</td>
                <td className="py-3 px-2 rounded-br-lg font-bold text-right" style={{ color: '#0A3D2C' }}>
                  {formatEuro(ergebnis.gesamtkaufkosten)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── Restschuld-Diagramm ── */}
      <div className="rounded-xl border p-5" style={{ borderColor: '#E8E2D9', backgroundColor: '#fff' }}>
        <h4 className="font-semibold text-sm uppercase tracking-widest mb-1" style={{ color: '#0A3D2C' }}>
          Restschuld-Verlauf
        </h4>
        <p className="text-xs mb-4" style={{ color: '#6b6b6b' }}>
          Entwicklung über {form.laufzeit} Jahre bei {(ergebnis.zinssatz * 100).toFixed(1)} % Zinssatz
        </p>
        <RestschuldChart
          kredit={ergebnis.maxKredit}
          zinssatz={ergebnis.zinssatz}
          laufzeit={form.laufzeit}
        />
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0A3D2C' }} />
            <span className="text-xs" style={{ color: '#6b6b6b' }}>Startschuld: {formatEuro(ergebnis.maxKredit)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
            <span className="text-xs" style={{ color: '#6b6b6b' }}>Nach {form.laufzeit} Jahren: {formatEuro(tilgungsplan[tilgungsplan.length - 1]?.restschuld ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* ── Jahres-Tilgungsplan ── */}
      <div className="rounded-xl border p-5" style={{ borderColor: '#E8E2D9', backgroundColor: '#fff' }}>
        <h4 className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: '#0A3D2C' }}>
          Jahres-Tilgungsplan
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: '#F7F5F0' }}>
                <th className="text-left py-2.5 px-3 font-semibold rounded-tl-lg" style={{ color: '#0A3D2C' }}>Jahr</th>
                <th className="text-right py-2.5 px-3 font-semibold" style={{ color: '#0A3D2C' }}>Restschuld</th>
                <th className="text-right py-2.5 px-3 font-semibold" style={{ color: '#0A3D2C' }}>Gez. Zinsen</th>
                <th className="text-right py-2.5 px-3 font-semibold rounded-tr-lg" style={{ color: '#0A3D2C' }}>Gez. Tilgung</th>
              </tr>
            </thead>
            <tbody>
              {tilgungsplan.map((punkt, i) => (
                <tr
                  key={punkt.jahr}
                  className="border-t"
                  style={{
                    borderColor: '#E8E2D9',
                    backgroundColor: i % 2 === 0 ? '#fff' : '#fafaf9',
                  }}
                >
                  <td className="py-2.5 px-3 font-medium" style={{ color: '#1a1a1a' }}>{punkt.jahr}. Jahr</td>
                  <td className="py-2.5 px-3 text-right font-semibold" style={{ color: '#0A3D2C' }}>
                    {formatEuro(punkt.restschuld)}
                  </td>
                  <td className="py-2.5 px-3 text-right" style={{ color: '#6b6b6b' }}>
                    {formatEuro(punkt.gezahlteZinsen)}
                  </td>
                  <td className="py-2.5 px-3 text-right" style={{ color: '#6b6b6b' }}>
                    {formatEuro(punkt.gezahltesTilgung)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="rounded-xl border p-5" style={{ borderColor: '#D4AF37', backgroundColor: '#fffdf5' }}>
        <p className="text-sm mb-3 font-medium" style={{ color: '#0A3D2C' }}>
          Vollständige Auswertung als PDF — kostenlos & unverbindlich
        </p>
        <p className="text-xs mb-4" style={{ color: '#6b6b6b' }}>
          Erhalten Sie alle Berechnungen, den Tilgungsplan und Ihre nächsten Schritte übersichtlich per E-Mail.
        </p>
        <button
          onClick={onLeadTrigger}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all"
          style={{ backgroundColor: '#D4AF37', color: '#0A3D2C' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c4a030')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4AF37')}
        >
          Vollständige Auswertung per E-Mail erhalten
        </button>
      </div>
    </div>
  );
}
