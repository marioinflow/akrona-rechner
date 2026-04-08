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
    // If a tab param is needed, dispatch a custom event
    if (tab) {
      window.dispatchEvent(new CustomEvent('akrona:set-tab', { detail: tab }));
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveSection(tab ?? id);
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '64px',
        backgroundColor: scrolled ? 'rgba(247,245,240,0.92)' : 'rgba(247,245,240,0.80)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: scrolled ? '0.5px solid rgba(232,226,217,0.9)' : '0.5px solid rgba(232,226,217,0.5)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* ── Left: Logo + Nav Links ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginRight: '8px' }}>
            <Image
              src="/akrona-logo.png"
              alt="Akrona GmbH"
              width={160}
              height={52}
              priority
              style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
            />
          </a>

          {/* Nav links */}
          {(
            [
              { label: 'Baufinanzierung', tab: 'baufinanzierung' },
              { label: 'Privatkredit',    tab: 'privatkredit' },
            ] as const
          ).map(({ label, tab }) => (
            <button
              key={tab}
              onClick={() => scrollToSection('rechner', tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: activeSection === tab
                  ? 'rgba(10,61,44,0.10)'
                  : 'transparent',
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
                  e.currentTarget.style.background = 'rgba(10,61,44,0.06)';
                  e.currentTarget.style.color = '#0A3D2C';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== tab) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#555';
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Center: IHK Badge ── */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
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
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#0A5D3F',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#0A3D2C',
                letterSpacing: '0.04em',
              }}
            >
              § 34i GewO · IHK Stuttgart
            </span>
          </div>
        </div>

        {/* ── Right: CTA ── */}
        <a
          href="#rechner"
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
            gap: '7px',
            letterSpacing: '0.02em',
            transition: 'transform 0.1s ease, opacity 0.1s ease, box-shadow 0.2s ease',
            boxShadow: '0 2px 8px rgba(10,61,44,0.20)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.88';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(10,61,44,0.30)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(10,61,44,0.20)';
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Jetzt berechnen
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="9" x2="10" y2="9" /><polyline points="7 5 10 9 7 13" transform="translate(0,-4)"/>
            <path d="M5 9 L10 9 M7 6 L10 9 L7 12" />
          </svg>
        </a>
      </div>
    </header>
  );
}
