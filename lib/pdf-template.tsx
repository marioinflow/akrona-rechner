import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import path from 'path';
import type { LeadFormData } from '@/types';
import type {
  BaufinanzierungErgebnis,
  PrivatkreditErgebnis,
  BaufinanzierungEingaben,
  PrivatkreditEingaben,
} from '@/types';
import { translations } from '@/lib/translations';

// ─── Asset Paths ───────────────────────────────────────────
const LOGO   = path.join(process.cwd(), 'public', 'akrona-logo-transparent.png');
const TEAM   = path.join(process.cwd(), 'public', 'akrona-team.jpeg');
const ALPEREN = path.join(process.cwd(), 'public', 'alperen-akbal.jpeg');

// ─── Colors ───────────────────────────────────────────
const C = {
  darkGreen:  '#0A3D2C',
  lightGreen: '#0A5D3F',
  gold:       '#D4AF37',
  bg:         '#F7F5F0',
  border:     '#E8E2D9',
  muted:      '#6b6b6b',
  white:      '#FFFFFF',
  text:       '#1a1a1a',
};

// ─── Helpers ───────────────────────────────────────────
function getT(lang: 'de' | 'ro') {
  return (translations[lang] ?? translations.de) as typeof translations.de;
}

function fEuro(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function fPct(n: number) {
  return (n * 100).toFixed(1) + ' %';
}

function getBonitaetColor(label: string) {
  if (label === 'Sehr gut') return { bg: 'rgba(212,175,55,0.12)', dot: C.gold, text: C.gold };
  if (label === 'Mittel')   return { bg: 'rgba(255,193,7,0.1)',   dot: '#f5c842', text: '#c49a00' };
  return { bg: 'rgba(255,100,100,0.1)', dot: '#ef4444', text: '#ef4444' };
}

function translateBonitaet(label: string, t: typeof translations.de): string {
  if (label === 'Sehr gut') return t.veryGood;
  if (label === 'Mittel')   return t.medium;
  return t.basis;
}

function getValidUntil(lang: 'de' | 'ro'): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ─── Styles ───────────────────────────────────────────
const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: C.white, padding: 0 },

  // ── Cover ──
  coverPage:        { backgroundColor: C.darkGreen, flex: 1 },
  coverBorderOuter: { position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, border: '1.5px solid rgba(212,175,55,0.35)' },
  coverBorderInner: { position: 'absolute', top: 22, left: 22, right: 22, bottom: 22, border: '0.5px solid rgba(212,175,55,0.15)' },
  coverInner:       { padding: 48, flex: 1 },

  coverLogoWrap:  { alignItems: 'center', marginBottom: 2 },
  coverLogoImg:   { width: 200, height: 66 },
  coverLogoSub:   { fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textAlign: 'center', marginTop: 4 },

  coverCenter:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverOrnamentWrap:    { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  coverOrnamentLine:    { width: 50, height: 1, backgroundColor: C.gold, opacity: 0.5 },
  coverOrnamentDiamond: { width: 6, height: 6, backgroundColor: C.gold, marginHorizontal: 10 },
  coverEyebrow:  { fontSize: 8, color: C.gold, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' },
  coverTitle:    { fontSize: 26, fontFamily: 'Helvetica-Bold', color: C.white, lineHeight: 1.25, marginBottom: 8, textAlign: 'center' },
  coverSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 16, letterSpacing: 0.5, textAlign: 'center' },

  coverTeamBorder: { border: '2px solid rgba(212,175,55,0.55)', borderRadius: 4, alignItems: 'center' },
  coverTeamImg:    { width: 330, height: 185 },

  coverMeta:      { borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: 18, marginTop: 8 },
  coverMetaRow:   { flexDirection: 'row', marginBottom: 10 },
  coverMetaItem:  { flex: 1 },
  coverMetaLabel: { fontSize: 7.5, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 },
  coverMetaValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.white },

  coverFooterText: { fontSize: 7.5, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 14 },

  // ── Content Pages ──
  contentPage:          { backgroundColor: C.white, flex: 1 },
  contentHeader:        { backgroundColor: C.darkGreen, paddingHorizontal: 36, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contentHeaderLogo:    { width: 140, height: 46 },
  contentHeaderRight:   { fontSize: 8.5, color: 'rgba(255,255,255,0.5)' },
  contentHeaderDivider: { height: 2, backgroundColor: C.gold, opacity: 0.7 },
  contentBody:          { padding: 36, flex: 1 },
  contentFooter:        { backgroundColor: C.bg, borderTop: '1px solid #E8E2D9', paddingHorizontal: 36, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contentFooterText:    { fontSize: 7.5, color: '#aaa' },

  sectionEyebrow: { fontSize: 7.5, color: C.lightGreen, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 },
  sectionTitle:   { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.darkGreen, marginBottom: 18 },

  // Tables
  table:          { marginBottom: 16 },
  tableRow:       { flexDirection: 'row', borderBottom: '1px solid #E8E2D9', paddingVertical: 8 },
  tableRowAlt:    { backgroundColor: C.bg, paddingHorizontal: 6 },
  tableRowTotal:  { backgroundColor: C.darkGreen, paddingHorizontal: 6, paddingVertical: 9 },
  tableLabel:     { fontSize: 9.5, color: C.muted, flex: 1 },
  tableValue:     { fontSize: 9.5, color: C.text, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  tableLabelTotal: { fontSize: 9.5, color: C.white, flex: 1, fontFamily: 'Helvetica-Bold' },
  tableValueTotal: { fontSize: 9.5, color: C.gold, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  // Result Cards
  resultsGrid:         { flexDirection: 'row', marginBottom: 16 },
  resultCardMain:      { flex: 1, backgroundColor: C.darkGreen, borderRadius: 8, padding: 14, marginRight: 8 },
  resultCardMainLabel: { fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  resultCardMainValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.gold },
  resultCard:          { flex: 1, backgroundColor: C.bg, borderRadius: 8, padding: 14, marginRight: 8, border: '1px solid #E8E2D9' },
  resultCardLabel:     { fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  resultCardValue:     { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.darkGreen },

  // Bonitäts Badge
  bonitaetBadge:  { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 8, marginBottom: 16, border: '1px solid rgba(212,175,55,0.25)' },
  bonitaetDot:    { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  bonitaetLabel:  { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  bonitaetSub:    { fontSize: 8.5, color: C.muted, marginTop: 2 },

  // Tilgungsplan
  planHeader:          { flexDirection: 'row', backgroundColor: C.darkGreen, paddingVertical: 7, paddingHorizontal: 10, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  planHeaderCell:      { fontSize: 8.5, color: C.white, fontFamily: 'Helvetica-Bold', flex: 1, textAlign: 'right' },
  planHeaderCellFirst: { textAlign: 'left' },
  planRow:             { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10, borderBottom: '1px solid #E8E2D9' },
  planRowAlt:          { backgroundColor: C.bg },
  planCell:            { fontSize: 8.5, color: C.text, flex: 1, textAlign: 'right' },
  planCellFirst:       { color: C.darkGreen, fontFamily: 'Helvetica-Bold', textAlign: 'left' },

  // ── Voucher Page ──
  voucherPage:   { backgroundColor: C.darkGreen, flex: 1 },
  voucherBorder: { position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, border: '1.5px solid rgba(212,175,55,0.35)' },
  voucherInner:  { padding: 44, flex: 1 },

  voucherTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  voucherEyebrow: { fontSize: 8, color: C.gold, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 8 },
  voucherTitle:   { fontSize: 22, fontFamily: 'Helvetica-Bold', color: C.white, lineHeight: 1.2 },
  voucherLogoImg: { width: 130, height: 43 },

  voucherStep:        { flexDirection: 'row', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.07)' },
  voucherStepNum:     { width: 30, height: 30, borderRadius: 15, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 },
  voucherStepNumText: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.darkGreen },
  voucherStepTitle:   { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 3 },
  voucherStepText:    { fontSize: 9, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 },

  voucherCert:         { borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.5)', borderStyle: 'dashed', borderRadius: 8, padding: 18, marginTop: 12 },
  voucherCertEyebrow:  { fontSize: 7.5, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  voucherCertTitle:    { fontSize: 17, fontFamily: 'Helvetica-Bold', color: C.gold, marginBottom: 12 },
  voucherServiceRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 7 },
  voucherServiceCheck: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(212,175,55,0.5)', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 1, flexShrink: 0 },
  voucherCheckText:    { fontSize: 8, color: C.gold },
  voucherServiceText:  { fontSize: 9.5, color: 'rgba(255,255,255,0.8)', flex: 1, lineHeight: 1.5 },

  voucherCodeRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(212,175,55,0.2)' },
  voucherCodeLabel: { fontSize: 7.5, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  voucherCodeValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.gold, letterSpacing: 2, backgroundColor: 'rgba(212,175,55,0.08)', padding: '5 10', borderRadius: 4, border: '1px solid rgba(212,175,55,0.25)' },
  voucherValidLabel: { fontSize: 7.5, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4, textAlign: 'right' },
  voucherValidValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.7)', textAlign: 'right' },

  voucherContact:     { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: '12 14', backgroundColor: 'rgba(212,175,55,0.05)', borderRadius: 6, borderLeft: '3px solid rgba(212,175,55,0.4)' },
  voucherPortraitWrap: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', marginRight: 14, flexShrink: 0, border: '2px solid rgba(212,175,55,0.6)' },
  voucherPortrait:     { width: 52, height: 52 },
  voucherContactName:  { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.gold, marginBottom: 3 },
  voucherContactInfo:  { fontSize: 8.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 },

  voucherDisclaimer:     { marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' },
  voucherDisclaimerText: { fontSize: 7, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 },
});

// ─── Page Header (content pages) ─────────────────────────
function ContentHeader({ name, pageLabel }: { name: string; pageLabel: string }) {
  return (
    <>
      <View style={s.contentHeader}>
        <Image src={LOGO} style={s.contentHeaderLogo} />
        <Text style={s.contentHeaderRight}>{name} · {pageLabel}</Text>
      </View>
      <View style={s.contentHeaderDivider} />
    </>
  );
}

// ─── Page Footer ─────────────────────────────────────────
function ContentFooter({ page, total }: { page: number; total: number }) {
  return (
    <View style={s.contentFooter}>
      <Text style={s.contentFooterText}>Akrona GmbH · § 34i GewO · IHK Region Stuttgart</Text>
      <Text style={s.contentFooterText}>Seite {page} von {total}</Text>
    </View>
  );
}

// ─── Seite 1: Deckblatt ──────────────────────────────────
function CoverPage({ vorname, nachname, typ, datum, t }: {
  vorname: string; nachname: string; typ: string; datum: string;
  t: typeof translations.de;
}) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.coverPage}>
        <View style={s.coverBorderOuter} />
        <View style={s.coverBorderInner} />
        <View style={s.coverInner}>

          {/* Logo */}
          <View style={s.coverLogoWrap}>
            <Image src={LOGO} style={s.coverLogoImg} />
            <Text style={s.coverLogoSub}>§ 34c &amp; § 34i GewO · IHK Region Stuttgart</Text>
          </View>

          {/* Center: Ornament + Title + Team Photo */}
          <View style={s.coverCenter}>
            <View style={s.coverOrnamentWrap}>
              <View style={s.coverOrnamentLine} />
              <View style={s.coverOrnamentDiamond} />
              <View style={s.coverOrnamentLine} />
            </View>

            <Text style={s.coverEyebrow}>{t.personalFinancingEvaluation}</Text>
            <Text style={s.coverTitle}>{t.yourIndividualFinancingAnalysis}</Text>
            <Text style={s.coverSubtitle}>{typ} · {t.confidential}</Text>

            {/* Team Photo */}
            <View style={s.coverTeamBorder}>
              <Image src={TEAM} style={s.coverTeamImg} />
            </View>
          </View>

          {/* Meta Grid */}
          <View style={s.coverMeta}>
            <View style={s.coverMetaRow}>
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>{t.createdFor}</Text>
                <Text style={s.coverMetaValue}>{vorname} {nachname}</Text>
              </View>
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>{t.calculatorType}</Text>
                <Text style={s.coverMetaValue}>{typ}</Text>
              </View>
            </View>
            <View style={s.coverMetaRow}>
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>{t.dateLabel}</Text>
                <Text style={s.coverMetaValue}>{datum}</Text>
              </View>
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>{t.advisor}</Text>
                <Text style={s.coverMetaValue}>Alperen Akbal</Text>
              </View>
            </View>
          </View>

          <Text style={s.coverFooterText}>{t.pdfDisclaimerCover}</Text>
        </View>
      </View>
    </Page>
  );
}

// ─── Seite 2: Angaben ────────────────────────────────────
function AngabenPage({ vorname, nachname, typ, eingaben, t, totalPages }: {
  vorname: string; nachname: string; typ: string;
  eingaben: BaufinanzierungEingaben | PrivatkreditEingaben;
  t: typeof translations.de;
  totalPages: number;
}) {
  const rows: { label: string; value: string }[] = [];
  const statusMap: Record<string, string> = {
    angestellt:      t.employed,
    beamter:         t.civilServant,
    selbststaendig:  t.selfEmployed,
    rente:           t.pensioner,
  };
  const verwendungMap: Record<string, string> = {
    kauf:                   t.purchase,
    neubau:                 t.newConstruction,
    anschlussfinanzierung:  t.refinancing,
  };

  if (typ === 'Baufinanzierung') {
    const e = eingaben as BaufinanzierungEingaben;
    rows.push(
      { label: t.monthlyNetIncome, value: fEuro(e.nettoeinkommen) },
      { label: t.downPaymentEquity, value: fEuro(e.eigenkapital) },
      { label: t.householdSize, value: `${e.haushaltsgroesse}${e.haushaltsgroesse >= 5 ? '+' : ''} ${t.persons}` },
      { label: t.duration, value: `${e.laufzeit} ${t.years}` },
      { label: t.repaymentRate, value: fPct(e.tilgungssatz ?? 0.02) },
      { label: t.employmentStatus, value: statusMap[e.status] ?? e.status },
      { label: t.purpose, value: verwendungMap[e.verwendungszweck] ?? e.verwendungszweck },
    );
    if (e.kaufpreis) {
      rows.push(
        { label: t.purchasePrice, value: fEuro(e.kaufpreis) },
        { label: t.federalState, value: e.bundesland ?? '–' },
        { label: t.brokerFee, value: `${e.maklergebuehr ?? 0} %` },
      );
    }
    if (e.wohnsitzland)       rows.push({ label: t.countryOfResidence, value: e.wohnsitzland });
    if (e.staatsangehoerigkeit) rows.push({ label: t.citizenship, value: e.staatsangehoerigkeit });
  } else {
    const e = eingaben as PrivatkreditEingaben;
    rows.push(
      { label: t.monthlyNetIncome, value: fEuro(e.nettoeinkommen) },
      { label: t.desiredLoanAmount, value: e.wunschkredit ? fEuro(e.wunschkredit) : t.maxPossible },
      { label: t.householdSize, value: `${e.haushaltsgroesse}${e.haushaltsgroesse >= 5 ? '+' : ''} ${t.persons}` },
      { label: t.duration, value: `${e.laufzeit} ${t.months}` },
      { label: t.employmentStatus, value: statusMap[e.status] ?? e.status },
    );
  }

  return (
    <Page size="A4" style={s.page}>
      <View style={s.contentPage}>
        <ContentHeader name={`${vorname} ${nachname}`} pageLabel={t.yourDetails} />
        <View style={s.contentBody}>
          <Text style={s.sectionEyebrow}>{t.inputData}</Text>
          <Text style={s.sectionTitle}>{t.yourDetailsAtAGlance}</Text>
          <View style={s.table}>
            {rows.map((row, i) => (
              <View key={row.label} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={s.tableLabel}>{row.label}</Text>
                <Text style={s.tableValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
        <ContentFooter page={2} total={totalPages} />
      </View>
    </Page>
  );
}

// ─── Seite 3: Ergebnis ───────────────────────────────────
function ErgebnisPage({ vorname, nachname, typ, ergebnis, eingaben, t, totalPages }: {
  vorname: string; nachname: string; typ: string;
  ergebnis: BaufinanzierungErgebnis | PrivatkreditErgebnis;
  eingaben: BaufinanzierungEingaben | PrivatkreditEingaben;
  t: typeof translations.de;
  totalPages: number;
}) {
  const bc = getBonitaetColor(ergebnis.bonitaetLabel);
  const isBau = typ === 'Baufinanzierung';
  const bauErg  = isBau ? ergebnis as BaufinanzierungErgebnis : null;
  const privErg = !isBau ? ergebnis as PrivatkreditErgebnis : null;
  const bauEing = isBau ? eingaben as BaufinanzierungEingaben : null;
  const translatedLabel = translateBonitaet(ergebnis.bonitaetLabel, t);

  return (
    <Page size="A4" style={s.page}>
      <View style={s.contentPage}>
        <ContentHeader name={`${vorname} ${nachname}`} pageLabel={t.result} />
        <View style={s.contentBody}>
          <Text style={s.sectionEyebrow}>{t.yourInitialAssessment}</Text>
          <Text style={s.sectionTitle}>{t.calculationResult}</Text>

          {/* Bonitäts-Badge */}
          <View style={[s.bonitaetBadge, { backgroundColor: bc.bg }]}>
            <View style={[s.bonitaetDot, { backgroundColor: bc.dot }]} />
            <View>
              <Text style={[s.bonitaetLabel, { color: bc.text }]}>
                {t.creditScoreLabel.replace('{label}', translatedLabel)}
              </Text>
              <Text style={s.bonitaetSub}>
                {t.scoreAndBaseRate.replace('{score}', String(ergebnis.bonitaetScore)).replace('{rate}', fPct(ergebnis.zinssatz))}
              </Text>
            </View>
          </View>

          {/* Ergebnis-Karten */}
          <View style={s.resultsGrid}>
            <View style={s.resultCardMain}>
              <Text style={s.resultCardMainLabel}>{t.monthlyInstallment}</Text>
              <Text style={s.resultCardMainValue}>{fEuro(ergebnis.monatsRate)}</Text>
            </View>
            {bauErg && (
              <View style={s.resultCard}>
                <Text style={s.resultCardLabel}>{t.financingNeed}</Text>
                <Text style={s.resultCardValue}>{fEuro(bauErg.finanzierungsbedarf)}</Text>
              </View>
            )}
            {bauErg && (
              <View style={[s.resultCard, { marginRight: 0 }]}>
                <Text style={s.resultCardLabel}>{t.maxCreditLimit}</Text>
                <Text style={s.resultCardValue}>{fEuro(bauErg.maxKredit)}</Text>
              </View>
            )}
            {privErg && (
              <View style={s.resultCard}>
                <Text style={s.resultCardLabel}>{t.creditAmount}</Text>
                <Text style={s.resultCardValue}>{fEuro(privErg.aktuellerKredit)}</Text>
              </View>
            )}
            {privErg && (
              <View style={[s.resultCard, { marginRight: 0 }]}>
                <Text style={s.resultCardLabel}>{t.totalAmount}</Text>
                <Text style={s.resultCardValue}>{fEuro(privErg.gesamtkosten)}</Text>
              </View>
            )}
          </View>

          {/* Baufinanzierung: vollständige Übersicht */}
          {bauErg && (
            <>
              <Text style={[s.sectionEyebrow, { marginTop: 4 }]}>{t.completeOverview}</Text>
              <View style={s.table}>
                {[
                  { label: t.maxCreditLimit,         value: fEuro(bauErg.maxKredit) },
                  { label: t.totalPurchasingPower,   value: fEuro(bauErg.kaufkraft) },
                  { label: t.financingNeed,          value: fEuro(bauErg.finanzierungsbedarf) },
                  { label: t.interestRatePa,         value: fPct(bauErg.zinssatz) },
                  { label: t.repaymentRate + ' p.a.', value: fPct(bauEing?.tilgungssatz ?? 0.02) },
                  { label: t.monthlyInstallment,     value: fEuro(bauErg.monatsRate) },
                  { label: t.duration,               value: `${bauEing?.laufzeit ?? '–'} ${t.years}` },
                ].map((row, i) => (
                  <View key={row.label} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                    <Text style={s.tableLabel}>{row.label}</Text>
                    <Text style={s.tableValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Kaufnebenkosten */}
          {bauErg?.gesamtkaufkosten && bauEing?.kaufpreis && (
            <>
              <Text style={[s.sectionEyebrow, { marginTop: 4 }]}>{t.purchaseAdditionalCosts}</Text>
              <View style={s.table}>
                {[
                  { label: t.purchasePrice, value: fEuro(bauEing.kaufpreis), total: false },
                  { label: `${t.propertyTransferTax} (${bauEing.bundesland ?? 'Bayern'})`, value: fEuro(bauErg.grunderwerbsteuer ?? 0), total: false },
                  { label: `${t.brokerFee} (${bauEing.maklergebuehr ?? 0} %)`, value: fEuro(bauErg.maklergebuehr ?? 0), total: false },
                  { label: t.notaryAndLandRegister, value: fEuro((bauErg.nebenkosten ?? 0) - (bauErg.grunderwerbsteuer ?? 0) - (bauErg.maklergebuehr ?? 0)), total: false },
                  { label: t.totalAdditionalCosts, value: fEuro(bauErg.nebenkosten ?? 0), total: false },
                  { label: t.downPaymentEquity, value: fEuro(bauEing.eigenkapital), total: false },
                  { label: t.totalPurchaseCosts, value: fEuro(bauErg.gesamtkaufkosten), total: true },
                ].map((row, i) => (
                  <View key={row.label} style={[s.tableRow, row.total ? s.tableRowTotal : (i % 2 === 1 ? s.tableRowAlt : {})]}>
                    <Text style={row.total ? s.tableLabelTotal : s.tableLabel}>{row.label}</Text>
                    <Text style={row.total ? s.tableValueTotal : s.tableValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Privatkredit: vollständige Übersicht */}
          {privErg && (
            <>
              <Text style={[s.sectionEyebrow, { marginTop: 4 }]}>{t.loanOverview}</Text>
              <View style={s.table}>
                {[
                  { label: t.maxCreditLimit,   value: fEuro(privErg.maxKredit) },
                  { label: t.creditAmount,      value: fEuro(privErg.aktuellerKredit) },
                  { label: t.interestRatePa,    value: fPct(privErg.zinssatz) },
                  { label: t.monthlyInstallment, value: fEuro(privErg.monatsRate) },
                  { label: t.totalInterestCosts, value: fEuro(privErg.gesamtkosten - privErg.aktuellerKredit) },
                  { label: t.totalAmount,        value: fEuro(privErg.gesamtkosten) },
                ].map((row, i) => (
                  <View key={row.label} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                    <Text style={s.tableLabel}>{row.label}</Text>
                    <Text style={s.tableValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
        <ContentFooter page={3} total={totalPages} />
      </View>
    </Page>
  );
}

// ─── Seite 4: Tilgungsplan ───────────────────────────────
function TilgungsplanPage({ vorname, nachname, bauErg, t, totalPages }: {
  vorname: string; nachname: string;
  bauErg: BaufinanzierungErgebnis;
  t: typeof translations.de;
  totalPages: number;
}) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.contentPage}>
        <ContentHeader name={`${vorname} ${nachname}`} pageLabel={t.yearlyRepaymentPlan} />
        <View style={s.contentBody}>
          <Text style={s.sectionEyebrow}>{t.yearlyRepaymentPlanCheckpoints}</Text>
          <Text style={s.sectionTitle}>{t.yearlyRepaymentPlan}</Text>
          <View>
            <View style={s.planHeader}>
              <Text style={[s.planHeaderCell, s.planHeaderCellFirst]}>{t.year}</Text>
              <Text style={s.planHeaderCell}>{t.residualDebt}</Text>
              <Text style={s.planHeaderCell}>{t.paidInterest}</Text>
              <Text style={s.planHeaderCell}>{t.paidRepayment}</Text>
            </View>
            {bauErg.tilgungsplan!.map((p, i) => (
              <View key={p.jahr} style={[s.planRow, i % 2 === 0 ? s.planRowAlt : {}]}>
                <Text style={[s.planCell, s.planCellFirst]}>{p.jahr}. {t.year}</Text>
                <Text style={s.planCell}>{fEuro(p.restschuld)}</Text>
                <Text style={s.planCell}>{fEuro(p.gezahlteZinsen)}</Text>
                <Text style={s.planCell}>{fEuro(p.gezahltesTilgung)}</Text>
              </View>
            ))}
          </View>
        </View>
        <ContentFooter page={4} total={totalPages} />
      </View>
    </Page>
  );
}

// ─── Seite 5: Nächste Schritte + Gutschein ───────────────
function VoucherPage({ vorname, nachname, lang, t }: {
  vorname: string; nachname: string;
  lang: 'de' | 'ro';
  t: typeof translations.de;
}) {
  const validUntil = getValidUntil(lang);
  const steps = [
    { title: t.personalConsultation,    text: t.personalConsultationDesc },
    { title: t.prepareDocuments,        text: t.prepareDocumentsDesc },
    { title: t.bankComparisonAndOffer,  text: t.bankComparisonAndOfferDesc },
  ];
  const date = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  const disclaimer = t.pdfFinalDisclaimer
    .replace('{date}', date)
    .replace('{name}', `${vorname} ${nachname}`);

  return (
    <Page size="A4" style={s.page}>
      <View style={s.voucherPage}>
        <View style={s.voucherBorder} />
        <View style={s.voucherInner}>

          {/* Top: Eyebrow + Title (left) | Logo (right) */}
          <View style={s.voucherTopRow}>
            <View>
              <Text style={s.voucherEyebrow}>{t.nextSteps}</Text>
              <Text style={s.voucherTitle}>{t.yourPathToFinancing}</Text>
            </View>
            <Image src={LOGO} style={s.voucherLogoImg} />
          </View>

          {/* Steps */}
          {steps.map((step, i) => (
            <View key={i} style={s.voucherStep}>
              <View style={s.voucherStepNum}>
                <Text style={s.voucherStepNumText}>{String(i + 1).padStart(2, '0')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.voucherStepTitle}>{step.title}</Text>
                <Text style={s.voucherStepText}>{step.text}</Text>
              </View>
            </View>
          ))}

          {/* Voucher Certificate */}
          <View style={s.voucherCert}>
            <Text style={s.voucherCertEyebrow}>{t.voucherEyebrow}</Text>
            <Text style={s.voucherCertTitle}>{t.voucherWeGiveYou}</Text>

            <View style={s.voucherServiceRow}>
              <View style={s.voucherServiceCheck}>
                <Text style={s.voucherCheckText}>✓</Text>
              </View>
              <Text style={s.voucherServiceText}>
                <Text style={{ fontFamily: 'Helvetica-Bold', color: C.white }}>{t.voucherService1Title}</Text>
                {' — '}{t.voucherService1Desc}
              </Text>
            </View>

            <View style={s.voucherServiceRow}>
              <View style={s.voucherServiceCheck}>
                <Text style={s.voucherCheckText}>✓</Text>
              </View>
              <Text style={s.voucherServiceText}>
                <Text style={{ fontFamily: 'Helvetica-Bold', color: C.white }}>{t.voucherService2Title}</Text>
                {' — '}{t.voucherService2Desc}
              </Text>
            </View>

            <View style={s.voucherCodeRow}>
              <View>
                <Text style={s.voucherCodeLabel}>{t.voucherCodeLabel}</Text>
                <Text style={s.voucherCodeValue}>AKRONA-VORTEIL</Text>
              </View>
              <View>
                <Text style={s.voucherValidLabel}>{t.voucherValidUntil}</Text>
                <Text style={s.voucherValidValue}>{validUntil}</Text>
              </View>
            </View>
          </View>

          {/* Contact with Portrait */}
          <View style={s.voucherContact}>
            <View style={s.voucherPortraitWrap}>
              <Image src={ALPEREN} style={s.voucherPortrait} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.voucherContactName}>Alperen Akbal · {t.ceoTitle}</Text>
              <Text style={s.voucherContactInfo}>
                Akrona GmbH · E-Mail: info@akrona.de{'\n'}
                IHK Region Stuttgart · § 34c &amp; § 34i GewO
              </Text>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={s.voucherDisclaimer}>
            <Text style={s.voucherDisclaimerText}>{disclaimer}</Text>
          </View>

        </View>
      </View>
    </Page>
  );
}

// ─── Haupt-Dokument ──────────────────────────────────────
export function AkronaPDF({ data }: { data: LeadFormData }) {
  const { vorname, nachname, typ, eingaben, ergebnis } = data;
  const lang = data.lang ?? 'de';
  const t = getT(lang);
  const typLabel = typ === 'baufinanzierung' ? 'Baufinanzierung' : 'Privatkredit';
  const datum = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  const isBau = typ === 'baufinanzierung';
  const bauErg = isBau ? ergebnis as BaufinanzierungErgebnis : null;
  const hasTilgungsplan = !!(bauErg?.tilgungsplan?.length);
  const totalPages = hasTilgungsplan ? 5 : 4;

  return (
    <Document
      title={`Akrona Finanzierungsauswertung – ${vorname} ${nachname}`}
      author="Akrona GmbH"
      subject={t.personalFinancingEvaluation}
    >
      <CoverPage vorname={vorname} nachname={nachname} typ={typLabel} datum={datum} t={t} />
      <AngabenPage vorname={vorname} nachname={nachname} typ={typLabel} eingaben={eingaben} t={t} totalPages={totalPages} />
      <ErgebnisPage vorname={vorname} nachname={nachname} typ={typLabel} ergebnis={ergebnis} eingaben={eingaben} t={t} totalPages={totalPages} />
      {hasTilgungsplan && (
        <TilgungsplanPage vorname={vorname} nachname={nachname} bauErg={bauErg!} t={t} totalPages={totalPages} />
      )}
      <VoucherPage vorname={vorname} nachname={nachname} lang={lang} t={t} />
    </Document>
  );
}
