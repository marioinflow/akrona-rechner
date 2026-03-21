import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { LeadFormData } from '@/types';
import type { BaufinanzierungErgebnis, PrivatkreditErgebnis, BaufinanzierungEingaben, PrivatkreditEingaben } from '@/types';

// ─── Styles ───────────────────────────────────────────
const C = {
  darkGreen: '#0A3D2C',
  lightGreen: '#0A5D3F',
  gold: '#D4AF37',
  bg: '#F7F5F0',
  border: '#E8E2D9',
  muted: '#6b6b6b',
  white: '#FFFFFF',
  text: '#1a1a1a',
};

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: C.white, padding: 0 },

  // ── Deckblatt ──
  coverPage: { backgroundColor: C.darkGreen, flex: 1, padding: 56 },
  coverLogoText: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: C.gold, letterSpacing: 2, marginBottom: 4 },
  coverLogoSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 64 },
  coverLine: { width: 40, height: 1, backgroundColor: C.gold, marginBottom: 32, opacity: 0.6 },
  coverEyebrow: { fontSize: 10, color: C.gold, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  coverTitle: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: C.white, lineHeight: 1.2, marginBottom: 40, maxWidth: 400 },
  coverMeta: { marginTop: 'auto' as never },
  coverMetaRow: { flexDirection: 'row', marginBottom: 8 },
  coverMetaLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', width: 120 },
  coverMetaValue: { fontSize: 10, color: C.white, flex: 1 },
  coverFooter: { marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' },
  coverFooterText: { fontSize: 9, color: 'rgba(255,255,255,0.3)' },

  // ── Content Pages ──
  contentPage: { backgroundColor: C.white, flex: 1, padding: 48 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, paddingBottom: 16, borderBottom: `1px solid ${C.border}` },
  pageHeaderLogo: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.darkGreen },
  pageHeaderGold: { color: C.gold },
  pageHeaderRight: { fontSize: 9, color: C.muted, textAlign: 'right' },
  pageNumber: { fontSize: 9, color: C.muted },

  sectionEyebrow: { fontSize: 9, color: C.lightGreen, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.darkGreen, marginBottom: 20 },

  // ── Tabellen ──
  table: { marginBottom: 20 },
  tableRow: { flexDirection: 'row', borderBottom: `1px solid ${C.border}`, paddingVertical: 9 },
  tableRowAlt: { backgroundColor: C.bg },
  tableLabel: { fontSize: 10, color: C.muted, flex: 1 },
  tableValue: { fontSize: 10, color: C.text, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  // ── Ergebnis-Karten ──
  resultsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  resultCard: { flex: 1, backgroundColor: C.bg, borderRadius: 8, padding: 16 },
  resultCardLabel: { fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  resultCardValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.darkGreen },
  resultCardMain: { backgroundColor: C.darkGreen, flex: 1, borderRadius: 8, padding: 16 },
  resultCardMainLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  resultCardMainValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.gold },

  // ── Bonitäts-Badge ──
  bonitaetBadge: { flexDirection: 'row', alignItems: 'center', padding: '12 16', borderRadius: 8, marginBottom: 20 },
  bonitaetDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  bonitaetLabel: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  bonitaetSub: { fontSize: 9, color: C.muted, marginTop: 3 },

  // ── Tilgungsplan ──
  planHeader: { flexDirection: 'row', backgroundColor: C.darkGreen, padding: '8 12', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  planHeaderCell: { fontSize: 9, color: C.white, fontFamily: 'Helvetica-Bold', flex: 1, textAlign: 'right' },
  planHeaderCellFirst: { textAlign: 'left' },
  planRow: { flexDirection: 'row', padding: '8 12', borderBottom: `1px solid ${C.border}` },
  planCell: { fontSize: 9, color: C.text, flex: 1, textAlign: 'right' },
  planCellFirst: { color: C.darkGreen, fontFamily: 'Helvetica-Bold', textAlign: 'left' },

  // ── Nächste Schritte ──
  stepsPage: { backgroundColor: C.darkGreen, flex: 1, padding: 56 },
  stepItem: { flexDirection: 'row', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)' },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 },
  stepNumberText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.darkGreen },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 4 },
  stepText: { fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 },

  disclaimer: { marginTop: 32, padding: '16 20', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6 },
  disclaimerText: { fontSize: 8, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 },
});

