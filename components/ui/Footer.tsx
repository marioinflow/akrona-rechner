'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useT, useLanguage } from '@/lib/language-context';

export default function Footer() {
  const t = useT();
  const { lang } = useLanguage();
  const prefix = lang === 'ro' ? '/romania' : '';

  return (
    <footer
      style={{
        backgroundColor: '#0A3D2C',
        borderTop: '1px solid rgba(212,175,55,0.1)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <Image
          src="/akrona-logo.png"
          alt="Akrona GmbH"
          width={150}
          height={48}
          style={{ height: '44px', width: 'auto', objectFit: 'contain', opacity: 1 }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {[
            { href: `${prefix}/impressum`, labelKey: 'imprint' as const, external: false },
            { href: `${prefix}/datenschutz`, labelKey: 'privacyPolicy' as const, external: false },
            { href: 'https://akrona.de', labelKey: 'website' as const, external: true },
          ].map((l) =>
            l.external ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.45)',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#D4AF37')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              >
                {t(l.labelKey)}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.45)',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#D4AF37')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              >
                {t(l.labelKey)}
              </Link>
            )
          )}
        </div>

        <p
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.04em',
            margin: 0,
          }}
        >
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
