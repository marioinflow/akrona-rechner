'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id: string, tab?: string) => {
    if (tab) {
      window.dispatchEvent(new CustomEvent('akrona:set-tab', { detail: tab }));
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(tab ?? id);
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        height: '64px',
        backgroundColor: scrolled ? 'rgba(247,245,240,0.95)' : 'rgba(247,245,240,0.82)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: scrolled
          ? '0.5px solid rgba(232,226,217,0.9)'
          : '0.5px solid rgba(232,226,217,0.5)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Inner container — no overflow hidden, flex with 3 explicit zones */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* ── Zone 1: Logo + Nav links (left) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <a
            href="/"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginRight: '12px', flexShrink: 0 }}
          >
            <Image
              src="/akrona-logo.png"
              alt="Akrona GmbH"
              width={160}
              height={52}
              priority
              style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
            />
          </a>

          {/* Nav links */}
          {(['baufinanzierung', 'privatkredit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => scrollToSection('rechner', tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: activeSection === tab ? 'rgba(10,61,44,0.10)' : 'transparent',
                color: activeSection === tab ? '#0A3D2C' : '#555',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 150ms, color 150ms',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== tab) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,61,44,0.06)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0A3D2C';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== tab) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#555';
                }
              }}
            >
              {tab === 'baufinanzierung' ? 'Baufinanzierung' : 'Privatkredit'}
            </button>
          ))}
        </div>

        {/* ── Zone 2: IHK Badge (center, auto width) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '5px 13px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(10,61,44,0.07)',
            border: '1px solid rgba(10,61,44,0.12)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0A5D3F', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#0A3D2C', letterSpacing: '0.04em' }}>
            § 34i GewO · IHK Stuttgart
          </span>
        </div>

        {/* ── Zone 3: Social proof avatar + CTA button (right, justified to end) ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
          {/* Social proof avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid rgba(10,61,44,0.15)',
              flexShrink: 0,
            }}>
              <Image
                src="/akrona-mockup.png"
                alt="Akrona Kunden"
                width={32}
                height={32}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 15%' }}
              />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>5.000+ Kunden</span>
          </div>

          <a
            href="#rechner"
            className="btn-nav-cta"
            style={{
              height: '38px',
              padding: '0 18px',
              backgroundColor: '#0A3D2C',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Jetzt berechnen
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="7" x2="12" y2="7" />
              <polyline points="8 3 12 7 8 11" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