// ─── Hilfsfunktionen ───────────────────────────────────────────
function fEuro(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
function fPct(n: number) {
  return (n * 100).toFixed(1) + ' %';
}

function getBonitaetColor(label: string) {
  if (label === 'Sehr gut') return { bg: 'rgba(212,175,55,0.12)', dot: C.gold, text: C.gold };
  if (label === 'Mittel') return { bg: 'rgba(255,193,7,0.1)', dot: '#f5c842', text: '#c49a00' };
  return { bg: 'rgba(255,100,100,0.1)', dot: '#ef4444', text: '#ef4444' };
}

function PageHeader({ name, page }: { name: string; page: string }) {
  return (
    <View style={s.pageHeader}>
      <Text style={s.pageHeaderLogo}>
        AKRONA <Text style={s.pageHeaderGold}>GmbH</Text>
      </Text>
      <Text style={s.pageHeaderRight}>{name} · {page}</Text>
    </View>
  );
}

// ─── Seite 1: Deckblatt ───────────────────────────────────────────
function CoverPage({ vorname, nachname, typ, datum }: { vorname: string; nachname: string; typ: string; datum: string }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.coverPage}>
        <Text style={s.coverLogoText}>AKRONA GmbH</Text>
        <Text style={s.coverLogoSub}>§ 34c & § 34i GewO · IHK Region Stuttgart</Text>

        <View style={s.coverLine} />
        <Text style={s.coverEyebrow}>Persönliche Finanzierungsauswertung</Text>
        <Text style={s.coverTitle}>
          Ihre individuelle{'\n'}Finanzierungsanalyse
        </Text>

        <View style={s.coverMeta}>
          {[
            { label: 'Erstellt für:', value: `${vorname} ${nachname}` },
            { label: 'Rechner-Typ:', value: typ },
            { label: 'Datum:', value: datum },
            { label: 'Berater:', value: 'Alperen Akbal' },
          ].map((row) => (
            <View key={row.label} style={s.coverMetaRow}>
              <Text style={s.coverMetaLabel}>{row.label}</Text>
              <Text style={s.coverMetaValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={s.coverFooter}>
          <Text style={s.coverFooterText}>
            Diese Auswertung ist eine unverbindliche Ersteinschätzung — keine Bankzusage.
          </Text>
        </View>
      </View>
    </Page>
  );
}

// ─── Seite 2: Ihre Angaben ───────────────────────────────────────────
function AngabenPage({ vorname, nachname, typ, eingaben }: {
  vorname: string; nachname: string; typ: string;
  eingaben: BaufinanzierungEingaben | PrivatkreditEingaben;
}) {
  const rows: { label: string; value: string }[] = [];

  if (typ === 'Baufinanzierung') {
    const e = eingaben as BaufinanzierungEingaben;
    rows.push(
      { label: 'Monatliches Nettoeinkommen', value: fEuro(e.nettoeinkommen) },
      { label: 'Eigenkapital', value: fEuro(e.eigenkapital) },
      { label: 'Haushaltsgröße', value: `${e.haushaltsgroesse}${e.haushaltsgroesse >= 5 ? '+' : ''} Person(en)` },
      { label: 'Laufzeit', value: `${e.laufzeit} Jahre` },
      { label: 'Beschäftigungsstatus', value: { angestellt: 'Angestellt', beamter: 'Beamter / Beamtin', selbststaendig: 'Selbstständig', rente: 'Rente' }[e.status] },
      { label: 'Verwendungszweck', value: { kauf: 'Kauf', neubau: 'Neubau', anschlussfinanzierung: 'Anschlussfinanzierung' }[e.verwendungszweck] },
    );
    if (e.kaufpreis) {
      rows.push(
        { label: 'Kaufpreis', value: fEuro(e.kaufpreis) },
        { label: 'Bundesland', value: e.bundesland ?? '–' },
        { label: 'Maklergebühr', value: `${e.maklergebuehr ?? 0} %` },
      );
    }
  } else {
    const e = eingaben as PrivatkreditEingaben;
    rows.push(
      { label: 'Monatliches Nettoeinkommen', value: fEuro(e.nettoeinkommen) },
      { label: 'Gewünschte Kreditsumme', value: e.wunschkredit ? fEuro(e.wunschkredit) : 'Max. möglich' },
      { label: 'Haushaltsgröße', value: `${e.haushaltsgroesse}${e.haushaltsgroesse >= 5 ? '+' : ''} Person(en)` },
      { label: 'Laufzeit', value: `${e.laufzeit} Monate` },
      { label: 'Beschäftigungsstatus', value: { angestellt: 'Angestellt', beamter: 'Beamter / Beamtin', selbststaendig: 'Selbstständig', rente: 'Rente' }[e.status] },
    );
  }

  return (
    <Page size="A4" style={s.page}>
      <View style={s.contentPage}>
        <PageHeader name={`${vorname} ${nachname}`} page="Ihre Angaben" />

        <Text style={s.sectionEyebrow}>Eingabedaten</Text>
        <Text style={s.sectionTitle}>Ihre Angaben im Überblick</Text>

        <View style={s.table}>
          {rows.map((row, i) => (
            <View key={row.label} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={s.tableLabel}>{row.label}</Text>
              <Text style={s.tableValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
}

// ─── Seite 3: Ergebnis ───────────────────────────────────────────
function ErgebnisPage({ vorname, nachname, typ, ergebnis, eingaben }: {
  vorname: string; nachname: string; typ: string;
  ergebnis: BaufinanzierungErgebnis | PrivatkreditErgebnis;
  eingaben: BaufinanzierungEingaben | PrivatkreditEingaben;
}) {
  const bc = getBonitaetColor(ergebnis.bonitaetLabel);
  const isBau = typ === 'Baufinanzierung';
  const bauErg = isBau ? ergebnis as BaufinanzierungErgebnis : null;
  const privErg = !isBau ? ergebnis as PrivatkreditErgebnis : null;

  return (
    <Page size="A4" style={s.page}>
      <View style={s.contentPage}>
        <PageHeader name={`${vorname} ${nachname}`} page="Ergebnis" />

        <Text style={s.sectionEyebrow}>Ihre Ersteinschätzung</Text>
        <Text style={s.sectionTitle}>Berechnungsergebnis</Text>

        {/* Bonitäts-Badge */}
        <View style={[s.bonitaetBadge, { backgroundColor: bc.bg }]}>
          <View style={[s.bonitaetDot, { backgroundColor: bc.dot }]} />
          <View>
            <Text style={[s.bonitaetLabel, { color: bc.text }]}>Bonität: {ergebnis.bonitaetLabel}</Text>
            <Text style={s.bonitaetSub}>Score: {ergebnis.bonitaetScore} · Zinssatz-Basis: {fPct(ergebnis.zinssatz)}</Text>
          </View>
        </View>

        {/* Ergebnis-Karten */}
        <View style={s.resultsGrid}>
          <View style={s.resultCardMain}>
            <Text style={s.resultCardMainLabel}>Max. {isBau ? 'Kreditsumme' : 'Kreditrahmen'}</Text>
            <Text style={s.resultCardMainValue}>{fEuro(ergebnis.maxKredit)}</Text>
          </View>
          <View style={s.resultCard}>
            <Text style={s.resultCardLabel}>Monatliche Rate</Text>
            <Text style={s.resultCardValue}>{fEuro(ergebnis.monatsRate)}</Text>
          </View>
          {bauErg && (
            <View style={s.resultCard}>
              <Text style={s.resultCardLabel}>Kaufkraft</Text>
              <Text style={s.resultCardValue}>{fEuro(bauErg.kaufkraft)}</Text>
            </View>
          )}
          {privErg && (
            <View style={s.resultCard}>
              <Text style={s.resultCardLabel}>Gesamtkosten</Text>
              <Text style={s.resultCardValue}>{fEuro(privErg.gesamtkosten)}</Text>
            </View>
          )}
        </View>

        {/* Gesamtkaufkosten bei Baufinanzierung mit Kaufpreis */}
        {bauErg?.gesamtkaufkosten && (eingaben as BaufinanzierungEingaben).kaufpreis && (
          <>
            <Text style={[s.sectionEyebrow, { marginTop: 8 }]}>Kaufnebenkosten</Text>
            <View style={s.table}>
              {[
                { label: 'Kaufpreis', value: fEuro((eingaben as BaufinanzierungEingaben).kaufpreis!) },
                { label: 'Grunderwerbsteuer', value: fEuro(bauErg.grunderwerbsteuer ?? 0) },
                { label: 'Makler & Notar', value: fEuro((bauErg.nebenkosten ?? 0) - (bauErg.grunderwerbsteuer ?? 0)) },
                { label: 'Gesamtkosten', value: fEuro(bauErg.gesamtkaufkosten) },
              ].map((row, i) => (
                <View key={row.label} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                  <Text style={s.tableLabel}>{row.label}</Text>
                  <Text style={s.tableValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Tilgungsplan */}
        {bauErg?.tilgungsplan && bauErg.tilgungsplan.length > 0 && (
          <>
            <Text style={[s.sectionEyebrow, { marginTop: 8 }]}>Jahres-Tilgungsplan (Stützpunkte)</Text>
            <View>
              <View style={s.planHeader}>
                <Text style={[s.planHeaderCell, s.planHeaderCellFirst]}>Jahr</Text>
                <Text style={s.planHeaderCell}>Restschuld</Text>
                <Text style={s.planHeaderCell}>Gez. Zinsen</Text>
                <Text style={s.planHeaderCell}>Gez. Tilgung</Text>
              </View>
              {bauErg.tilgungsplan.map((p, i) => (
                <View key={p.jahr} style={[s.planRow, i % 2 === 0 ? { backgroundColor: C.bg } : {}]}>
                  <Text style={[s.planCell, s.planCellFirst]}>{p.jahr}. Jahr</Text>
                  <Text style={s.planCell}>{fEuro(p.restschuld)}</Text>
                  <Text style={s.planCell}>{fEuro(p.gezahlteZinsen)}</Text>
                  <Text style={s.planCell}>{fEuro(p.gezahltesTilgung)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </Page>
  );
}

// ─── Seite 4: Nächste Schritte ───────────────────────────────────────────
function NextStepsPage({ vorname, nachname }: { vorname: string; nachname: string }) {
  const steps = [
    {
      title: 'Persönliches Beratungsgespräch',
      text: 'Kontaktieren Sie uns für ein unverbindliches Erstgespräch. Wir analysieren gemeinsam Ihre Finanzierungsmöglichkeiten bei verschiedenen Banken.',
    },
    {
      title: 'Unterlagen vorbereiten',
      text: 'Halten Sie Einkommensnachweise, Kontoauszüge und ggf. Exposés bereit. Je vollständiger Ihre Unterlagen, desto schneller die Bearbeitung.',
    },
    {
      title: 'Bankvergleich & Angebot',
      text: 'Wir vergleichen Angebote von über 400 Banken und Kreditgebern, um die optimalen Konditionen für Sie zu finden.',
    },
  ];

  return (
    <Page size="A4" style={s.page}>
      <View style={s.stepsPage}>
        <Text style={[s.coverLogoText, { fontSize: 18, marginBottom: 2 }]}>AKRONA GmbH</Text>
        <Text style={[s.coverLogoSub, { marginBottom: 48 }]}>IHK Region Stuttgart</Text>

        <Text style={[s.coverEyebrow, { marginBottom: 12 }]}>Nächste Schritte</Text>
        <Text style={[s.coverTitle, { fontSize: 22, marginBottom: 40 }]}>
          Ihr Weg zur{'\n'}Finanzierung
        </Text>

        {steps.map((step, i) => (
          <View key={i} style={s.stepItem}>
            <View style={s.stepNumber}>
              <Text style={s.stepNumberText}>{String(i + 1).padStart(2, '0')}</Text>
            </View>
            <View style={s.stepContent}>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepText}>{step.text}</Text>
            </View>
          </View>
        ))}

        <View style={{ marginTop: 24, padding: '20 24', backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: 8, borderLeft: '3px solid rgba(212,175,55,0.4)' }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.gold, marginBottom: 8 }}>
            Alperen Akbal · Akrona GmbH
          </Text>
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
            E-Mail: info@akrona-gmbh.de{'\n'}
            IHK Region Stuttgart · § 34c & § 34i GewO
          </Text>
        </View>

        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Diese Auswertung wurde am {new Date().toLocaleDateString('de-DE')} für {vorname} {nachname} erstellt und stellt eine unverbindliche Ersteinschätzung dar. Sie ist keine verbindliche Kreditzusage einer Bank. Die tatsächlichen Konditionen können je nach Bonität, Anbieter und Marktlage abweichen. Alle Berechnungen erfolgen nach den gängigen Bankfaustregeln.
          </Text>
        </View>
      </View>
    </Page>
  );
}

// ─── Haupt-Dokument ───────────────────────────────────────────
export function AkronaPDF({ data }: { data: LeadFormData }) {
  const { vorname, nachname, typ, eingaben, ergebnis } = data;
  const typLabel = typ === 'baufinanzierung' ? 'Baufinanzierung' : 'Privatkredit';
  const datum = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <Document
      title={`Akrona Finanzierungsauswertung – ${vorname} ${nachname}`}
      author="Akrona GmbH"
      subject="Persönliche Finanzierungsauswertung"
    >
      <CoverPage vorname={vorname} nachname={nachname} typ={typLabel} datum={datum} />
      <AngabenPage vorname={vorname} nachname={nachname} typ={typLabel} eingaben={eingaben} />
      <ErgebnisPage vorname={vorname} nachname={nachname} typ={typLabel} ergebnis={ergebnis} eingaben={eingaben} />
      <NextStepsPage vorname={vorname} nachname={nachname} />
    </Document>
  );
}
