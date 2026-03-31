'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import BaufinanzierungRechner from '@/components/rechner/BaufinanzierungRechner';
import PrivatkreditRechner from '@/components/rechner/PrivatkreditRechner';
import LeadModal from '@/components/rechner/LeadModal';
import type {
  BaufinanzierungEingaben,
  BaufinanzierungErgebnis,
  PrivatkreditEingaben,
  PrivatkreditErgebnis,
  RechnerTyp,
} from '@/types';

type ModalPayload = {
  typ: RechnerTyp;
  eingaben: BaufinanzierungEingaben | PrivatkreditEingaben;
  ergebnis: BaufinanzierungErgebnis | PrivatkreditErgebnis;
};

const BENTO = [
  {
    id: 'banken',
    eyebrow: 'Netzwerk',
    title: '400+',
    subtitle: 'Banken & Kreditgeber',
    text: 'Wir vergleichen Angebote von über 400 Partnern — für die besten Konditionen, nicht das nächstbeste.',
    dark: true,
    wide: true,
  },
  {
    id: 'ihk',
    eyebrow: 'Zertifiziert',
    title: '§ 34i',
    subtitle: 'GewO · IHK Stuttgart',
    text: 'Staatlich zugelassener Finanzierungsvermittler mit Erlaubnis nach §34c & §34i GewO.',
    dark: false,
    wide: false,
  },
  {
    id: 'erfahrung',
    eyebrow: 'Expertise',
    title: '10+',
    subtitle: 'Jahre Erfahrung',
    text: 'Alperen Akbal und sein Team begleiten Kunden seit über einem Jahrzehnt bei Finanzierungsentscheidungen.',
    dark: false,
    wide: false,
  },
  {
    id: 'kostenlos',
    eyebrow: 'Für Sie',
    title: '100 %',
    subtitle: 'Kostenlos & unverbindlich',
    text: 'Beratung, Rechner und Auswertung sind für Sie vollständig kostenlos. Wir vergüten uns durch Partnerprovisionen.',
    dark: true,
    wide: true,
  },
];

