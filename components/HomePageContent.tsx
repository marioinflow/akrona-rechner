'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Header from '@/components/ui/Header';
import AkronaAnimatedButton from '@/components/ui/animated-generate-button';
import { PartnerLogos } from '@/components/ui/partner-logos';
import Footer from '@/components/ui/Footer';
import BaufinanzierungRechner from '@/components/rechner/BaufinanzierungRechner';
import PrivatkreditRechner from '@/components/rechner/PrivatkreditRechner';
import LeadModal from '@/components/rechner/LeadModal';
import { useT } from '@/lib/language-context';
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


export default function HomePageContent() {
  const [activeTab, setActiveTab] = useState<RechnerTyp>('baufinanzierung');
  const [modalPayload, setModalPayload] = useState<ModalPayload | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useT();

  const FAQ = [
    { frage: t('faqQ1'), antwort: t('faqA1') },
    { frage: t('faqQ2'), antwort: t('faqA2') },
    { frage: t('faqQ3'), antwort: t('faqA3') },
    { frage: t('faqQ4'), antwort: t('faqA4') },
    { frage: t('faqQ5'), antwort: t('faqA5') },
    { frage: t('faqQ6'), antwort: t('faqA6') },
  ];

  // Listen for tab switch from Header nav links
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail as RechnerTyp;
      if (tab === 'baufinanzierung' || tab === 'privatkredit') {
        setActiveTab(tab);
      }
    };
    window.addEventListener('akrona:set-tab', handler);
    return () => window.removeEventListener('akrona:set-tab', handler);
  }, []);

  // Network canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    interface Node { x: number; y: number; vx: number; vy: number; }
    let nodes: Node[] = [];

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      nodes = Array.from({ length: 60 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const maxDist = 140;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = 0.055 * (1 - dist / maxDist);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(10,61,44,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(10,61,44,0.14)';
        ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

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
            paddingTop: '64px',
            backgroundColor: '#F7F5F0',
            overflow: 'hidden',
            minHeight: 'min(100vh, 760px)',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Network canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          {/* Radial glow — top right */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            right: '-8%',
            width: '55%',
            height: '110%',
            background: 'radial-gradient(ellipse at 65% 30%, rgba(212,175,55,0.07) 0%, rgba(10,61,44,0.05) 40%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '3fr 2fr',
              alignItems: 'stretch',
              minHeight: 'min(calc(100vh - 64px), 700px)',
              position: 'relative',
              zIndex: 1,
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
                className="fade-in-up"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 14px 5px 9px',
                  borderRadius: '99px',
                  backgroundColor: 'rgba(10,61,44,0.07)',
                  border: '1px solid rgba(10,61,44,0.14)',
                  marginBottom: '24px',
                  width: 'fit-content',
                }}
              >
                {/* Pulse dot */}
                <span style={{ position: 'relative', width: '6px', height: '6px', flexShrink: 0 }}>
                  <span style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%', backgroundColor: '#D4AF37',
                  }} />
                  <span style={{
                    position: 'absolute', inset: '-4px',
                    borderRadius: '50%', border: '1.5px solid #D4AF37',
                    animation: 'pulse-ring 2.5s ease-out infinite',
                  }} />
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0A3D2C', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {t('freeAndNonBinding')}
                </span>
              </div>

              {/* H1 */}
              <h1
                className="fade-in-up"
                style={{ animationDelay: '0.08s',
                  fontSize: 'clamp(38px, 4.5vw, 60px)',
                  fontWeight: 800,
                  color: '#0A3D2C',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  margin: '0 0 20px',
                  maxWidth: '580px',
                }}
              >
                {t('heroTitle')}
              </h1>

              {/* Subtext */}
              <p
                className="fade-in-up"
                style={{ animationDelay: '0.16s',
                  fontSize: '17px',
                  fontWeight: 400,
                  color: '#444',
                  maxWidth: '480px',
                  lineHeight: 1.7,
                  margin: '0 0 36px',
                }}
              >
                {t('heroSubtitle')}
              </p>

              {/* CTA */}
              <div className="fade-in-up" style={{ animationDelay: '0.24s', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
                <AkronaAnimatedButton
                  label={t('calculateNow')}
                  size="md"
                  onClick={() => {
                    const el = document.getElementById('rechner');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
                <p style={{ fontSize: '13px', color: '#6b6b6b', margin: 0 }}>
                  {t('instantResult')}
                </p>
              </div>

              {/* Trust Badges */}
              <div className="fade-in-up" style={{ animationDelay: '0.32s', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  { icon: '🏦', label: t('banksCount') },
                  { icon: '🔒', label: t('sslSecured') },
                  { icon: '✓', label: t('ihkStuttgart') },
                ].map((b) => (
                  <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>{b.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0A3D2C' }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bild-Seite ── */}
            <div style={{ position: 'relative', minHeight: '500px' }}>
              {/* Floating Pill — oben links, schwebt vor dem Bild */}
              <div
                className="float-anim"
                style={{
                  position: 'absolute',
                  top: '48px',
                  left: '-20px',
                  zIndex: 4,
                  backgroundColor: '#fff',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                  animationDelay: '1s',
                }}
              >
                <div
                  style={{
                    width: '34px', height: '34px',
                    background: 'linear-gradient(135deg, #0A3D2C, #0A5D3F)',
                    borderRadius: '9px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111' }}>{t('instantEvaluation')}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6b6b6b' }}>{t('noWaitTime')}</p>
                </div>
              </div>

              {/* Bild-Container — leicht abgerundet, kein extremes Pill */}
              <div
                style={{
                  position: 'absolute',
                  inset: '24px 0 24px 0',
                  borderRadius: '24px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src="/akrona-mockup.png"
                  alt="Paar nutzt Akrona Finanzierungsrechner"
                  fill
                  priority
                  style={{ objectFit: 'cover', objectPosition: '50% 15%' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 50%, rgba(10,61,44,0.15) 100%)',
                  }}
                />
              </div>

              {/* Float Result Card — ragt über Bild hinaus (unten rechts) */}
              <div
                className="float-anim"
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '-20px',
                  zIndex: 4,
                  backgroundColor: '#0A3D2C',
                  borderRadius: '20px',
                  padding: '18px 22px',
                  boxShadow: '0 20px 56px rgba(10,61,44,0.38), 0 4px 10px rgba(0,0,0,0.15)',
                  minWidth: '200px',
                  animationDelay: '0.5s',
                }}
              >
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(212,175,55,0.75)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>{t('avgFinancingFrame')}</p>
                <p style={{ fontSize: '30px', fontWeight: 800, color: '#D4AF37', margin: '0 0 3px', letterSpacing: '-0.02em', lineHeight: 1 }}>320.000 €</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{t('atIncomeExample')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            PARTNER LOGOS TICKER
        ══════════════════════════════════════════════════ */}
        <PartnerLogos />

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
            <div className="scroll-reveal" style={{ marginBottom: '40px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                {t('calculatorEyebrow')}
              </span>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#0A3D2C', lineHeight: 1.15, letterSpacing: '-0.025em', margin: '8px 0 0' }}>
                {t('calculatorTitle')}
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
                  {tab === 'baufinanzierung' ? t('mortgage') : t('personalLoan')}
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
              {t('calculatorDisclaimer')}
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            BENTO GRID
        ══════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 0', backgroundColor: '#fff', borderTop: '1px solid #E8E2D9' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

            <div className="scroll-reveal" style={{ marginBottom: '48px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                {t('whyAkrona')}
              </span>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#0A3D2C', lineHeight: 1.15, letterSpacing: '-0.025em', margin: '8px 0 0' }}>
                {t('yourAdvantage')}
              </h2>
            </div>

            {/* Grid: 2 Reihen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: '16px' }}>

              {/* Karte 1: breit (2 Spalten) */}
              <div
                className="scroll-reveal bento-hover"
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
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(212,175,55,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{t('bentoNetworkEyebrow')}</span>
                <p style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, color: '#D4AF37', lineHeight: 1, letterSpacing: '-0.03em', margin: 0 }}>{t('bentoNetworkTitle')}</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>{t('bentoNetworkSubtitle')}</p>
                <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0, maxWidth: '360px' }}>
                  {t('bentoNetworkText')}
                </p>
              </div>

              {/* Karte 2: schmal */}
              <div
                className="scroll-reveal delay-1 bento-hover"
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
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('bentoCertifiedEyebrow')}</span>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#0A3D2C', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>§ 34i<br />GewO</p>
                <p style={{ fontSize: '13px', fontWeight: 400, color: '#6b6b6b', lineHeight: 1.6, margin: 0 }}>
                  {t('bentoCertifiedText')}
                </p>
              </div>

              {/* Karte 3: schmal */}
              <div
                className="scroll-reveal delay-2 bento-hover"
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
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('bentoExpertiseEyebrow')}</span>
                <p style={{ fontSize: '40px', fontWeight: 800, color: '#0A3D2C', lineHeight: 1, letterSpacing: '-0.03em', margin: 0 }}>10+</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0A3D2C', margin: '0 0 4px' }}>{t('bentoExpertiseSubtitle')}</p>
                <p style={{ fontSize: '13px', fontWeight: 400, color: '#6b6b6b', lineHeight: 1.6, margin: 0 }}>
                  {t('bentoExpertiseText')}
                </p>
              </div>

              {/* Karte 4: breit (2 Spalten) */}
              <div
                className="scroll-reveal delay-1 bento-hover"
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
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(212,175,55,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block', marginBottom: '10px' }}>{t('bentoFreeEyebrow')}</span>
                  <p style={{ fontSize: '36px', fontWeight: 800, color: '#D4AF37', lineHeight: 1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>100 %</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>{t('bentoFreeSubtitle')}</p>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0, maxWidth: '340px' }}>
                  {t('bentoFreeText')}
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
            <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A5D3F', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                {t('faqEyebrow')}
              </span>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#0A3D2C', lineHeight: 1.15, letterSpacing: '-0.025em', margin: '8px 0 0' }}>
                {t('faqTitle')}
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
          <div className="scroll-reveal" style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(212,175,55,0.75)', textTransform: 'uppercase', letterSpacing: '0.18em', display: 'block', marginBottom: '16px' }}>
              {t('ctaEyebrow')}
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.025em' }}>
              {t('ctaTitle')}
            </h2>
            <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', maxWidth: '440px', margin: '0 auto 36px', lineHeight: 1.7 }}>
              {t('ctaText')}
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
              {t('contactUs')}
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
