import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | Akrona GmbH',
};

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

export default function Datenschutz() {
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
          <h1 className="text-2xl font-semibold mb-8" style={{ color: '#0A3D2C' }}>Datenschutzerklärung</h1>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#444' }}>

            <Section num="1" title="Datenschutz auf einen Blick">
              <h3 className="font-semibold mt-4 mb-2" style={{ color: '#1a1a1a' }}>Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
              </p>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: '#1a1a1a' }}>Datenerfassung auf dieser Website</h3>
              <p className="font-medium mb-1">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</p>
              <p>
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Verantwortliche Stelle" in dieser Datenschutzerklärung entnehmen.
              </p>
              <p className="font-medium mt-3 mb-1">Wie erfassen wir Ihre Daten?</p>
              <p>
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen, zum Beispiel durch Eingabe in ein Kontaktformular, im Rahmen eines Chat-Gesprächs mit unserem KI-Chat-Agenten oder durch ein Telefongespräch mit unserem KI-Voice-Agenten. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst.
              </p>
            </Section>

            <Section num="2" title="Verantwortliche Stelle">
              <p>
                Name: Akrona GmbH<br />
                Vertreten durch: Alperen Akbal (Geschäftsführer)<br />
                Geschäftsadresse: Esslingen Str. 9, 73207 Plochingen<br />
                Registergericht: Amtsgericht Stuttgart<br />
                Registernummer: HRB 804639<br />
                E-Mail: <a href="mailto:info@akrona.de" style={{ color: '#0A3D2C' }}>info@akrona.de</a><br />
                Telefon: +49 1523 4653532 / 07153 6186833
              </p>
              <p className="mt-3">
                Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten entscheidet.
              </p>
            </Section>

            <Section num="3" title="Rechtsgrundlagen der Datenverarbeitung">
              <p>Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Basis folgender Rechtsgrundlagen der DSGVO:</p>
              <Ul items={[
                'Art. 6 Abs. 1 lit. a DSGVO – Einwilligung',
                'Art. 6 Abs. 1 lit. b DSGVO – Vertragserfüllung oder vorvertragliche Maßnahmen',
                'Art. 6 Abs. 1 lit. c DSGVO – Erfüllung rechtlicher Verpflichtungen',
                'Art. 6 Abs. 1 lit. f DSGVO – Berechtigte Interessen des Verantwortlichen',
              ]} />
            </Section>

            <Section num="4" title="Hosting und technische Infrastruktur">
              <p>
                Diese Website wird bei einem professionellen Hosting-Anbieter gehostet. Beim Aufruf dieser Website werden durch den Hosting-Anbieter automatisch sogenannte Server-Log-Dateien erfasst, die Informationen über Ihren Browser, Betriebssystem, Referrer-URL, IP-Adresse und Uhrzeit des Zugriffs enthalten.
              </p>
              <p className="mt-3">
                Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und Optimierung seiner Website – hierzu müssen die Server-Log-Files erfasst werden.
              </p>
            </Section>

            <Section num="5" title="Kontaktformulare und Anfragen">
              <p>
                Wenn Sie uns per Kontaktformular oder E-Mail Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
              </p>
              <p className="mt-3">
                Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
              </p>
              <p className="mt-3">
                Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z. B. nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.
              </p>
            </Section>

            <Section num="6" title="KI-Chat-Agent">
              <p>
                Auf dieser Website setzen wir einen KI-gestützten Chat-Agenten ein, der Ihnen in Echtzeit und rund um die Uhr (24/7) bei Fragen rund um unsere Immobilien- und Investmentdienstleistungen zur Verfügung steht. Der Chat-Agent kann auch in rumänischer und deutscher Sprache kommunizieren.
              </p>
              <p className="font-medium mt-3 mb-1">Welche Daten werden erfasst?</p>
              <Ul items={[
                'Inhalte Ihrer Chatnachrichten und Anfragen',
                'Von Ihnen freiwillig mitgeteilte Kontaktdaten (Name, E-Mail, Telefonnummer)',
                'Zeitpunkt des Gesprächs und technische Verbindungsdaten',
                'Im Chat angegebene Interessen und Präferenzen (z. B. Immobilientyp, Budget)',
              ]} />
              <p className="font-medium mt-3 mb-1">Zweck der Verarbeitung</p>
              <p>
                Die über den Chat-Agenten erfassten Daten werden verwendet, um Ihre Anfragen zu beantworten, Sie vorläufig zu qualifizieren und ggf. an einen unserer Berater weiterzuleiten sowie Folgemaßnahmen (Follow-ups) durchzuführen.
              </p>
              <p className="font-medium mt-3 mb-1">Rechtsgrundlage</p>
              <p>
                Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) sowie Art. 6 Abs. 1 lit. a DSGVO (Ihre Einwilligung, die Sie durch aktive Nutzung des Chats erteilen). Sie werden vor Nutzung des Chat-Agenten über die Datenverarbeitung informiert und um Ihre Einwilligung gebeten.
              </p>
              <p className="font-medium mt-3 mb-1">Speicherdauer</p>
              <p>
                Chat-Protokolle werden für einen Zeitraum von maximal 24 Monaten gespeichert, sofern kein weiterführendes Vertragsverhältnis entstanden ist. Im Falle einer Geschäftsbeziehung gelten die gesetzlichen Aufbewahrungsfristen.
              </p>
            </Section>

            <Section num="7" title="KI-Voice-Agent (Telefonie)">
              <p>
                Wir setzen einen KI-gestützten Voice-Agenten ein, der eingehende Anrufe entgegennimmt, Fragen beantwortet und Terminkoordinationen durchführt.
              </p>
              <p className="font-medium mt-3 mb-1">Welche Daten werden erfasst?</p>
              <Ul items={[
                'Sprachaufzeichnung des Gesprächs (sofern Sie zu Beginn des Gesprächs Ihre Einwilligung erteilt haben)',
                'Transkription des Gesprächsinhalts',
                'Ihre Telefonnummer (sofern nicht unterdrückt)',
                'Zeitpunkt und Dauer des Anrufs',
                'Im Gespräch genannte Kontaktdaten und Anfrageinhalte',
              ]} />
              <p className="font-medium mt-3 mb-1">Hinweispflicht und Einwilligung</p>
              <p>
                Zu Beginn jedes Anrufs werden Sie automatisch darüber informiert, dass das Gespräch durch einen KI-Agenten geführt und ggf. aufgezeichnet wird. Eine Aufzeichnung erfolgt nur, wenn Sie Ihre ausdrückliche Einwilligung erteilen. Sie haben das Recht, das Gespräch jederzeit zu beenden oder einen menschlichen Ansprechpartner zu verlangen.
              </p>
              <p className="font-medium mt-3 mb-1">Rechtsgrundlage</p>
              <p>
                Die Verarbeitung von Gesprächsinhalten und Transkriptionen erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) und Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen). Aufzeichnungen werden nur mit Ihrer ausdrücklichen Einwilligung gemäß § 201 StGB (Verletzung der Vertraulichkeit des Wortes) vorgenommen.
              </p>
              <p className="font-medium mt-3 mb-1">Speicherdauer</p>
              <p>
                Sprachaufzeichnungen und Transkriptionen werden für maximal 6 Monate gespeichert und anschließend automatisch gelöscht, sofern sie nicht für die Vertragsanbahnung oder -erfüllung weiterhin erforderlich sind.
              </p>
            </Section>

            <Section num="8" title="Kalenderverknüpfung und Terminbuchungen">
              <p>
                Über unsere Website und unsere KI-Agenten (Chat und Voice) besteht die Möglichkeit, direkt Termine zu buchen. Hierzu nutzen wir eine Kalenderintegration (z. B. via Kalender-API oder Buchungstools wie Calendly, Cal.com oder vergleichbare Dienste).
              </p>
              <p className="font-medium mt-3 mb-1">Welche Daten werden erfasst?</p>
              <Ul items={[
                'Name und Kontaktdaten (E-Mail, Telefon)',
                'Gewünschter Termin (Datum, Uhrzeit)',
                'Beratungsthema / Anfrageart',
                'Ggf. weitere von Ihnen freiwillig angegebene Informationen',
              ]} />
              <p className="font-medium mt-3 mb-1">Zweck der Verarbeitung</p>
              <p>
                Die im Rahmen der Terminbuchung erhobenen Daten werden ausschließlich zur Koordination, Bestätigung und Durchführung des gebuchten Beratungstermins verwendet. Sie erhalten automatisch eine Terminbestätigung sowie ggf. eine Erinnerung per E-Mail oder SMS.
              </p>
              <p className="font-medium mt-3 mb-1">Weitergabe an Dritte</p>
              <p>
                Sofern für die Terminbuchung ein Drittanbieter (z. B. ein Kalender- oder Buchungstool) eingesetzt wird, werden Ihre Daten an diesen Anbieter übermittelt. Der Einsatz erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Zwischen der Akrona GmbH und dem Drittanbieter besteht ein Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO.
              </p>
              <p className="font-medium mt-3 mb-1">Speicherdauer</p>
              <p>
                Termindaten werden für die Dauer von 24 Monaten nach dem Termin gespeichert. Im Falle einer weiterführenden Geschäftsbeziehung gelten die gesetzlichen Aufbewahrungsfristen (6–10 Jahre).
              </p>
            </Section>

            <Section num="9" title="CRM-System und Lead-Management">
              <p>
                Eingehende Anfragen über Kontaktformulare, Chat-Agent, Voice-Agent und Terminbuchungen werden in einem CRM-System (Customer Relationship Management) erfasst und verwaltet. Dies ermöglicht uns eine strukturierte Bearbeitung und Nachverfolgung Ihrer Anfragen.
              </p>
              <p className="mt-3">
                Die Datenverarbeitung im CRM erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen). Sie haben das Recht, der Verarbeitung zu widersprechen (Art. 21 DSGVO). Zwischen der Akrona GmbH und dem CRM-Anbieter besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.
              </p>
            </Section>

            <Section num="10" title="Cookies und Website-Tracking">
              <p>
                Diese Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Wir unterscheiden zwischen technisch notwendigen Cookies, die keine Einwilligung erfordern, und optionalen Cookies (z. B. für Analyse- oder Marketingzwecke), für die wir vorab Ihre Einwilligung einholen.
              </p>
              <p className="mt-3">
                Beim ersten Besuch unserer Website wird Ihnen ein Cookie-Banner angezeigt, über den Sie Ihre Präferenzen festlegen können. Sie können Cookies jederzeit in den Einstellungen Ihres Browsers deaktivieren oder löschen. Bitte beachten Sie, dass dies die Funktionalität der Website einschränken kann.
              </p>
            </Section>

            <Section num="11" title="WhatsApp-Kommunikation">
              <p>
                Wenn Sie uns über WhatsApp kontaktieren, verarbeiten wir die von Ihnen gesendeten Daten (Nachrichten, Kontaktdaten) zur Bearbeitung Ihrer Anfrage. Bitte beachten Sie, dass WhatsApp (Meta Platforms Ireland Limited) eigene Datenschutzrichtlinien hat. Wir empfehlen, sensible Informationen nicht über WhatsApp zu übermitteln. Die Kommunikation erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b und f DSGVO.
              </p>
            </Section>

            <Section num="12" title="Ihre Rechte als betroffene Person">
              <p>Sie haben gegenüber der Akrona GmbH folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>
              <Ul items={[
                'Recht auf Auskunft (Art. 15 DSGVO)',
                'Recht auf Berichtigung (Art. 16 DSGVO)',
                'Recht auf Löschung (Art. 17 DSGVO) – Recht auf Vergessenwerden',
                'Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)',
                'Recht auf Datenübertragbarkeit (Art. 20 DSGVO)',
                'Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)',
                'Recht auf Widerruf einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO)',
                'Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)',
              ]} />
              <p className="mt-3">Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:</p>
              <p className="mt-2" style={{ color: '#6b6b6b' }}>
                E-Mail: <a href="mailto:info@akrona.de" style={{ color: '#0A3D2C' }}>info@akrona.de</a><br />
                Post: Akrona GmbH, Esslingen Str. 9, 73207 Plochingen
              </p>
            </Section>

            <Section num="13" title="Beschwerderecht bei der Aufsichtsbehörde">
              <p>
                Sie haben das Recht, sich bei der zuständigen Datenschutzaufsichtsbehörde über unsere Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Die zuständige Aufsichtsbehörde für die Akrona GmbH ist:
              </p>
              <p className="mt-3" style={{ color: '#6b6b6b' }}>
                Landesbeauftragter für den Datenschutz und die Informationsfreiheit Baden-Württemberg<br />
                Adresse: Lautenschlagerstraße 20, 70173 Stuttgart<br />
                Telefon: +49 711 615541-0<br />
                E-Mail: <a href="mailto:poststelle@lfdi.bwl.de" style={{ color: '#0A3D2C' }}>poststelle@lfdi.bwl.de</a><br />
                Website: <a href="https://www.baden-wuerttemberg.datenschutz.de" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D2C' }}>www.baden-wuerttemberg.datenschutz.de</a>
              </p>
            </Section>

            <Section num="14" title="Datensicherheit">
              <p>
                Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von http:// auf https:// wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
              </p>
              <p className="mt-3">
                Wir treffen angemessene technische und organisatorische Schutzmaßnahmen (TOMs) gemäß Art. 32 DSGVO, um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder den Zugriff unberechtigter Personen zu schützen.
              </p>
            </Section>

            <Section num="15" title="Aktualität und Änderung dieser Datenschutzerklärung">
              <p>
                Diese Datenschutzerklärung hat den aktuellen Stand und ist gültig. Durch die Weiterentwicklung unserer Website und Angebote oder aufgrund geänderter gesetzlicher beziehungsweise behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern. Die jeweils aktuelle Datenschutzerklärung kann jederzeit auf der Website von Ihnen abgerufen und ausgedruckt werden.
              </p>
            </Section>

            <div style={{ borderTop: '1px solid #E8E2D9', paddingTop: '24px', color: '#6b6b6b', fontSize: '12px' }}>
              <p>Stand: April 2026</p>
              <p className="mt-1">Akrona GmbH | Alperen Akbal | <a href="mailto:info@akrona.de" style={{ color: '#0A3D2C' }}>info@akrona.de</a></p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
