/**
 * PDF-Template "Immobilien-Werteinschätzung" — @react-pdf/renderer.
 * Gleiche Designtokens wie lib/pdf-template.tsx (Akrona Brand).
 * WICHTIG: KEINE borderRadius-Kurzschreibweise (bekannter @react-pdf-Bug) —
 * immer einzelne Eigenschaften wie borderTopLeftRadius verwenden.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
} from '@react-pdf/renderer';
import path from 'path';
import type { BewertungEingaben, BewertungErgebnis, KonfidenzNote } from '@/types';
import { translations } from '@/lib/translations';
import { C } from '@/lib/pdf-template';

// ─── Asset Paths ───────────────────────────────────────────
const LOGO    = path.join(process.cwd(), 'public', 'akrona-logo-transparent.png');
const ALPEREN = path.join(process.cwd(), 'public', 'alperen-akbal.jpeg');

// ─── Helpers ───────────────────────────────────────────
function getT(lang: 'de' | 'ro') {
  return (translations[lang] ?? translations.de) as typeof translations.de;
}

function fEuro(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function konfidenzLabel(k: KonfidenzNote, t: typeof translations.de): string {
  if (k === 'Hoch') return t.bwKonfHoch;
  if (k === 'Mittel') return t.bwKonfMittel;
  return t.bwKonfNiedrig;
}

function getKonfidenzColor(k: KonfidenzNote) {
  if (k === 'Hoch')   return { bg: '#E6F4EC', dot: '#0A5D3F', text: '#0A5D3F', border: '#B8DACC' };
  if (k === 'Mittel') return { bg: '#FFF8E6', dot: '#D97706', text: '#92400E', border: '#F5D98B' };
  return { bg: '#FEF2F2', dot: '#EF4444', text: '#DC2626', border: '#FCA5A5' };
}

// ─── Styles ───────────────────────────────────────────
const s = StyleSheet.create({
  page:     { fontFamily: 'Helvetica', backgroundColor: C.white, padding: 0 },
  pageDark: { fontFamily: 'Helvetica', backgroundColor: C.darkGreen, padding: 0 },

  // ── Cover ──
  coverFrameOuter: { flex: 1, margin: 14, borderWidth: 1.5, borderColor: '#B8973E', borderStyle: 'solid' },
  coverFrameInner: { flex: 1, margin: 5, borderWidth: 0.5, borderColor: '#7A6428', borderStyle: 'solid' },
  coverInner:      { padding: 36, flex: 1 },
  coverLogoWrap:   { alignItems: 'center', marginBottom: 2 },
  coverLogoImg:    { width: 150, height: 100 },
  coverLogoSub:    { fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textAlign: 'center', marginTop: 4 },
  coverCenter:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverOrnamentWrap:    { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  coverOrnamentLine:    { width: 50, height: 1, backgroundColor: C.gold, opacity: 0.5 },
  coverOrnamentDiamond: { width: 6, height: 6, backgroundColor: C.gold, marginHorizontal: 10 },
  coverEyebrow:  { fontSize: 8, color: C.gold, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' },
  coverTitle:    { fontSize: 26, fontFamily: 'Helvetica-Bold', color: C.white, lineHeight: 1.25, marginBottom: 8, textAlign: 'center' },
  coverSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 24, letterSpacing: 0.5, textAlign: 'center' },

  // Wertspannen-Box auf dem Cover
  coverValueBox:     { borderWidth: 1.5, borderColor: '#D4AF37', borderStyle: 'solid', backgroundColor: '#0F4A33', paddingVertical: 20, paddingHorizontal: 36, alignItems: 'center' },
  coverValueLabel:   { fontSize: 8, color: 'rgba(212,175,55,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  coverValueRange:   { fontSize: 24, fontFamily: 'Helvetica-Bold', color: C.gold, marginBottom: 6 },
  coverValueKonf:    { fontSize: 9, color: 'rgba(255,255,255,0.6)' },

  coverMeta:      { borderTopWidth: 1, borderTopColor: '#3A2E10', borderTopStyle: 'solid', paddingTop: 18, marginTop: 8 },
  coverMetaRow:   { flexDirection: 'row', marginBottom: 10 },
  coverMetaItem:  { flex: 1 },
  coverMetaLabel: { fontSize: 7.5, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 },
  coverMetaValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.white },
  coverFooterText: { fontSize: 7.5, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 14 },

  // ── Content Pages ──
  contentPage:          { backgroundColor: C.white, flex: 1 },
  contentHeader:        { backgroundColor: C.darkGreen, paddingHorizontal: 36, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contentHeaderLogo:    { width: 66, height: 44 },
  contentHeaderRight:   { fontSize: 8.5, color: 'rgba(255,255,255,0.5)' },
  contentHeaderDivider: { height: 2, backgroundColor: C.gold, opacity: 0.7 },
  contentBody:          { padding: 36, flex: 1 },
  contentFooter:        { backgroundColor: C.bg, borderTop: '1px solid #E8E2D9', paddingHorizontal: 36, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contentFooterText:    { fontSize: 7.5, color: '#aaa' },

  sectionEyebrow: { fontSize: 7.5, color: C.lightGreen, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle:   { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.darkGreen, marginBottom: 10 },

  // Kompakte Maße — Seite 2 muss auch im Worst Case (14 Zeilen) auf eine Seite passen
  table:          { marginBottom: 10 },
  tableRow:       { flexDirection: 'row', borderBottom: '1px solid #E8E2D9', paddingVertical: 4.5 },
  tableRowAlt:    { backgroundColor: C.bg, paddingHorizontal: 6 },
  tableLabel:     { fontSize: 9, color: C.muted, flex: 1 },
  tableValue:     { fontSize: 9, color: C.text, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  // Wertspannen-Karte (Ergebnisseite)
  rangeCard:      { backgroundColor: C.darkGreen, padding: 14, marginBottom: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  rangeLabel:     { fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  rangeValue:     { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.gold },

  konfidenzBadge: { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 10, borderWidth: 1, borderStyle: 'solid' },
  konfidenzDot:   { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  konfidenzLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold' },

  methodBox:      { backgroundColor: C.bg, borderWidth: 1, borderColor: '#E8E2D9', borderStyle: 'solid', padding: 12, marginBottom: 10 },
  methodTitle:    { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.darkGreen, marginBottom: 5 },
  methodText:     { fontSize: 8, color: '#444', lineHeight: 1.5 },

  disclaimerBox:  { borderLeftWidth: 3, borderLeftColor: '#D4AF37', borderLeftStyle: 'solid', backgroundColor: C.bg, padding: 10 },
  disclaimerText: { fontSize: 7.5, color: C.muted, lineHeight: 1.5 },

  // ── CTA Page (dark) — großzügige Maße, Seite soll voll wirken ──
  ctaFrameOuter: { flex: 1, margin: 14, borderWidth: 1.5, borderColor: '#B8973E', borderStyle: 'solid' },
  ctaInner:      { padding: 42, flex: 1 },
  ctaTopRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  ctaEyebrow:    { fontSize: 9, color: C.gold, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10 },
  ctaTitle:      { fontSize: 27, fontFamily: 'Helvetica-Bold', color: C.white, lineHeight: 1.2, maxWidth: 330 },
  ctaLogoImg:    { width: 100, height: 66 },
  ctaText:       { fontSize: 11.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 28 },

  // Wertspannen-Recap — füllt die Seite und wiederholt die Kernbotschaft
  ctaValueBox:   { borderWidth: 1.5, borderColor: '#D4AF37', borderStyle: 'solid', backgroundColor: '#0F4A33', paddingVertical: 24, paddingHorizontal: 28, alignItems: 'center', marginBottom: 34 },
  ctaValueLabel: { fontSize: 8.5, color: 'rgba(212,175,55,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 9 },
  ctaValueRange: { fontSize: 23, fontFamily: 'Helvetica-Bold', color: C.gold, marginBottom: 7 },
  ctaValueKonf:  { fontSize: 10, color: 'rgba(255,255,255,0.6)' },

  ctaServiceRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 19 },
  ctaServiceCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', marginRight: 13, marginTop: 1, flexShrink: 0 },
  ctaServiceText:  { fontSize: 11, color: 'rgba(255,255,255,0.8)', flex: 1, lineHeight: 1.6 },

  ctaContact:      { flexDirection: 'row', alignItems: 'center', marginTop: 34, padding: '18 20', backgroundColor: '#0C4A32', borderLeftWidth: 3, borderLeftColor: '#C9A832', borderLeftStyle: 'solid' },
  ctaPortraitWrap: { width: 72, height: 72, marginRight: 16, flexShrink: 0 },
  ctaPortrait:     { width: 72, height: 72, borderRadius: 36, objectFit: 'cover' },
  ctaContactName:  { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.gold, marginBottom: 4 },
  ctaContactInfo:  { fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 },

  ctaDisclaimer:     { marginTop: 'auto', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#163D2C', borderTopStyle: 'solid' },
  ctaDisclaimerText: { fontSize: 7.5, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 },
  ctaFooterLinks:    { fontSize: 7.5, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
});

// ─── Header / Footer (Content-Seiten) ─────────────────────
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

function ContentFooter({ page, total }: { page: number; total: number }) {
  return (
    <View style={s.contentFooter}>
      <Text style={s.contentFooterText}>Akrona GmbH · § 34c &amp; § 34i GewO · IHK Region Stuttgart</Text>
      <Text style={s.contentFooterText}>Seite {page} von {total}</Text>
    </View>
  );
}

// ─── Daten für die Objekt-Tabelle ─────────────────────────
function buildObjektRows(e: BewertungEingaben, erg: BewertungErgebnis, t: typeof translations.de) {
  const objektartMap: Record<string, string> = {
    wohnung: t.bwWohnung,
    einfamilienhaus: t.bwEinfamilienhaus,
    mehrfamilienhaus: t.bwMehrfamilienhaus,
    grundstueck: t.bwGrundstueck,
  };
  const zustandMap: Record<string, string> = {
    neuwertig: t.bwNeuwertig,
    gepflegt: t.bwGepflegt,
    renovierungsbeduerftig: t.bwRenovierungsbeduerftig,
  };
  const ausstattungMap: Record<string, string> = {
    einfach: t.bwEinfach,
    standard: t.bwStandard,
    gehoben: t.bwGehoben,
  };
  const anlassMap: Record<string, string> = {
    verkauf: t.bwVerkauf,
    kauf: t.bwKauf,
    anschlussfinanzierung: t.bwAnschluss,
    interesse: t.bwNurInteresse,
  };
  const extrasMap: Record<string, string> = {
    balkon: t.bwBalkon,
    garten: t.bwGarten,
    garage: t.bwGarage,
    keller: t.bwKeller,
    aufzug: t.bwAufzug,
  };

  const rows: { label: string; value: string }[] = [
    { label: t.bwObjektartLabel, value: objektartMap[e.objektart] ?? e.objektart },
    { label: `${t.bwPlz} / ${t.bwOrt}`, value: `${e.plz}${e.ort ? ` ${e.ort}` : ''}` },
    { label: t.federalState, value: e.bundesland },
  ];
  if (e.wohnflaeche)          rows.push({ label: t.bwWohnflaeche, value: `${e.wohnflaeche} m²` });
  if (e.zimmer)               rows.push({ label: t.bwZimmer, value: String(e.zimmer).replace('.', ',') });
  if (e.baujahr)              rows.push({ label: t.bwBaujahr, value: String(e.baujahr) });
  if (e.grundstuecksflaeche)  rows.push({ label: t.bwGrundstuecksflaeche, value: `${e.grundstuecksflaeche} m²` });
  if (e.zustand)              rows.push({ label: t.bwZustand, value: zustandMap[e.zustand] ?? e.zustand });
  if (e.ausstattung)          rows.push({ label: t.bwAusstattung, value: ausstattungMap[e.ausstattung] ?? e.ausstattung });
  if (e.modernisierungsjahr)  rows.push({ label: t.bwModernisierungsjahr, value: String(e.modernisierungsjahr) });
  if (e.extras?.length)       rows.push({ label: t.bwExtras, value: e.extras.map((x) => extrasMap[x] ?? x).join(', ') });
  if (e.anlass)               rows.push({ label: t.bwAnlassLabel, value: anlassMap[e.anlass] ?? e.anlass });
  rows.push({ label: t.bwQmPreis, value: `${fEuro(erg.qmPreis)} / m²` });
  if (erg.bodenwert > 0)      rows.push({ label: t.bwBodenwert, value: fEuro(erg.bodenwert) });
  if (erg.extrasZuschlag > 0) rows.push({ label: t.bwExtrasZuschlag, value: fEuro(erg.extrasZuschlag) });
  return rows;
}

// ─── Haupt-Dokument ──────────────────────────────────────
export function BewertungPDF({ data }: {
  data: {
    vorname: string;
    nachname: string;
    lang?: 'de' | 'ro';
    eingaben: BewertungEingaben;
    ergebnis: BewertungErgebnis;
  };
}) {
  const { vorname, nachname, eingaben, ergebnis } = data;
  const lang = data.lang ?? 'de';
  const t = getT(lang);
  const datum = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  const kc = getKonfidenzColor(ergebnis.konfidenz);
  const konfidenz = konfidenzLabel(ergebnis.konfidenz, t);
  const rows = buildObjektRows(eingaben, ergebnis, t);
  const totalPages = 3;

  const disclaimer = t.pdfFinalDisclaimer
    .replace('{date}', datum)
    .replace('{name}', `${vorname} ${nachname}`);

  return (
    <Document
      title={`Akrona Immobilien-Werteinschätzung – ${vorname} ${nachname}`}
      author="Akrona GmbH"
      subject={t.bwPdfTitle}
    >
      {/* ── Seite 1: Deckblatt mit Wertspanne ── */}
      <Page size="A4" style={s.pageDark}>
        <View style={s.coverFrameOuter}>
          <View style={s.coverFrameInner}>
            <View style={s.coverInner}>
              <View style={s.coverLogoWrap}>
                <Image src={LOGO} style={s.coverLogoImg} />
                <Text style={s.coverLogoSub}>§ 34c &amp; § 34i GewO · IHK Region Stuttgart</Text>
              </View>

              <View style={s.coverCenter}>
                <View style={s.coverOrnamentWrap}>
                  <View style={s.coverOrnamentLine} />
                  <View style={s.coverOrnamentDiamond} />
                  <View style={s.coverOrnamentLine} />
                </View>

                <Text style={s.coverEyebrow}>{t.bwPdfSubtitle}</Text>
                <Text style={s.coverTitle}>{t.bwPdfTitle}</Text>
                <Text style={s.coverSubtitle}>{t.propertyValuation} · {t.confidential}</Text>

                <View style={s.coverValueBox}>
                  <Text style={s.coverValueLabel}>{t.bwPdfRange}</Text>
                  <Text style={s.coverValueRange}>{fEuro(ergebnis.wertVon)} – {fEuro(ergebnis.wertBis)}</Text>
                  <Text style={s.coverValueKonf}>{t.bwPdfConfidence}: {konfidenz}</Text>
                </View>
              </View>

              <View style={s.coverMeta}>
                <View style={s.coverMetaRow}>
                  <View style={s.coverMetaItem}>
                    <Text style={s.coverMetaLabel}>{t.createdFor}</Text>
                    <Text style={s.coverMetaValue}>{vorname} {nachname}</Text>
                  </View>
                  <View style={s.coverMetaItem}>
                    <Text style={s.coverMetaLabel}>{t.dateLabel}</Text>
                    <Text style={s.coverMetaValue}>{datum}</Text>
                  </View>
                </View>
                <View style={s.coverMetaRow}>
                  <View style={s.coverMetaItem}>
                    <Text style={s.coverMetaLabel}>{t.bwObjektartLabel}</Text>
                    <Text style={s.coverMetaValue}>
                      {eingaben.objektart === 'wohnung' ? t.bwWohnung
                        : eingaben.objektart === 'einfamilienhaus' ? t.bwEinfamilienhaus
                        : eingaben.objektart === 'mehrfamilienhaus' ? t.bwMehrfamilienhaus
                        : t.bwGrundstueck}
                    </Text>
                  </View>
                  <View style={s.coverMetaItem}>
                    <Text style={s.coverMetaLabel}>{t.advisor}</Text>
                    <Text style={s.coverMetaValue}>Alperen Akbal</Text>
                  </View>
                </View>
              </View>

              <Text style={s.coverFooterText}>{t.bwPdfDisclaimer}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ── Seite 2: Objektdaten + Methode ── */}
      <Page size="A4" style={s.page}>
        <View style={s.contentPage}>
          <ContentHeader name={`${vorname} ${nachname}`} pageLabel={t.bwPdfObjectData} />
          <View style={s.contentBody}>
            <Text style={s.sectionEyebrow}>{t.inputData}</Text>
            <Text style={s.sectionTitle}>{t.bwPdfObjectData}</Text>

            {/* Wertspanne */}
            <View style={s.rangeCard}>
              <Text style={s.rangeLabel}>{t.bwPdfRange}</Text>
              <Text style={s.rangeValue}>{fEuro(ergebnis.wertVon)} – {fEuro(ergebnis.wertBis)}</Text>
            </View>

            {/* Konfidenz-Badge */}
            <View style={[s.konfidenzBadge, { backgroundColor: kc.bg, borderColor: kc.border }]}>
              <View style={[s.konfidenzDot, { backgroundColor: kc.dot }]} />
              <Text style={[s.konfidenzLabel, { color: kc.text }]}>{t.bwPdfConfidence}: {konfidenz}</Text>
            </View>

            {/* Objektdaten-Tabelle */}
            <View style={s.table}>
              {rows.map((row, i) => (
                <View key={row.label} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                  <Text style={s.tableLabel}>{row.label}</Text>
                  <Text style={s.tableValue}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Methode */}
            <View style={s.methodBox}>
              <Text style={s.methodTitle}>{t.bwPdfMethodTitle}</Text>
              <Text style={s.methodText}>{t.bwPdfMethodText}</Text>
            </View>

            {/* Disclaimer */}
            <View style={s.disclaimerBox}>
              <Text style={s.disclaimerText}>{t.bwPdfDisclaimer}</Text>
            </View>
          </View>
          <ContentFooter page={2} total={totalPages} />
        </View>
      </Page>

      {/* ── Seite 3: CTA Beratungsgespräch ── */}
      <Page size="A4" style={s.pageDark}>
        <View style={s.ctaFrameOuter}>
          <View style={s.ctaInner}>
            <View style={s.ctaTopRow}>
              <View style={{ flex: 1, paddingRight: 14 }}>
                <Text style={s.ctaEyebrow}>{t.nextSteps}</Text>
                <Text style={s.ctaTitle}>{t.bwPdfCtaTitle}</Text>
              </View>
              <Image src={LOGO} style={s.ctaLogoImg} />
            </View>

            <Text style={s.ctaText}>{t.bwPdfCtaText}</Text>

            {/* Wertspannen-Recap */}
            <View style={s.ctaValueBox}>
              <Text style={s.ctaValueLabel}>{t.bwPdfYourEstimate}</Text>
              <Text style={s.ctaValueRange}>{fEuro(ergebnis.wertVon)} – {fEuro(ergebnis.wertBis)}</Text>
              <Text style={s.ctaValueKonf}>{t.bwPdfConfidence}: {konfidenz}</Text>
            </View>

            {[
              { title: t.bwPdfService0Title, desc: t.bwPdfService0Desc },
              { title: t.voucherService1Title, desc: t.voucherService1Desc },
              { title: t.bankComparisonAndOffer, desc: t.bankComparisonAndOfferDesc },
            ].map((srv, i) => (
              <View key={i} style={s.ctaServiceRow}>
                <View style={s.ctaServiceCheck}>
                  <Svg width="11" height="9" viewBox="0 0 9 7">
                    <Path d="M1 3.5 L3.5 6 L8 1" stroke={C.darkGreen} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={s.ctaServiceText}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', color: C.white }}>{srv.title}</Text>
                  {' — '}{srv.desc}
                </Text>
              </View>
            ))}

            {/* Kontakt Alperen */}
            <View style={s.ctaContact}>
              <View style={s.ctaPortraitWrap}>
                <Image src={ALPEREN} style={s.ctaPortrait} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.ctaContactName}>Alperen Akbal · {t.ceoTitle}</Text>
                <Text style={s.ctaContactInfo}>
                  Akrona GmbH · E-Mail: info@akrona.de{'\n'}
                  IHK Region Stuttgart · § 34c &amp; § 34i GewO
                </Text>
              </View>
            </View>

            {/* Disclaimer + rechtliche Links */}
            <View style={s.ctaDisclaimer}>
              <Text style={s.ctaDisclaimerText}>{disclaimer}</Text>
              <Text style={s.ctaFooterLinks}>
                {t.imprint}: rechner.akrona.de/impressum · {t.privacyPolicy}: rechner.akrona.de/datenschutz
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
