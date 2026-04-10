import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum | Akrona GmbH',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-base mb-3" style={{ color: '#0A3D2C' }}>{title}</h2>
      {children}
    </div>
  );
}

export default function Impressum() {
  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#0A3D2C', height: '64px' }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: '#0A3D2C' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zurück zum Rechner
        </Link>

        <div className="rounded-2xl border p-8" style={{ borderColor: '#E8E2D9', backgroundColor: '#fff' }}>
          <h1 className="text-2xl font-semibold mb-8" style={{ color: '#0A3D2C' }}>Impressum</h1>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#444' }}>

            <Section title="Angaben gemäß § 5 TMG">
              <p>
                Firmenname: Akrona GmbH<br />
                Geschäftsadresse: Esslingen Str. 9, 73207 Plochingen<br />
                Vertreten durch: Alperen Akbal (Geschäftsführer)
              </p>
            </Section>

            <Section title="Kontakt">
              <p>
                E-Mail: <a href="mailto:info@akrona.de" style={{ color: '#0A3D2C' }}>info@akrona.de</a><br />
                Telefon: +49 1523 4653532<br />
                Telefon: 07153 6186833
              </p>
            </Section>

            <Section title="Handelsregister">
              <p>
                Die Eintragung im Handelsregister befindet sich derzeit im Prozess der Anmeldung. Registergericht und Registernummer werden nach erfolgter Eintragung an dieser Stelle ergänzt.
              </p>
            </Section>

            <Section title="Umsatzsteuer-Identifikationsnummer">
              <p>
                Die Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz wird nach Zuteilung durch das zuständige Finanzamt an dieser Stelle bekannt gegeben.
              </p>
            </Section>

            <Section title="Aufsichtsbehörden & Erlaubnisse">
              <p className="font-medium mb-1">Erlaubnis gemäß § 34c GewO</p>
              <p>
                Die Akrona GmbH verfügt über die erforderliche Erlaubnis zur Tätigkeit als Immobilienmakler gemäß § 34c Gewerbeordnung (GewO).<br />
                Zuständige Aufsichtsbehörde: IHK Region Stuttgart<br />
                Adresse: Jägerstr. 30, 70174 Stuttgart
              </p>
              <p className="font-medium mt-4 mb-1">Erlaubnis gemäß § 34i GewO (Immobiliendarlehensvermittler)</p>
              <p>
                Die Akrona GmbH verfügt über die erforderliche Erlaubnis zur Tätigkeit als Immobiliendarlehensvermittler gemäß § 34i Gewerbeordnung (GewO).<br />
                Zuständige Aufsichtsbehörde: IHK Region Stuttgart<br />
                Adresse: Jägerstr. 30, 70174 Stuttgart
              </p>
            </Section>

            <Section title="Berufsrechtliche Regelungen">
              <p>Es gelten die berufsrechtlichen Regelungen der Gewerbeordnung (GewO), insbesondere:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: '#6b6b6b' }}>
                <li>§ 34c GewO</li>
                <li>§ 34i GewO</li>
                <li>Makler- und Bauträgerverordnung (MaBV)</li>
                <li>Immobiliardarlehensvermittlungsverordnung (ImmVermV)</li>
              </ul>
              <p className="mt-3">
                Die berufsrechtlichen Regelungen sind einsehbar unter:{' '}
                <a href="https://www.gesetze-im-internet.de" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D2C' }}>
                  www.gesetze-im-internet.de
                </a>
              </p>
            </Section>

            <Section title="Streitschlichtung">
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D2C' }}>
                  https://ec.europa.eu/consumers/odr
                </a>. Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
              <p className="mt-3">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </Section>

            <Section title="Haftung für Inhalte">
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
              <p className="mt-3">
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>
            </Section>

            <Section title="Haftung für Links">
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
              </p>
            </Section>

            <Section title="Urheberrecht">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
              </p>
            </Section>

            <div style={{ borderTop: '1px solid #E8E2D9', paddingTop: '24px', color: '#6b6b6b', fontSize: '12px' }}>
              <p>Stand: Februar 2026</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
