'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '72px',
        backgroundColor: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid rgba(232,226,217,0.8)' : '1px solid rgba(232,226,217,0.4)',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : 'none',
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
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/akrona-logo.png"
            alt="Akrona GmbH"
            width={160}
            height={52}
            priority
            style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
          />
        </a>

        {/* IHK Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '99px',
            backgroundColor: 'rgba(10,61,44,0.06)',
            border: '1px solid rgba(10,61,44,0.12)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
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
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            § 34i GewO · IHK Stuttgart
          </span>
        </div>

        {/* CTA */}
        <a
          href="#rechner"
          style={{
            height: '40px',
            padding: '0 20px',
            backgroundColor: '#0A3D2C',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            letterSpacing: '0.03em',
            transition: 'transform 0.1s ease, opacity 0.1s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Jetzt berechnen
        </a>
      </div>
    </header>
  );
}
