'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
      style={{
        backgroundColor: '#0A3D2C',
        borderBottom: '1px solid rgba(212,175,55,0.18)',
        height: '70px',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <Image
            src="/akrona-logo.png"
            alt="Akrona GmbH"
            width={180}
            height={58}
            className="object-contain transition-transform duration-200 group-hover:scale-105"
            style={{ height: '58px', width: 'auto' }}
            priority
          />
        </a>
        <div style={{ textAlign: 'right', lineHeight: 1.65 }}>
          <p style={{ fontSize: '11px', fontWeight: 300, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
            <strong style={{ color: 'rgba(212,175,55,0.8)', fontWeight: 500 }}>Erlaubnis</strong> § 34c & § 34i GewO
          </p>
          <p style={{ fontSize: '11px', fontWeight: 300, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
            IHK Region Stuttgart
          </p>
        </div>
      </div>
    </header>
  );
}
