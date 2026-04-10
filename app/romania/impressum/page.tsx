import Link from 'next/link';
import type { Metadata } from 'next';
import { translations } from '@/lib/translations';

export const metadata: Metadata = {
  title: translations.ro.imprintTitle,
};

const t = (key: keyof typeof translations.ro) => translations.ro[key] as string;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-base mb-3" style={{ color: '#0A3D2C' }}>{title}</h2>
      {children}
    </div>
  );
}

export default function ImpresumRomania() {
  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#0A3D2C', height: '64px' }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <Link
          href="/romania"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: '#0A3D2C' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('backToCalculator')}
        </Link>

        <div className="rounded-2xl border p-8" style={{ borderColor: '#E8E2D9', backgroundColor: '#fff' }}>
          <h1 className="text-2xl font-semibold mb-8" style={{ color: '#0A3D2C' }}>{t('imprintHeading')}</h1>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#444' }}>

            <Section title={t('infoAccordingToTmg')}>
              <p>
                {t('companyNameLabel')} Akrona GmbH<br />
                {t('businessAddressLabel')} Esslingen Str. 9, 73207 Plochingen<br />
                {t('representedByLabel')} Alperen Akbal ({t('managingDirector')})
              </p>
            </Section>

            <Section title={t('contactHeading')}>
              <p>
                {t('emailLabel')} <a href="mailto:info@akrona.de" style={{ color: '#0A3D2C' }}>info@akrona.de</a><br />
                {t('phoneLabel')} +49 1523 4653532<br />
                {t('phoneLabel')} 07153 6186833
              </p>
            </Section>

            <Section title={t('commercialRegister')}>
              <p>{t('commercialRegisterPending')}</p>
            </Section>

            <Section title={t('vatId')}>
              <p>{t('vatIdPending')}</p>
            </Section>

            <Section title={t('supervisoryAuthorities')}>
              <p className="font-medium mb-1">{t('permission34c')}</p>
              <p>
                {t('permission34cDesc')}<br />
                {t('competentAuthority')}<br />
                {t('addressLabel')} Jägerstr. 30, 70174 Stuttgart
              </p>
              <p className="font-medium mt-4 mb-1">{t('permission34i')}</p>
              <p>
                {t('permission34iDesc')}<br />
                {t('competentAuthority')}<br />
                {t('addressLabel')} Jägerstr. 30, 70174 Stuttgart
              </p>
            </Section>

            <Section title={t('professionalRegulations')}>
              <p>{t('professionalRegulationsDesc')}</p>
              <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: '#6b6b6b' }}>
                <li>§ 34c GewO</li>
                <li>§ 34i GewO</li>
                <li>{t('mabv')}</li>
                <li>{t('immVermV')}</li>
              </ul>
              <p className="mt-3">
                {t('regulationsAvailableAt')}{' '}
                <a href="https://www.gesetze-im-internet.de" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D2C' }}>
                  www.gesetze-im-internet.de
                </a>
              </p>
            </Section>

            <Section title={t('disputeResolution')}>
              <p>
                {t('osPlatformDesc')}{' '}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D2C' }}>
                  https://ec.europa.eu/consumers/odr
                </a>. {t('emailFindAbove')}
              </p>
              <p className="mt-3">{t('noDisputeResolutionObligation')}</p>
            </Section>

            <Section title={t('liabilityForContent')}>
              <p>{t('contentLiabilityDesc1')}</p>
              <p className="mt-3">{t('contentLiabilityDesc2')}</p>
            </Section>

            <Section title={t('liabilityForLinks')}>
              <p>{t('linksLiabilityDesc')}</p>
            </Section>

            <Section title={t('copyrightHeading')}>
              <p>{t('copyrightDesc')}</p>
            </Section>

            <div style={{ borderTop: '1px solid #E8E2D9', paddingTop: '24px', color: '#6b6b6b', fontSize: '12px' }}>
              <p>{t('statusDate')}</p>
              <p className="mt-1">Akrona GmbH | Alperen Akbal | <a href="mailto:info@akrona.de" style={{ color: '#0A3D2C' }}>info@akrona.de</a></p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
