import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0A3D2C', borderTop: '1px solid rgba(212,175,55,0.12)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Image
            src="/akrona-logo.png"
            alt="Akrona GmbH"
            width={140}
            height={44}
            className="object-contain opacity-90"
            style={{ height: '44px', width: 'auto' }}
          />
          <nav className="flex items-center gap-8">
            {[
              { href: '/impressum', label: 'Impressum' },
              { href: '/datenschutz', label: 'Datenschutz' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#D4AF37')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
            © 2025 Akrona GmbH · Alperen Akbal
          </p>
        </div>
      </div>
    </footer>
  );
}
