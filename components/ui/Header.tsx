'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AkronaAnimatedButton from '@/components/ui/animated-generate-button';
import { useLanguage, useT } from '@/lib/language-context';

function FlagLink({ lang, current }: { lang: 'de' | 'ro'; current: string }) {
  const flag = lang === 'de' ? '🇩🇪' : '🇷🇴';
  const href = lang === 'de' ? '/' : '/romania';
  const active = current === lang;
  return (
    <Link
      href={href}
      title={lang === 'de' ? 'Deutsch' : 'Română'}
      style={{
        fontSize: '18px',
        lineHeight: 1,
        padding: '4px 6px',
        borderRadius: '6px',
        border: active ? '1.5px solid rgba(10,61,44,0.25)' : '1.5px solid transparent',
        background: active ? 'rgba(10,61,44,0.08)' : 'transparent',
        opacity: active ? 1 : 0.55,
        transition: 'opacity 150ms, background 150ms, border-color 150ms',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '36px',
        minHeight: '32px',
        textDecoration: 'none',
      }}
    >
      {flag}
    </Link>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { lang } = useLanguage();
  const t = useT();

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
      <div
        className="hdr-grid"
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
          <Link
            href={lang === 'ro' ? '/romania' : '/'}
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginRight: '12px', flexShrink: 0 }}
          >
            <Image
              src="/akrona-logo.png"
              alt="Akrona GmbH"
              width={180}
              height={58}
              priority
              style={{ height: '46px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Nav links */}
          <div className="hdr-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {(['baufinanzierung', 'privatkredit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => scrollToSection('rechner', tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: activeSection === tab ? '1.5px solid rgba(10,61,44,0.30)' : '1.5px solid rgba(10,61,44,0.18)',
                background: activeSection === tab ? 'rgba(10,61,44,0.10)' : 'transparent',
                color: activeSection === tab ? '#0A3D2C' : '#444',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 150ms, color 150ms, border-color 150ms',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== tab) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,61,44,0.07)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0A3D2C';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(10,61,44,0.28)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== tab) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#444';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(10,61,44,0.18)';
                }
              }}
            >
              {tab === 'baufinanzierung' ? t('mortgage') : t('personalLoan')}
            </button>
          ))}
          </div>
        </div>

        {/* ── Zone 2: IHK Badge (center, auto width) ── */}
        <div
          className="hdr-badge"
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

        {/* ── Zone 3: Language switcher + CTA button (right) ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
          {/* Flag links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <FlagLink lang="de" current={lang} />
            <FlagLink lang="ro" current={lang} />
          </div>

          <div className="hdr-cta">
            <AkronaAnimatedButton
              label={t('calculateNow')}
              size="sm"
              onClick={() => {
                const el = document.getElementById('rechner');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
