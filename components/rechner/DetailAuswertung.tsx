'use client';

import { formatEuro } from '@/lib/berechnung';
import { berechneTilgungsplan } from '@/lib/berechnung';
import { RECHNER_CONFIG } from '@/lib/rechner-config';
import type { BaufinanzierungErgebnis, BaufinanzierungEingaben } from '@/types';

interface Props {
  ergebnis: BaufinanzierungErgebnis;
  form: BaufinanzierungEingaben;
  onLeadTrigger: () => void;
}

// Szenarien aus zentraler Config
const SZENARIEN = RECHNER_CONFIG.bauBewertungsBaender.map((b) => ({
  label: b.label,
  zinssatz: b.zinssatz,
  color: b.label === 'Sehr gut' ? '#16a34a' : b.label === 'Mittel' ? '#ca8a04' : '#dc2626',
  bg: b.label === 'Sehr gut' ? '#f0fdf4' : b.label === 'Mittel' ? '#fefce8' : '#fef2f2',
  border: b.label === 'Sehr gut' ? '#bbf7d0' : b.label === 'Mittel' ? '#fef08a' : '#fecaca',
}));

function RestschuldChart({ darlehensbetrag, zinssatz, laufzeit, tilgungssatz }: {
  darlehensbetrag: number; zinssatz: number; laufzeit: number; tilgungssatz: number;
}) {
  if (darlehensbetrag <= 0) return null;

  const W = 520;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 32, left: 60 };

  const punkte: { jahr: number; restschuld: number }[] = [];
  const jahresrate = darlehensbetrag * (zinssatz + tilgungssatz);
  let rest = darlehensbetrag;
  punkte.push({ jahr: 0, restschuld: darlehensbetrag });
  for (let j = 1; j <= laufzeit; j++) {
    const zinsen = rest * zinssatz;
    const tilgung = jahresrate - zinsen;
    rest = Math.max(0, rest - tilgung);
    punkte.push({ jahr: j, restschuld: rest });
  }

  const maxY = darlehensbetrag;
  const toX = (j: number) => PAD.left + (j / laufzeit) * (W - PAD.left - PAD.right);
  const toY = (v: number) => PAD.top + (1 - v / maxY) * (H - PAD.top - PAD.bottom);

  const pathD = punkte.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.jahr).toFixed(1)} ${toY(p.restschuld).toFixed(1)}`).join(' ');
  const fillD = pathD + ` L ${toX(laufzeit).toFixed(1)} ${toY(0).toFixed(1)} L ${toX(0).toFixed(1)} ${toY(0).toFixed(1)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ value: darlehensbetrag * f, y: toY(darlehensbetrag * f) }));
  const xTicks: number[] = [];
  for (let j = 0; j <= laufzeit; j += 5) xTicks.push(j);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A5D3F" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0A5D3F" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((t) => (
        <line key={t.value} x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="#F0EDE8" strokeWidth="1" />
      ))}
      <path d={fillD} fill="url(#rGrad)" />
      <path d={pathD} fill="none" stroke="#0A5D3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {yTicks.map((t) => (
        <text key={t.value} x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="#6b6b6b" fontFamily="Manrope, sans-serif">
          {t.value >= 1000 ? `${Math.round(t.value / 1000)}k` : '0'}
        </text>
      ))}
      {xTicks.map((j) => (
        <text key={j} x={toX(j)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize="10" fill="#6b6b6b" fontFamily="Manrope, sans-serif">
          {j === 0 ? 'Start' : `J${j}`}
        </text>
      ))}
      <circle cx={toX(0)} cy={toY(darlehensbetrag)} r="5" fill="#0A3D2C" />
      <circle cx={toX(laufzeit)} cy={toY(punkte[punkte.length - 1].restschuld)} r="5" fill="#D4AF37" />
    </svg>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid #E8E2D9',
      borderRadius: '18px',
      padding: '24px',
      backgroundColor: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <h4 style={{
        fontSize: '11px', fontWeight: 800,
        color: '#0A3D2C', textTransform: 'uppercase',
        letterSpacing: '0.1em', margin: '0 0 18px',
      }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <tr style={{ borderBottom: '1px solid #F0EDE8' }}>
      <td style={{ padding: '8px 4px', fontSize: '12px', color: highlight ? '#0A3D2C' : '#6b6b6b', fontWeight: bold ? 700 : 400 }}>{label}</td>
      <td style={{ padding: '8px 4px', fontSize: '12px', textAlign: 'right', color: highlight ? '#0A3D2C' : '#1a1a1a', fontWeight: bold ? 700 : 500 }}>{value}</td>
    </tr>
  );
}

