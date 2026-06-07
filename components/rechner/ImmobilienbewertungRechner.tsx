'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GRUNDERWERBSTEUER } from '@/lib/berechnung';
import { useT, useLanguage } from '@/lib/language-context';
import { parseOptionalNumberInput, formatNumberInput } from '@/lib/utils';
import ButtonLoader from '@/components/ui/loader';
import type {
  BewertungEingaben,
  ObjektArt,
  ObjektZustand,
  ObjektAusstattung,
  BewertungAnlass,
  BewertungExtra,
} from '@/types';

const BUNDESLAENDER = Object.keys(GRUNDERWERBSTEUER).sort();
const TOTAL_STEPS = 6;

// ── Input-Styles (identisch zu Privatkredit-/Baufinanzierungsrechner) ──
const IS: React.CSSProperties = {
  height: '44px',
  border: '1.5px solid transparent',
  borderRadius: '10px',
  padding: '0 14px',
  backgroundColor: 'rgba(118,118,128,0.09)',
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
  e.currentTarget.style.backgroundColor = 'rgba(10,61,44,0.05)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10,61,44,0.10)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'transparent';
  e.currentTarget.style.backgroundColor = 'rgba(118,118,128,0.09)';
  e.currentTarget.style.boxShadow = 'none';
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

// Auswahl-Button im Stil der Kreditnehmer-Buttons (Privatkredit)
function OptionButton({ active, label, sub, onClick }: {
  active: boolean; label: string; sub?: string; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      style={{
        minHeight: '56px',
        border: `1.5px solid ${active ? '#0A5D3F' : '#E8E2D9'}`,
        borderRadius: '10px',
        backgroundColor: active ? '#0A3D2C' : '#F7F5F0',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '2px', padding: '8px 10px',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      <span style={{ fontSize: '13px', fontWeight: 700, color: active ? '#fff' : '#1a1a1a', lineHeight: 1.25, textAlign: 'center' }}>{label}</span>
      {sub && <span style={{ fontSize: '10px', color: active ? 'rgba(255,255,255,0.6)' : '#6b6b6b', lineHeight: 1.2, textAlign: 'center' }}>{sub}</span>}
    </button>
  );
}

const DEFAULT: BewertungEingaben = {
  objektart: 'wohnung',
  plz: '',
  ort: '',
  bundesland: 'Baden-Württemberg',
  extras: [],
};

export default function ImmobilienbewertungRechner() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BewertungEingaben>(DEFAULT);
  const [kontakt, setKontakt] = useState({ vorname: '', nachname: '', email: '', telefon: '' });
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const t = useT();
  const { lang } = useLanguage();

  const update = <K extends keyof BewertungEingaben>(key: K, value: BewertungEingaben[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const toggleExtra = (extra: BewertungExtra) => {
    setForm((prev) => ({
      ...prev,
      extras: prev.extras?.includes(extra)
        ? prev.extras.filter((x) => x !== extra)
        : [...(prev.extras ?? []), extra],
    }));
  };

  const istGrundstueck = form.objektart === 'grundstueck';
  const istHaus = form.objektart === 'einfamilienhaus' || form.objektart === 'mehrfamilienhaus';

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kontakt.email);
  const phoneValid = /[0-9]/.test(kontakt.telefon) && kontakt.telefon.replace(/\D/g, '').length >= 6;

  // ── Validierung pro Schritt ──
  const validateStep = (): string => {
    const jahr = new Date().getFullYear();
    switch (step) {
      case 2:
        if (!/^\d{5}$/.test(form.plz.trim())) return t('bwErrorPlz');
        return '';
      case 3:
        if (istGrundstueck) {
          if (!form.grundstuecksflaeche || form.grundstuecksflaeche <= 0) return t('bwErrorGrundstueck');
          return '';
        }
        if (!form.wohnflaeche || form.wohnflaeche <= 0) return t('bwErrorWohnflaeche');
        if (!form.baujahr || form.baujahr < 1800 || form.baujahr > jahr) return t('bwErrorBaujahr');
        if (istHaus && (!form.grundstuecksflaeche || form.grundstuecksflaeche <= 0)) return t('bwErrorGrundstueck');
        return '';
      case 6:
        if (!kontakt.vorname.trim() || !kontakt.nachname.trim() || !emailValid || !phoneValid) return t('bwErrorKontakt');
        if (!consent) return t('bwErrorConsent');
        return '';
      default:
        return '';
    }
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    // Grundstück: Schritt 4 (Zustand & Ausstattung) überspringen
    if (step === 3 && istGrundstueck) { setStep(5); return; }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const back = () => {
    setError('');
    if (step === 5 && istGrundstueck) { setStep(3); return; }
    setStep((s) => Math.max(1, s - 1));
  };

  const submit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bewertung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...kontakt,
          telefon: kontakt.telefon.trim(),
          lang,
          eingaben: form,
          consents: { datenschutz: consent },
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error ?? t('errorOccurred'));
      }
    } catch {
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  // ── Erfolgsansicht — KEIN Ergebnis auf der Seite ──
  if (success) {
    return (
      <div className="fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#0A3D2C', borderRadius: '20px', padding: '56px 32px',
          textAlign: 'center', boxShadow: '0 20px 60px rgba(10,61,44,0.3)',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            backgroundColor: 'rgba(212,175,55,0.15)', border: '2px solid #D4AF37',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          }}>
            <svg width="34" height="34" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, color: '#fff', lineHeight: 1.35, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            {t('bwSuccessTitle')}
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
            {t('bwSuccessSub')}
          </p>
        </div>
      </div>
    );
  }

  const stepTitles: Record<number, { title: string; subtitle: string }> = {
    1: { title: t('bwStepObjektart'), subtitle: t('bwStepObjektartSub') },
    2: { title: t('bwStepLage'), subtitle: t('bwStepLageSub') },
    3: { title: t('bwStepEckdaten'), subtitle: t('bwStepEckdatenSub') },
    4: { title: t('bwStepZustand'), subtitle: t('bwStepZustandSub') },
    5: { title: t('bwStepAnlass'), subtitle: t('bwStepAnlassSub') },
    6: { title: t('bwStepKontakt'), subtitle: t('bwStepKontaktSub') },
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ border: '1px solid #E8E2D9', borderRadius: '18px', padding: '28px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        {/* ── Progress ── */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('bwStepOf', { current: String(step), total: String(TOTAL_STEPS) })}
            </span>
          </div>
          <div style={{ height: '4px', backgroundColor: '#F0EDE8', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, backgroundColor: '#D4AF37', borderRadius: '2px', transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }} />
          </div>
        </div>

        {/* ── Step Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '22px' }}>
          <span style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#0A3D2C', color: '#D4AF37', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, letterSpacing: '0.04em' }}>
            {String(step).padStart(2, '0')}
          </span>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0A3D2C', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{stepTitles[step].title}</p>
            <p style={{ fontSize: '12px', color: '#6b6b6b', margin: '2px 0 0', fontWeight: 400 }}>{stepTitles[step].subtitle}</p>
          </div>
        </div>

        {/* ── Schritt 1: Objektart ── */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {([
              { value: 'wohnung', label: t('bwWohnung') },
              { value: 'einfamilienhaus', label: t('bwEinfamilienhaus') },
              { value: 'mehrfamilienhaus', label: t('bwMehrfamilienhaus') },
              { value: 'grundstueck', label: t('bwGrundstueck') },
            ] as { value: ObjektArt; label: string }[]).map((opt) => (
              <OptionButton key={opt.value} active={form.objektart === opt.value} label={opt.label}
                onClick={() => update('objektart', opt.value)} />
            ))}
          </div>
        )}

        {/* ── Schritt 2: Lage ── */}
        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>{t('bwPlz')}</FieldLabel>
              <input type="text" inputMode="numeric" maxLength={5} value={form.plz}
                onChange={(e) => update('plz', e.target.value.replace(/\D/g, ''))}
                placeholder="70173" style={IS} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <FieldLabel>{t('bwOrt')}</FieldLabel>
              <input type="text" value={form.ort ?? ''} onChange={(e) => update('ort', e.target.value)}
                placeholder="Stuttgart" style={IS} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel required>{t('federalState')}</FieldLabel>
              <SelectWrapper>
                <select value={form.bundesland} onChange={(e) => update('bundesland', e.target.value)}
                  style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                  {BUNDESLAENDER.map((bl) => <option key={bl} value={bl}>{bl}</option>)}
                </select>
              </SelectWrapper>
            </div>
          </div>
        )}

        {/* ── Schritt 3: Eckdaten ── */}
        {step === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!istGrundstueck && (
              <>
                <div>
                  <FieldLabel required>{t('bwWohnflaeche')}</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <input type="text" inputMode="numeric" value={formatNumberInput(form.wohnflaeche)}
                      onChange={(e) => update('wohnflaeche', parseOptionalNumberInput(e.target.value))}
                      placeholder="z.B. 85" style={{ ...IS, paddingRight: '44px' }} onFocus={onFocus} onBlur={onBlur} />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#6b6b6b', fontWeight: 600, pointerEvents: 'none' }}>m²</span>
                  </div>
                </div>
                <div>
                  <FieldLabel>{t('bwZimmer')}</FieldLabel>
                  <SelectWrapper>
                    <select value={form.zimmer ?? 3} onChange={(e) => update('zimmer', Number(e.target.value))}
                      style={{ ...IS, paddingRight: '36px' }} onFocus={onFocus} onBlur={onBlur}>
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>{String(n).replace('.', ',')}{n === 8 ? '+' : ''}</option>
                      ))}
                    </select>
                  </SelectWrapper>
                </div>
                <div>
                  <FieldLabel required>{t('bwBaujahr')}</FieldLabel>
                  <input type="text" inputMode="numeric" maxLength={4}
                    value={form.baujahr ? String(form.baujahr) : ''}
                    onChange={(e) => update('baujahr', parseOptionalNumberInput(e.target.value))}
                    placeholder="z.B. 1995" style={IS} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </>
            )}
            {(istHaus || istGrundstueck) && (
              <div className={istGrundstueck ? 'sm:col-span-2' : undefined}>
                <FieldLabel required>{t('bwGrundstuecksflaeche')}</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <input type="text" inputMode="numeric" value={formatNumberInput(form.grundstuecksflaeche)}
                    onChange={(e) => update('grundstuecksflaeche', parseOptionalNumberInput(e.target.value))}
                    placeholder="z.B. 450" style={{ ...IS, paddingRight: '44px' }} onFocus={onFocus} onBlur={onBlur} />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#6b6b6b', fontWeight: 600, pointerEvents: 'none' }}>m²</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Schritt 4: Zustand & Ausstattung ── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <FieldLabel required>{t('bwZustand')}</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {([
                  { value: 'neuwertig', label: t('bwNeuwertig') },
                  { value: 'gepflegt', label: t('bwGepflegt') },
                  { value: 'renovierungsbeduerftig', label: t('bwRenovierungsbeduerftig') },
                ] as { value: ObjektZustand; label: string }[]).map((opt) => (
                  <OptionButton key={opt.value} active={form.zustand === opt.value} label={opt.label}
                    onClick={() => update('zustand', opt.value)} />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel required>{t('bwAusstattung')}</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {([
                  { value: 'einfach', label: t('bwEinfach') },
                  { value: 'standard', label: t('bwStandard') },
                  { value: 'gehoben', label: t('bwGehoben') },
                ] as { value: ObjektAusstattung; label: string }[]).map((opt) => (
                  <OptionButton key={opt.value} active={form.ausstattung === opt.value} label={opt.label}
                    onClick={() => update('ausstattung', opt.value)} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>{t('bwModernisierungsjahr')} <span style={{ textTransform: 'none', fontWeight: 400, color: '#6b6b6b' }}>{t('optional')}</span></FieldLabel>
                <input type="text" inputMode="numeric" maxLength={4}
                  value={form.modernisierungsjahr ? String(form.modernisierungsjahr) : ''}
                  onChange={(e) => update('modernisierungsjahr', parseOptionalNumberInput(e.target.value))}
                  placeholder="z.B. 2018" style={IS} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <div>
              <FieldLabel>{t('bwExtras')}</FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {([
                  { value: 'balkon', label: t('bwBalkon') },
                  { value: 'garten', label: t('bwGarten') },
                  { value: 'garage', label: t('bwGarage') },
                  { value: 'keller', label: t('bwKeller') },
                  { value: 'aufzug', label: t('bwAufzug') },
                ] as { value: BewertungExtra; label: string }[]).map((opt) => {
                  const active = form.extras?.includes(opt.value) ?? false;
                  return (
                    <button key={opt.value} type="button" onClick={() => toggleExtra(opt.value)}
                      style={{
                        height: '44px', border: `1.5px solid ${active ? '#0A5D3F' : '#E8E2D9'}`,
                        borderRadius: '10px', backgroundColor: active ? '#0A3D2C' : '#F7F5F0',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'border-color 0.15s, background-color 0.15s', padding: '0 8px',
                      }}>
                      {active && (
                        <svg width="12" height="12" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span style={{ fontSize: '12px', fontWeight: 600, color: active ? '#fff' : '#1a1a1a', lineHeight: 1.2 }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Schritt 5: Anlass (optional) ── */}
        {step === 5 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {([
              { value: 'verkauf', label: t('bwVerkauf') },
              { value: 'kauf', label: t('bwKauf') },
              { value: 'anschlussfinanzierung', label: t('bwAnschluss') },
              { value: 'interesse', label: t('bwNurInteresse') },
            ] as { value: BewertungAnlass; label: string }[]).map((opt) => (
              <OptionButton key={opt.value} active={form.anlass === opt.value} label={opt.label}
                onClick={() => update('anlass', form.anlass === opt.value ? undefined : opt.value)} />
            ))}
          </div>
        )}

        {/* ── Schritt 6: Kontaktdaten (Pflicht-Gate) ── */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>{t('firstName')}</FieldLabel>
                <input type="text" value={kontakt.vorname} onChange={(e) => setKontakt({ ...kontakt, vorname: e.target.value })}
                  placeholder="Max" style={IS} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <FieldLabel required>{t('lastName')}</FieldLabel>
                <input type="text" value={kontakt.nachname} onChange={(e) => setKontakt({ ...kontakt, nachname: e.target.value })}
                  placeholder="Mustermann" style={IS} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <FieldLabel required>{t('phoneNumber')}</FieldLabel>
                <input type="tel" value={kontakt.telefon} onChange={(e) => setKontakt({ ...kontakt, telefon: e.target.value })}
                  placeholder="+49 123 456789" style={IS} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <FieldLabel required>{t('emailAddress')}</FieldLabel>
                <input type="email" value={kontakt.email} onChange={(e) => setKontakt({ ...kontakt, email: e.target.value })}
                  placeholder="max@example.de" style={IS} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            {/* Honeypot — für Menschen unsichtbar, Bots füllen es aus */}
            <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
              <label>
                Website
                <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </label>
            </div>

            {/* DSGVO-Consent */}
            <label className="flex gap-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded" style={{ accentColor: '#0A3D2C' }} />
              <span style={{ fontSize: '12px', lineHeight: 1.6, color: '#444' }}>
                {t('bwConsent').split(t('privacyPolicyLinkText')).map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <Link href={lang === 'ro' ? '/romania/datenschutz' : '/datenschutz'} target="_blank" style={{ color: '#0A3D2C', textDecoration: 'underline' }}>
                        {t('privacyPolicyLinkText')}
                      </Link>
                    </span>
                  ) : part
                )}
              </span>
            </label>
          </div>
        )}

        {/* ── Fehler ── */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', marginTop: '20px' }}>
            <p style={{ fontSize: '13px', color: '#991b1b', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Navigation ── */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {step > 1 && (
            <button type="button" onClick={back}
              style={{
                height: '48px', padding: '0 20px', borderRadius: '10px',
                border: '1.5px solid #E8E2D9', backgroundColor: '#fff', color: '#6b6b6b',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
              }}>
              {t('bwBack')}
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button type="button" onClick={next} className="btn-gold"
              style={{
                flex: 1, height: '48px', backgroundColor: '#0A3D2C', color: '#fff',
                border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.02em',
              }}>
              {t('bwNext')}
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={loading} className="btn-gold"
              style={{
                flex: 1, height: '48px',
                backgroundColor: loading ? '#E8E2D9' : '#D4AF37',
                color: loading ? '#6b6b6b' : '#0A3D2C',
                border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              }}>
              {loading && <ButtonLoader />}
              {loading ? t('processing') : t('bwSubmit')}
            </button>
          )}
        </div>

        {step === 6 && (
          <p style={{ fontSize: '11px', textAlign: 'center', color: '#6b6b6b', margin: '14px 0 0', lineHeight: 1.5 }}>
            {t('dataProtectionInfo')}
          </p>
        )}
      </div>
    </div>
  );
}