const FAQ = [
  {
    frage: 'Wie genau ist die Ersteinschätzung?',
    antwort: 'Die Ersteinschätzung basiert auf den Bankfaustregeln und gibt Ihnen eine realistische Orientierung. Die tatsächlichen Konditionen können je nach Bank, persönlicher Situation und aktueller Zinslage abweichen.',
  },
  {
    frage: 'Was passiert nach meiner Anfrage?',
    antwort: 'Sie erhalten sofort Ihre persönliche Auswertung per E-Mail als PDF. Unser Team bei Akrona GmbH prüft Ihre Anfrage und meldet sich bei Interesse für ein unverbindliches Beratungsgespräch.',
  },
  {
    frage: 'Werden meine Daten weitergegeben?',
    antwort: 'Nein. Ihre Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und nicht an Dritte weitergegeben. Die Speicherung erfolgt gemäß DSGVO auf EU-Servern.',
  },
  {
    frage: 'Was ist der Unterschied zwischen Bonität „Sehr gut" und „Basis"?',
    antwort: 'Die Bonität beeinflusst den Zinssatz: Bei „Sehr gut" (3,6 %) zahlen Sie weniger Zinsen als bei „Basis" (4,8 %). Faktoren wie Beschäftigung, Eigenkapital und Haushaltsgröße fließen in die Bewertung ein.',
  },
  {
    frage: 'Was sind Kaufnebenkosten?',
    antwort: 'Zu den Kaufnebenkosten zählen die Grunderwerbsteuer (je nach Bundesland 3,5–6,5 %), Notar- und Grundbuchkosten (ca. 2,0 %) sowie ggf. eine Maklergebühr.',
  },
  {
    frage: 'Ist die Beratung wirklich kostenlos?',
    antwort: 'Ja. Die Nutzung des Rechners und die Ersteinschätzung sind vollständig kostenlos und unverbindlich. Akrona GmbH verdient durch Provisionen der Finanzierungspartner.',
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<RechnerTyp>('baufinanzierung');
  const [modalPayload, setModalPayload] = useState<ModalPayload | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLeadTrigger = (
    typ: RechnerTyp,
    ergebnis: BaufinanzierungErgebnis | PrivatkreditErgebnis,
    eingaben: BaufinanzierungEingaben | PrivatkreditEingaben
  ) => {
    setModalPayload({ typ, ergebnis, eingaben });
  };

  return (
    <>
      <Header />

      <main>

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <section
          style={{
            paddingTop: '72px',
            backgroundColor: '#fff',
            overflow: 'hidden',
            minHeight: 'min(100vh, 760px)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '3fr 2fr',
              alignItems: 'stretch',
              minHeight: 'min(calc(100vh - 72px), 688px)',
            }}
          >
            {/* ── Text-Seite ── */}
            <div
              style={{
                padding: '72px 64px 72px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {/* Eyebrow */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '99px',
                  backgroundColor: 'rgba(10,61,44,0.06)',
                  border: '1px solid rgba(10,61,44,0.12)',
                  marginBottom: '28px',
                  width: 'fit-content',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0A5D3F' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0A3D2C', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Kostenlos & unverbindlich
                </span>
              </div>

              {/* H1 */}
              <h1
                style={{
                  fontSize: 'clamp(38px, 4.5vw, 60px)',
                  fontWeight: 800,
                  color: '#0A3D2C',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  margin: '0 0 20px',
                  maxWidth: '580px',
                }}
              >
                Wie viel{' '}
                <span style={{ color: '#D4AF37' }}>Finanzierung</span>
                {' '}ist für Sie möglich?
              </h1>

              {/* Subtext */}
              <p
                style={{
                  fontSize: '17px',
                  fontWeight: 400,
                  color: '#444',
                  maxWidth: '480px',
                  lineHeight: 1.7,
                  margin: '0 0 36px',
                }}
              >
                Ermitteln Sie Ihre persönliche Finanzierungsmöglichkeit in wenigen Sekunden —
                realistisch, transparent und ohne Banktermin.
              </p>

              {/* CTA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
                <a
                  href="#rechner"
                  style={{
                    height: '52px',
                    padding: '0 32px',
                    backgroundColor: '#0A3D2C',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    letterSpacing: '0.02em',
                    transition: 'transform 0.1s ease, opacity 0.1s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Jetzt berechnen
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
                <p style={{ fontSize: '13px', color: '#6b6b6b', margin: 0 }}>
                  Sofortergebnis · Kein Termin nötig
                </p>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  { icon: '🏦', label: '400+ Banken' },
                  { icon: '🔒', label: 'SSL-gesichert' },
                  { icon: '✓', label: 'IHK Stuttgart' },
                ].map((b) => (
                  <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>{b.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0A3D2C' }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bild-Seite: border-radius 100px links ── */}
            <div style={{ position: 'relative', minHeight: '500px' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: '24px 0 24px 0',
                  borderTopLeftRadius: '100px',
                  borderBottomLeftRadius: '100px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src="/hero-bg.jpg"
                  alt="Moderne Immobilie"
                  fill
                  priority
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(10,61,44,0.25) 0%, transparent 50%)',
                  }}
                />
                {/* Float Card */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '32px',
                    left: '32px',
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                  }}
                >
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Ø Finanzierungsrahmen</p>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#0A3D2C', margin: 0, letterSpacing: '-0.02em' }}>320.000 €</p>
                  <p style={{ fontSize: '11px', color: '#6b6b6b', margin: '2px 0 0' }}>bei 3.500 € Nettoeinkommen</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            RECHNER
        ══════════════════════════════════════════════════ */}
        <section
          id="rechner"
          style={{
            padding: '80px 0 96px',
            backgroundColor: '#F7F5F0',
            borderTop: '1px solid #E8E2D9',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

            {/* Section Header */}
            <div style={{ marginBottom: '40px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                Finanzierungsrechner
              </span>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#0A3D2C', lineHeight: 1.15, letterSpacing: '-0.025em', margin: '8px 0 0' }}>
                Ihren Kreditrahmen berechnen
              </h2>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'inline-flex',
                gap: '4px',
                marginBottom: '32px',
                backgroundColor: '#fff',
                border: '1px solid #E8E2D9',
                borderRadius: '12px',
                padding: '4px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {(['baufinanzierung', 'privatkredit'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '9px 24px',
                    border: 'none',
                    borderRadius: '9px',
                    backgroundColor: activeTab === tab ? '#0A3D2C' : 'transparent',
                    color: activeTab === tab ? '#fff' : '#6b6b6b',
                    fontSize: '13px',
                    fontWeight: activeTab === tab ? 700 : 500,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s, color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab === 'baufinanzierung' ? 'Baufinanzierung' : 'Privatkredit'}
                </button>
              ))}
            </div>

            {/* Rechner */}
            {activeTab === 'baufinanzierung' ? (
              <BaufinanzierungRechner
                onLeadTrigger={(ergebnis, eingaben) =>
                  handleLeadTrigger('baufinanzierung', ergebnis, eingaben)
                }
              />
            ) : (
              <PrivatkreditRechner
                onLeadTrigger={(ergebnis, eingaben) =>
                  handleLeadTrigger('privatkredit', ergebnis, eingaben)
                }
              />
            )}

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b6b6b', marginTop: '20px' }}>
              Unverbindliche Ersteinschätzung — keine Bankzusage. Alle Angaben ohne Gewähr.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            BENTO GRID
        ══════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 0', backgroundColor: '#fff', borderTop: '1px solid #E8E2D9' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

            <div style={{ marginBottom: '48px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                Warum Akrona
              </span>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#0A3D2C', lineHeight: 1.15, letterSpacing: '-0.025em', margin: '8px 0 0' }}>
                Ihr Vorteil bei uns
              </h2>
            </div>

            {/* Grid: 2 Reihen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: '16px' }}>

              {/* Karte 1: breit (2 Spalten) */}
              <div
                style={{
                  gridColumn: 'span 2',
                  borderRadius: '20px',
                  padding: '40px',
                  backgroundColor: '#0A3D2C',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '220px',
                }}
              >
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.08)', pointerEvents: 'none' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(212,175,55,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Netzwerk</span>
                <p style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, color: '#D4AF37', lineHeight: 1, letterSpacing: '-0.03em', margin: 0 }}>400+</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>Banken & Kreditgeber</p>
                <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0, maxWidth: '360px' }}>
                  Wir vergleichen Angebote von über 400 Partnern — für die besten Konditionen, nicht das nächstbeste Angebot Ihrer Hausbank.
                </p>
              </div>

              {/* Karte 2: schmal */}
              <div
                style={{
                  borderRadius: '20px',
                  padding: '32px',
                  backgroundColor: '#F7F5F0',
                  border: '1px solid #E8E2D9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  minHeight: '220px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Zertifiziert</span>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#0A3D2C', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>§ 34i<br />GewO</p>
                <p style={{ fontSize: '13px', fontWeight: 400, color: '#6b6b6b', lineHeight: 1.6, margin: 0 }}>
                  Staatlich zugelassener Vermittler · IHK Region Stuttgart
                </p>
              </div>

              {/* Karte 3: schmal */}
              <div
                style={{
                  borderRadius: '20px',
                  padding: '32px',
                  backgroundColor: '#F7F5F0',
                  border: '1px solid #E8E2D9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  minHeight: '200px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Expertise</span>
                <p style={{ fontSize: '40px', fontWeight: 800, color: '#0A3D2C', lineHeight: 1, letterSpacing: '-0.03em', margin: 0 }}>10+</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0A3D2C', margin: '0 0 4px' }}>Jahre Erfahrung</p>
                <p style={{ fontSize: '13px', fontWeight: 400, color: '#6b6b6b', lineHeight: 1.6, margin: 0 }}>
                  Alperen Akbal und sein Team begleiten Kunden seit über einem Jahrzehnt.
                </p>
              </div>

              {/* Karte 4: breit (2 Spalten) */}
              <div
                style={{
                  gridColumn: 'span 2',
                  borderRadius: '20px',
                  padding: '40px',
                  backgroundColor: '#0A3D2C',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '40px',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '200px',
                }}
              >
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.06)', pointerEvents: 'none' }} />
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(212,175,55,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block', marginBottom: '10px' }}>Für Sie</span>
                  <p style={{ fontSize: '36px', fontWeight: 800, color: '#D4AF37', lineHeight: 1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>100 %</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>Kostenlos & unverbindlich</p>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0, maxWidth: '340px' }}>
                  Beratung, Rechner und Auswertung sind für Sie vollständig kostenlos. Wir vergüten uns durch Provisionen der Finanzierungspartner — ohne Aufpreis für Sie.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 0', backgroundColor: '#F7F5F0', borderTop: '1px solid #E8E2D9' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                FAQ
              </span>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#0A3D2C', lineHeight: 1.15, letterSpacing: '-0.025em', margin: '8px 0 0' }}>
                Häufige Fragen
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: openFaq === i ? '#0A3D2C' : '#E8E2D9',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 22px',
                      textAlign: 'left',
                      backgroundColor: openFaq === i ? '#fff' : '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      gap: '16px',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '15px', color: '#0A3D2C', lineHeight: 1.4 }}>
                      {item.frage}
                    </span>
                    <svg
                      width="18" height="18"
                      fill="none" stroke="#0A3D2C" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{
                        flexShrink: 0,
                        transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {openFaq === i && (
                    <div style={{ padding: '0 22px 18px', backgroundColor: '#fff' }}>
                      <p style={{ fontSize: '14px', fontWeight: 400, color: '#444', lineHeight: 1.75, margin: 0 }}>
                        {item.antwort}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════════ */}
        <section style={{ backgroundColor: '#0A3D2C', padding: '80px 0' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(212,175,55,0.75)', textTransform: 'uppercase', letterSpacing: '0.18em', display: 'block', marginBottom: '16px' }}>
              Persönliche Beratung
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.025em' }}>
              Ihr Finanzierungsexperte in Stuttgart
            </h2>
            <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', maxWidth: '440px', margin: '0 auto 36px', lineHeight: 1.7 }}>
              Alperen Akbal und das Akrona-Team stehen Ihnen für ein unverbindliches Beratungsgespräch zur Verfügung.
            </p>
            <a
              href="mailto:info@akrona-gmbh.de"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                height: '52px', padding: '0 36px',
                backgroundColor: '#D4AF37', color: '#0A3D2C',
                borderRadius: '12px', fontSize: '15px', fontWeight: 700,
                textDecoration: 'none', letterSpacing: '0.02em',
                transition: 'transform 0.1s ease, opacity 0.1s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Jetzt Kontakt aufnehmen
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </section>

      </main>

      <Footer />

      <LeadModal
        isOpen={!!modalPayload}
        onClose={() => setModalPayload(null)}
        payload={modalPayload}
      />
    </>
  );
}