export default function DetailAuswertung({ ergebnis, form, onLeadTrigger }: Props) {
  const tSatz = form.tilgungssatz ?? 0.02;
  // Tilgungsplan und Chart auf Basis finanzierungsbedarf (korrekte Größe)
  const darlehensbetrag = ergebnis.finanzierungsbedarf > 0 ? ergebnis.finanzierungsbedarf : ergebnis.maxKredit;
  const tilgungsplan = berechneTilgungsplan(darlehensbetrag, ergebnis.zinssatz, form.laufzeit, tSatz);
  const restschuldNachLaufzeit = tilgungsplan[tilgungsplan.length - 1]?.restschuld ?? 0;

  const statusLabels: Record<string, string> = {
    angestellt: 'Angestellt', beamter: 'Beamter / Beamtin',
    selbststaendig: 'Selbstständig', rente: 'Rentner / Rentnerin',
  };
  const verwendungLabels: Record<string, string> = {
    kauf: 'Kauf', neubau: 'Neubau', anschlussfinanzierung: 'Anschlussfinanzierung',
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>

      {/* ── Vollständige Zusammenfassung ── */}
      <DetailCard title="Ergebnis im Überblick">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <SummaryRow label="Produkttyp" value="Baufinanzierung" />
              <SummaryRow label="Bonität" value={ergebnis.bonitaetLabel} bold />
              <SummaryRow label="Zinssatz p.a." value={`${(ergebnis.zinssatz * 100).toFixed(1)} %`} />
              <SummaryRow label="Tilgungssatz p.a." value={`${(tSatz * 100).toFixed(1)} %`} />
              <SummaryRow label="Laufzeit" value={`${form.laufzeit} Jahre`} />
              <SummaryRow label="Max. Kreditrahmen" value={formatEuro(ergebnis.maxKredit)} bold />
              <SummaryRow label="Kaufkraft gesamt" value={formatEuro(ergebnis.kaufkraft)} />
            </tbody>
          </table>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {form.kaufpreis && form.kaufpreis > 0 ? (
                <>
                  <SummaryRow label="Kaufpreis" value={formatEuro(form.kaufpreis)} />
                  <SummaryRow label="Nebenkosten" value={formatEuro(ergebnis.nebenkosten ?? 0)} />
                  <SummaryRow label="Gesamtkaufkosten" value={formatEuro(ergebnis.gesamtkaufkosten ?? 0)} bold />
                  <SummaryRow label="Eigenkapital" value={formatEuro(form.eigenkapital)} />
                  <SummaryRow label="Finanzierungsbedarf" value={formatEuro(ergebnis.finanzierungsbedarf)} bold highlight />
                </>
              ) : (
                <SummaryRow label="Finanzierungsbedarf" value={formatEuro(ergebnis.finanzierungsbedarf)} bold highlight />
              )}
              <SummaryRow label="Monatliche Rate" value={formatEuro(ergebnis.monatsRate)} bold highlight />
              <SummaryRow label={`Restschuld (${form.laufzeit} J.)`} value={formatEuro(restschuldNachLaufzeit)} />
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '11px', color: '#6b6b6b', marginTop: '12px', fontStyle: 'italic' }}>
          Unverbindliche Beispielrechnung — keine Finanzierungszusage einer Bank. Bonität: {ergebnis.bonitaetLabel} (Score {ergebnis.bonitaetScore}).
        </p>
      </DetailCard>

      {/* ── Hypotheken-Szenarien ── */}
      <DetailCard title="Zinsszenarien im Vergleich">
        <div className="grid grid-cols-3 gap-3">
          {SZENARIEN.map((s) => {
            const rate = Math.round(darlehensbetrag * (s.zinssatz + tSatz) / 12);
            const isAktiv = s.label === ergebnis.bonitaetLabel;
            return (
              <div
                key={s.label}
                style={{
                  borderRadius: '12px',
                  border: `${isAktiv ? 2 : 1}px solid ${isAktiv ? s.color : '#E8E2D9'}`,
                  backgroundColor: isAktiv ? s.bg : '#FAFAF8',
                  padding: '14px',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {isAktiv && (
                  <span style={{
                    position: 'absolute', top: '-10px', left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px', fontWeight: 700, color: '#fff',
                    backgroundColor: s.color,
                    padding: '2px 10px', borderRadius: '99px', whiteSpace: 'nowrap',
                  }}>
                    Ihre Bonität
                  </span>
                )}
                <p style={{ fontSize: '12px', fontWeight: 700, color: s.color, margin: '0 0 2px' }}>{s.label}</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0A3D2C', margin: '0 0 1px', letterSpacing: '-0.01em' }}>
                  {(s.zinssatz * 100).toFixed(1)} %
                </p>
                <p style={{ fontSize: '11px', color: '#6b6b6b', margin: '0 0 10px' }}>Zinssatz p.a.</p>
                <div style={{ borderTop: '1px solid #E8E2D9', paddingTop: '10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{formatEuro(rate)}/Mo.</p>
                </div>
              </div>
            );
          })}
        </div>
      </DetailCard>

      {/* ── Gesamtkaufkosten ── */}
      {ergebnis.gesamtkaufkosten && form.kaufpreis && (
        <DetailCard title="Gesamtkaufkosten">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                { label: 'Kaufpreis', value: formatEuro(form.kaufpreis), bold: false },
                { label: `Grunderwerbsteuer (${form.bundesland ?? 'Bayern'})`, value: formatEuro(ergebnis.grunderwerbsteuer ?? 0), bold: false },
                { label: `Maklergebühr (${form.maklergebuehr ?? 0} %)`, value: formatEuro(ergebnis.maklergebuehr ?? 0), bold: false },
                { label: 'Notar & Grundbuch (ca. 2,0 %)', value: formatEuro((ergebnis.nebenkosten ?? 0) - (ergebnis.grunderwerbsteuer ?? 0) - (ergebnis.maklergebuehr ?? 0)), bold: false },
                { label: 'Nebenkosten gesamt', value: formatEuro(ergebnis.nebenkosten ?? 0), bold: true },
              ].map((row) => (
                <tr key={row.label} style={{ borderBottom: '1px solid #F0EDE8' }}>
                  <td style={{ padding: '9px 4px', fontSize: '13px', color: row.bold ? '#0A3D2C' : '#6b6b6b', fontWeight: row.bold ? 700 : 400 }}>{row.label}</td>
                  <td style={{ padding: '9px 4px', fontSize: '13px', textAlign: 'right', color: row.bold ? '#0A3D2C' : '#1a1a1a', fontWeight: row.bold ? 700 : 500 }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#0A3D2C', borderRadius: '8px' }}>
                <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 800, color: '#fff', borderRadius: '8px 0 0 8px' }}>Gesamtkosten</td>
                <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 800, color: '#D4AF37', textAlign: 'right', borderRadius: '0 8px 8px 0' }}>
                  {formatEuro(ergebnis.gesamtkaufkosten)}
                </td>
              </tr>
            </tfoot>
          </table>
        </DetailCard>
      )}

      {/* ── Restschuld-Chart (auf Basis finanzierungsbedarf) ── */}
      <DetailCard title="Restschuld-Verlauf">
        <p style={{ fontSize: '12px', color: '#6b6b6b', margin: '-8px 0 14px' }}>
          Entwicklung über {form.laufzeit} Jahre bei {(ergebnis.zinssatz * 100).toFixed(1)} % Zinssatz · {(tSatz * 100).toFixed(1)} % Tilgung
          {form.kaufpreis && ergebnis.finanzierungsbedarf !== ergebnis.maxKredit && (
            <> · Basis: Finanzierungsbedarf {formatEuro(ergebnis.finanzierungsbedarf)}</>
          )}
        </p>
        <RestschuldChart
          darlehensbetrag={darlehensbetrag}
          zinssatz={ergebnis.zinssatz}
          laufzeit={form.laufzeit}
          tilgungssatz={tSatz}
        />
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0A3D2C', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#6b6b6b' }}>Start: {formatEuro(darlehensbetrag)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D4AF37', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#6b6b6b' }}>
              Nach {form.laufzeit} J.: {formatEuro(restschuldNachLaufzeit)}
            </span>
          </div>
        </div>
      </DetailCard>

      {/* ── Tilgungsplan (auf Basis finanzierungsbedarf) ── */}
      <DetailCard title="Jahres-Tilgungsplan">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F7F5F0' }}>
                {['Jahr', 'Restschuld', 'Gez. Zinsen', 'Gez. Tilgung'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 12px',
                      fontSize: '11px', fontWeight: 700,
                      color: '#0A3D2C',
                      textAlign: i === 0 ? 'left' : 'right',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      borderRadius: i === 0 ? '8px 0 0 0' : i === 3 ? '0 8px 0 0' : undefined,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tilgungsplan.map((punkt, i) => (
                <tr
                  key={punkt.jahr}
                  style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAF8', borderBottom: '1px solid #F0EDE8' }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0A3D2C' }}>{punkt.jahr}. Jahr</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>{formatEuro(punkt.restschuld)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#6b6b6b' }}>{formatEuro(punkt.gezahlteZinsen)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#6b6b6b' }}>{formatEuro(punkt.gezahltesTilgung)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DetailCard>

      {/* ── CTA ── */}
      <div style={{
        border: '2px solid rgba(212,175,55,0.4)',
        borderRadius: '18px',
        padding: '24px',
        backgroundColor: 'rgba(212,175,55,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{ fontWeight: 700, color: '#0A3D2C', fontSize: '15px', margin: '0 0 4px' }}>
            Vollständige Auswertung als PDF
          </p>
          <p style={{ fontSize: '13px', color: '#6b6b6b', margin: 0 }}>
            Mit Tilgungsplan, Szenarien und persönlicher Einschätzung — kostenlos per E-Mail.
          </p>
        </div>
        <button
          onClick={onLeadTrigger}
          style={{
            height: '44px',
            padding: '0 24px',
            backgroundColor: '#D4AF37',
            color: '#0A3D2C',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'transform 0.1s ease, opacity 0.1s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          PDF per E-Mail erhalten
        </button>
      </div>
    </div>
  );
}
