'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AkronaAnimatedButton from '@/components/ui/animated-generate-button';
import { useLanguage, useT } from '@/lib/language-context';

const NAV_TABS = ['baufinanzierung', 'privatkredit', 'immobilienbewertung'] as const;
type NavTab = (typeof NAV_TABS)[number];

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
  const [activeSection, setActiveSection] = useState<NavTab>('baufinanzierung');
  const { lang } = useLanguage();
  const t = useT();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keep the segment highlight in sync when the tab is switched elsewhere
  // (e.g. the calculator's own tabs further down the page).
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail as string;
      if ((NAV_TABS as readonly string[]).includes(tab)) {
        setActiveSection(tab as NavTab);
      }
    };
    window.addEventListener('akrona:set-tab', handler);
    return () => window.removeEventListener('akrona:set-tab', handler);
  }, []);

  const goToTab = (tab: NavTab) => {
    window.dispatchEvent(new CustomEvent('akrona:set-tab', { detail: tab }));
    setActiveSection(tab);
    // Scroll the whole calculator section to the same anchor for every tab.
    // #rechner sits above the tabs, so its offset is identical regardless of which
    // calculator renders below — all three options land at the same point.
    document.getElementById('rechner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const labelFor = (tab: NavTab) =>
    tab === 'baufinanzierung'
      ? t('mortgage')
      : tab === 'privatkredit'
        ? t('personalLoan')
        : t('propertyValuation');

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '14px',
        pointerEvents: 'none',
      }}
    >
      {/* ── Floating island ── */}
      <div
        className="hdr-island"
        style={{
          pointerEvents: 'auto',
          width: 'min(1200px, calc(100% - 48px))',
          height: '64px',
          backgroundColor: scrolled ? 'rgba(247,245,240,0.95)' : 'rgba(247,245,240,0.85)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '0.5px solid rgba(232,226,217,0.9)',
          borderRadius: '22px',
          boxShadow: scrolled
            ? '0 8px 30px rgba(10,61,44,0.12), 0 1px 3px rgba(0,0,0,0.04)'
            : '0 4px 22px rgba(10,61,44,0.08)',
          transition: 'background-color 0.3s, box-shadow 0.3s',
        }}
      >
        <div
          className="hdr-grid"
          style={{
            height: '100%',
            padding: '0 14px 0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {/* ── Left group: Logo + segment menu (left-aligned) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
            <Link
              href={lang === 'ro' ? '/romania' : '/'}
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}
            >
              <Image
                src="/akrona-logo.png"
                alt="Akrona GmbH"
                width={180}
                height={58}
                priority
                style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>

            {/* Segment menu */}
            <nav
              className="hdr-nav"
            aria-label={lang === 'ro' ? 'Calculatoare' : 'Rechner'}
            style={{
              display: 'inline-flex',
              gap: '2px',
              padding: '4px',
              borderRadius: '9999px',
              background: 'rgba(10,61,44,0.06)',
              border: '1px solid rgba(10,61,44,0.10)',
            }}
          >
            {NAV_TABS.map((tab) => {
              const active = activeSection === tab;
              return (
                <button
                  key={tab}
                  onClick={() => goToTab(tab)}
                  aria-current={active ? 'true' : undefined}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: active ? '#0A3D2C' : 'transparent',
                    color: active ? '#fff' : '#444',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    transition: 'background 160ms, color 160ms',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,61,44,0.08)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#0A3D2C';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = '#444';
                    }
                  }}
                >
                  {labelFor(tab)}
                </button>
              );
            })}
            </nav>
          </div>

          {/* ── Right group: Language switcher + CTA button ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
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
      </div>
    </header>
  );
}
