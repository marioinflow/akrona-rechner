import Link from 'next/link';
import type { Metadata } from 'next';
import { translations } from '@/lib/translations';

export const metadata: Metadata = {
  title: translations.ro.privacyTitle,
};

const t = (key: keyof typeof translations.ro) => translations.ro[key] as string;

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-base mb-3" style={{ color: '#0A3D2C' }}>{num}. {title}</h2>
      {children}
    </div>
  );
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: '#6b6b6b' }}>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

export default function DatenschutzRomania() {
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
          <h1 className="text-2xl font-semibold mb-8" style={{ color: '#0A3D2C' }}>{t('privacyHeading')}</h1>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#444' }}>

            <Section num="1" title={t('privacyAtAGlance')}>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: '#1a1a1a' }}>{t('generalNotes')}</h3>
              <p>{t('generalNotesDesc')}</p>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: '#1a1a1a' }}>{t('dataCollectionOnWebsite')}</h3>
              <p className="font-medium mb-1">{t('whoIsResponsible')}</p>
              <p>{t('responsibleDesc')}</p>
              <p className="font-medium mt-3 mb-1">{t('howWeCollectData')}</p>
              <p>{t('howWeCollectDataDesc')}</p>
            </Section>

            <Section num="2" title={t('responsibleParty')}>
              <p>
                {t('companyNameLabel')} Akrona GmbH<br />
                {t('representedByLabel')} Alperen Akbal ({t('managingDirector')})<br />
                {t('businessAddressLabel')} Esslingen Str. 9, 73207 Plochingen<br />
                Instanța de înregistrare: Amtsgericht Stuttgart<br />
                Număr de înregistrare: HRB 804639<br />
                {t('emailLabel')} <a href="mailto:info@akrona.de" style={{ color: '#0A3D2C' }}>info@akrona.de</a><br />
                {t('phoneLabel')} +49 1523 4653532 / 07153 6186833
              </p>
              <p className="mt-3">{t('responsiblePartyDesc')}</p>
            </Section>

            <Section num="3" title={t('legalBasis')}>
              <p>{t('legalBasisDesc')}</p>
              <Ul items={[t('legalBasisA'), t('legalBasisB'), t('legalBasisC'), t('legalBasisF')]} />
            </Section>

            <Section num="4" title={t('hostingAndTech')}>
              <p>{t('hostingDesc1')}</p>
              <p className="mt-3">{t('hostingDesc2')}</p>
            </Section>

            <Section num="5" title={t('contactFormsAndInquiries')}>
              <p>{t('contactFormsDesc1')}</p>
              <p className="mt-3">{t('contactFormsDesc2')}</p>
              <p className="mt-3">{t('contactFormsDesc3')}</p>
            </Section>

            <Section num="6" title={t('aiChatAgent')}>
              <p>{t('aiChatAgentDesc')}</p>
              <p className="font-medium mt-3 mb-1">{t('whatDataCollected')}</p>
              <Ul items={[t('dataChatContents'), t('dataContactInfo'), t('dataConnectionTime'), t('dataPreferences')]} />
              <p className="font-medium mt-3 mb-1">{t('processingPurpose')}</p>
              <p>{t('processingPurposeDesc')}</p>
              <p className="font-medium mt-3 mb-1">{t('legalBasisShort')}</p>
              <p>{t('aiChatLegalBasisDesc')}</p>
              <p className="font-medium mt-3 mb-1">{t('storageDuration')}</p>
              <p>{t('storageDurationDesc')}</p>
            </Section>

            <Section num="7" title={t('aiVoiceAgent')}>
              <p>{t('aiVoiceAgentDesc')}</p>
              <p className="font-medium mt-3 mb-1">{t('whatDataCollected')}</p>
              <Ul items={[t('dataVoiceRecording'), t('dataVoiceTranscription'), t('dataPhoneNumber'), t('dataCallDuration'), t('dataCallContents')]} />
              <p className="font-medium mt-3 mb-1">{t('noticeAndConsent')}</p>
              <p>{t('noticeAndConsentDesc')}</p>
              <p className="font-medium mt-3 mb-1">{t('legalBasisShort')}</p>
              <p>{t('voiceLegalBasisDesc')}</p>
              <p className="font-medium mt-3 mb-1">{t('storageDuration')}</p>
              <p>{t('voiceStorageDesc')}</p>
            </Section>

            <Section num="8" title={t('calendarIntegration')}>
              <p>{t('calendarIntegrationDesc')}</p>
              <p className="font-medium mt-3 mb-1">{t('whatDataCollected')}</p>
              <Ul items={[t('dataNameContact'), t('dataAppointment'), t('dataTopic'), t('dataAdditionalInfo')]} />
              <p className="font-medium mt-3 mb-1">{t('processingPurpose')}</p>
              <p>{t('calendarPurposeDesc')}</p>
              <p className="font-medium mt-3 mb-1">{t('transferToThirdParties')}</p>
              <p>{t('transferDesc')}</p>
              <p className="font-medium mt-3 mb-1">{t('storageDuration')}</p>
              <p>{t('calendarStorageDesc')}</p>
            </Section>

            <Section num="9" title={t('crmAndLeadManagement')}>
              <p>{t('crmDesc1')}</p>
              <p className="mt-3">{t('crmDesc2')}</p>
            </Section>

            <Section num="10" title={t('cookiesAndTracking')}>
              <p>{t('cookiesDesc1')}</p>
              <p className="mt-3">{t('cookiesDesc2')}</p>
            </Section>

            <Section num="11" title={t('whatsappCommunication')}>
              <p>{t('whatsappDesc')}</p>
            </Section>

            <Section num="12" title={t('dataSubjectRights')}>
              <p>{t('rightsIntro')}</p>
              <Ul items={[
                t('rightAccess'), t('rightRectification'), t('rightErasure'),
                t('rightRestriction'), t('rightDataPortability'), t('rightObject'),
                t('rightWithdrawConsent'), t('rightLodgeComplaint'),
              ]} />
              <p className="mt-3">{t('exerciseRights')}</p>
              <p className="mt-2" style={{ color: '#6b6b6b' }}>
                {t('emailLabel')} <a href="mailto:info@akrona.de" style={{ color: '#0A3D2C' }}>info@akrona.de</a><br />
                {t('postLabel')} Akrona GmbH, Esslingen Str. 9, 73207 Plochingen
              </p>
            </Section>

            <Section num="13" title={t('rightToComplainAuthority')}>
              <p>{t('complainAuthorityDesc')}</p>
              <p className="mt-3" style={{ color: '#6b6b6b' }}>
                {t('lfdiBw')}<br />
                {t('addressLabel')} Lautenschlagerstraße 20, 70173 Stuttgart<br />
                {t('phoneLabel')} +49 711 615541-0<br />
                {t('emailLabel')} <a href="mailto:poststelle@lfdi.bwl.de" style={{ color: '#0A3D2C' }}>poststelle@lfdi.bwl.de</a><br />
                {t('websiteLabel')} <a href="https://www.baden-wuerttemberg.datenschutz.de" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D2C' }}>www.baden-wuerttemberg.datenschutz.de</a>
              </p>
            </Section>

            <Section num="14" title={t('dataSecurity')}>
              <p>{t('dataSecurityDesc1')}</p>
              <p className="mt-3">{t('dataSecurityDesc2')}</p>
            </Section>

            <Section num="15" title={t('updateAndChangePrivacyPolicy')}>
              <p>{t('updateDesc')}</p>
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
