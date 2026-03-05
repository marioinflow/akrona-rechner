'use client';

import { useState } from 'react';
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

const INFO_KARTEN = [
  {
    nr: '01',
    label: 'Grundwissen',
    titel: 'Bankfaustregel erklärt',
    text: 'Als Faustregel gilt: Nettoeinkommen × 100 = max. Kreditrahmen. Faktoren wie Eigenkapital, Beschäftigung und Haushalt beeinflussen den Zinssatz.',
  },
  {
    nr: '02',
    label: 'Bonität',
    titel: 'Was ist Bonität?',
    text: 'Ihre Bonität beeinflusst direkt den Zinssatz. Beamte und Angestellte erhalten bessere Konditionen als Selbstständige.',
  },
  {
    nr: '03',
    label: 'Hinweis',
    titel: 'Ersteinschätzung vs. Zusage',
    text: 'Dieser Rechner gibt eine realistische Orientierung — keine Bankzusage. Für verbindliche Angebote steht Ihnen unser Team persönlich zur Verfügung.',
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
    antwort: 'Zu den Kaufnebenkosten zählen die Grunderwerbsteuer (je nach Bundesland 3,5–6,5 %), Notar- und Grundbuchkosten (ca. 1,5 %) sowie ggf. eine Maklergebühr.',
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
        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#0A3D2C',
            backgroundImage: 'url(/hero-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            paddingTop: '70px',
          }}
        >
          {/* Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(110deg, rgba(10,61,44,0.93) 0%, rgba(10,61,44,0.83) 55%, rgba(10,93,63,0.68) 100%)',
            zIndex: 1,
          }} />

          <div className="relative max-w-6xl mx-auto px-6 py-24" style={{ zIndex: 2 }}>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <span style={{ display: 'block', width: '28px', height: '1px', backgroundColor: '#D4AF37', opacity: 0.7 }} />
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                Ersteinschätzung · Kostenlos & unverbindlich
              </span>
            </div>

            {/* H1 */}
            <h1 style={{
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 600,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '20px',
              maxWidth: '640px',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 24px rgba(0,0,0,0.45), 0 1px 6px rgba(0,0,0,0.3)',
            }}>
              Wie viel{' '}
              <em style={{ fontStyle: 'normal', color: '#D4AF37', textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}>
                Finanzierung
              </em>{' '}
              ist für Sie möglich?
            </h1>

            {/* Sub */}
            <p style={{
              fontSize: '16px',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.75)',
              maxWidth: '460px',
              lineHeight: 1.7,
              marginBottom: '40px',
              textShadow: '0 1px 10px rgba(0,0,0,0.4)',
            }}>
              Ermitteln Sie Ihre persönliche Finanzierungsmöglichkeit in wenigen Sekunden — kostenlos und unverbindlich.
            </p>

            {/* CTA Button */}
            <a
              href="#rechner"
              className="inline-flex items-center gap-3 transition-all duration-200"
              style={{
                backgroundColor: '#D4AF37',
                color: '#0A3D2C',
                padding: '14px 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                letterSpacing: '0.03em',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#c9a430';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.02)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 24px rgba(212,175,55,0.35)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#D4AF37';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
              }}
            >
              Jetzt Finanzierung berechnen
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </section>

        {/* ══════════════════════════════════════
            INFO-KARTEN
        ══════════════════════════════════════ */}
        <section style={{ padding: '80px 0', backgroundColor: '#F7F5F0' }}>
          <div className="max-w-6xl mx-auto px-6">
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px' }}>
              Grundwissen
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 600, color: '#0A3D2C', lineHeight: 1.2, marginBottom: '48px', letterSpacing: '-0.02em' }}>
              Was Sie wissen sollten
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {INFO_KARTEN.map((k) => (
                <div
                  key={k.nr}
                  className="rounded-xl border p-9 transition-all duration-250"
                  style={{ borderColor: '#E8E2D9', backgroundColor: '#fff', borderRadius: '14px', padding: '36px 32px' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(10,61,44,0.10)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '56px', fontWeight: 300, color: '#D4AF37', lineHeight: 1, marginBottom: '16px' }}>
                    {k.nr}
                  </div>
                  <p style={{ fontSize: '10px', fontWeight: 600, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '10px' }}>
                    {k.label}
                  </p>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0A3D2C', marginBottom: '12px', lineHeight: 1.3 }}>
                    {k.titel}
                  </h3>
                  <p style={{ fontSize: '14px', fontWeight: 300, color: '#6b6b6b', lineHeight: 1.75 }}>
                    {k.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            RECHNER
        ══════════════════════════════════════ */}
        <section
          id="rechner"
          style={{ padding: '80px 0 96px', backgroundColor: '#fff', borderTop: '1px solid #E8E2D9', borderBottom: '1px solid #E8E2D9' }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px' }}>
                Finanzierungsrechner
              </p>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 600, color: '#0A3D2C', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Ihren Kreditrahmen berechnen
              </h2>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'inline-flex',
              gap: '8px',
              marginBottom: '32px',
              backgroundColor: '#F7F5F0',
              border: '1.5px solid #E8E2D9',
              borderRadius: '10px',
              padding: '4px',
            }}>
              {(['baufinanzierung', 'privatkredit'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 28px',
                    border: '1.5px solid',
                    borderColor: activeTab === tab ? '#0A3D2C' : 'transparent',
                    borderRadius: '7px',
                    backgroundColor: activeTab === tab ? '#0A3D2C' : 'transparent',
                    color: activeTab === tab ? '#fff' : '#6b6b6b',
                    fontSize: '13px',
                    fontWeight: activeTab === tab ? 500 : 400,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      (e.currentTarget as HTMLButtonElement).style.color = '#0A3D2C';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8E2D9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      (e.currentTarget as HTMLButtonElement).style.color = '#6b6b6b';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                    }
                  }}
                >
                  {tab === 'baufinanzierung' ? 'Baufinanzierung' : 'Privatkredit'}
                </button>
              ))}
            </div>

            {activeTab === 'baufinanzierung' ? (
              <BaufinanzierungRechner
                onLeadTrigger={(ergebnis, eingaben) => handleLeadTrigger('baufinanzierung', ergebnis, eingaben)}
              />
            ) : (
              <PrivatkreditRechner
                onLeadTrigger={(ergebnis, eingaben) => handleLeadTrigger('privatkredit', ergebnis, eingaben)}
              />
            )}

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b6b6b', marginTop: '24px' }}>
              Unverbindliche Ersteinschätzung — keine Bankzusage. Alle Angaben ohne Gewähr.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CTA-BANNER
        ══════════════════════════════════════ */}
        <section style={{ backgroundColor: '#0A3D2C', padding: '80px 0' }}>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(212,175,55,0.7)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>
              Persönliche Beratung
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 600, color: '#fff', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Ihr Finanzierungsexperte in Stuttgart
            </h2>
            <p style={{ fontSize: '16px', fontWeight: 300, color: 'rgba(255,255,255,0.65)', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.7 }}>
              Alperen Akbal und das Akrona-Team stehen Ihnen für ein unverbindliches Beratungsgespräch zur Verfügung.
            </p>
            <a
              href="mailto:info@akrona-gmbh.de"
              className="inline-flex items-center gap-3 transition-all duration-200"
              style={{ backgroundColor: '#D4AF37', color: '#0A3D2C', padding: '16px 36px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.03em' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#c9a430';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.02)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 24px rgba(212,175,55,0.35)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#D4AF37';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
              }}
            >
              Jetzt Kontakt aufnehmen
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FAQ
        ══════════════════════════════════════ */}
        <section style={{ padding: '80px 0', backgroundColor: '#F7F5F0' }}>
          <div className="max-w-3xl mx-auto px-6">
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px', textAlign: 'center' }}>
              FAQ
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 600, color: '#0A3D2C', lineHeight: 1.2, marginBottom: '48px', letterSpacing: '-0.02em', textAlign: 'center' }}>
              Häufige Fragen
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  style={{ borderRadius: '14px', border: '1px solid #E8E2D9', overflow: 'hidden' }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 24px',
                      textAlign: 'left',
                      backgroundColor: openFaq === i ? '#F7F5F0' : '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <span style={{ fontWeight: 500, fontSize: '15px', color: '#0A3D2C', paddingRight: '16px', lineHeight: 1.4 }}>
                      {item.frage}
                    </span>
                    <svg
                      width="16" height="16" fill="none" stroke="#0A3D2C" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 24px 20px', backgroundColor: '#F7F5F0' }}>
                      <p style={{ fontSize: '14px', fontWeight: 300, color: '#444', lineHeight: 1.75 }}>
                        {item.antwort}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
