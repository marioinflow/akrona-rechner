import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { createServerClient } from '@/lib/supabase';
import { berechneBaufinanzierung, berechnePrivatkredit } from '@/lib/berechnung';
import { AkronaPDF } from '@/lib/pdf-template';
import type { LeadFormData, BaufinanzierungEingaben, PrivatkreditEingaben } from '@/types';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function fEuro(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadFormData = await request.json();
    const { vorname, nachname, email, telefon, typ, eingaben, consents } = body;

    // ── Validierung ──
    if (!vorname?.trim() || !nachname?.trim() || !email?.trim()) {
      return NextResponse.json({ success: false, error: 'Bitte füllen Sie alle Pflichtfelder aus.' }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ success: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' }, { status: 400 });
    }
    if (!consents.datenschutz || !consents.kontakt) {
      return NextResponse.json({ success: false, error: 'Bitte stimmen Sie den Pflicht-Checkboxen zu.' }, { status: 400 });
    }
    if (!eingaben) {
      return NextResponse.json({ success: false, error: 'Keine Eingabedaten übermittelt.' }, { status: 400 });
    }

    const ip = getClientIP(request);
    const supabase = createServerClient();
    const lang = body.lang ?? 'de';
    const isRO = lang === 'ro';

    const typLabel = isRO
      ? (typ === 'baufinanzierung' ? 'Finanțare imobiliară' : 'Credit personal')
      : (typ === 'baufinanzierung' ? 'Baufinanzierung' : 'Privatkredit');

    // ── Serverseitige Neuberechnung (authoritative Grundlage für PDF & DB) ──
    let ergebnis;
    try {
      if (typ === 'baufinanzierung') {
        ergebnis = berechneBaufinanzierung(eingaben as BaufinanzierungEingaben);
      } else {
        ergebnis = berechnePrivatkredit(eingaben as PrivatkreditEingaben);
      }
    } catch (e) {
      return NextResponse.json({ success: false, error: `Berechnungsfehler: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
    }

    const bonitaetScore = ergebnis.bonitaetScore;
    const bonitaetLabel = ergebnis.bonitaetLabel;
    const maxKredit = ergebnis.maxKredit;
    const monatsRate = ergebnis.monatsRate;
    const zinssatz = ergebnis.zinssatz;

    // ── [1] Calculation-Session speichern ──
    let sessionId: string | undefined;
    try {
      const { data: sessionData } = await supabase
        .from('calculation_sessions')
        .insert({
          product_type: typ,
          request_payload_json: eingaben,
          response_payload_json: ergebnis,
        })
        .select('id')
        .single();
      sessionId = sessionData?.id;
    } catch {
      // Nicht kritisch — Tabelle möglicherweise noch nicht angelegt
    }

    // ── [2] Lead speichern ──
    let leadId: string;
    try {
      const { data, error: dbError } = await supabase
        .from('leads')
        .insert({
          vorname, nachname, email, telefon,
          rechner_typ: typ,
          calculation_session_id: sessionId ?? null,
          consent_datenschutz: consents.datenschutz,
          consent_kontakt: consents.kontakt,
          consent_newsletter: consents.newsletter,
          consent_ip: ip,
          eingaben,
          ergebnis,
          bonitaet_score: bonitaetScore,
          bonitaet_label: bonitaetLabel,
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('[Step 2] Supabase insert error:', dbError);
        return NextResponse.json({ success: false, error: `Speicherfehler: ${dbError.message}` }, { status: 500 });
      }
      leadId = data.id;
    } catch (e) {
      console.error('[Step 2] Supabase exception:', e);
      return NextResponse.json({ success: false, error: 'Supabase-Verbindungsfehler. Bitte versuchen Sie es erneut.' }, { status: 500 });
    }

    // Newsletter bei Opt-in
    if (consents.newsletter) {
      supabase.from('newsletter_subscribers').upsert(
        { email, vorname, nachname, lead_id: leadId },
        { onConflict: 'email' }
      ).then(() => {/* nicht kritisch */}, () => {/* nicht kritisch */});
    }

    // ── [3] PDF generieren ──
    let pdfBuffer: Buffer;
    const pdfPayload: LeadFormData = { ...body, ergebnis, calculationSessionId: sessionId };
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await renderToBuffer(React.createElement(AkronaPDF, { data: pdfPayload }) as any);
      pdfBuffer = Buffer.from(raw);
    } catch (e) {
      console.error('[Step 3] PDF generation error:', e);
      return NextResponse.json({ success: false, error: `PDF-Fehler: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
    }

    // ── [4] PDF-Report Datensatz anlegen ──
    let pdfReportId: string | undefined;
    try {
      const { data: reportData } = await supabase
        .from('pdf_reports')
        .insert({
          calculation_session_id: sessionId ?? null,
          lead_id: leadId,
          email_status: 'pending',
        })
        .select('id')
        .single();
      pdfReportId = reportData?.id;
    } catch {
      // Nicht kritisch — Tabelle möglicherweise noch nicht angelegt
    }

    const resend = getResend();
    const dateiname = `Akrona_Finanzierungsauswertung_${vorname}_${nachname}.pdf`.replace(/\s+/g, '_');

    // ── [5] E-Mail an Nutzer (mit PDF) ──
    const bonitaetLabelRO: Record<string, string> = {
      'Sehr gut': 'Foarte bun',
      'Mittel': 'Mediu',
      'Basis': 'Standard',
    };
    const bonitaetLabelEmail = isRO ? (bonitaetLabelRO[bonitaetLabel] ?? bonitaetLabel) : bonitaetLabel;

    const emailSubject = isRO
      ? 'Analiza dvs. completă – Calculator Akrona'
      : 'Ihre vollständige Auswertung – Akrona Finanzierungsrechner';

    const emailLang = isRO ? 'ro' : 'de';
    const emailGreeting = isRO ? `Bună ziua, ${vorname},` : `Guten Tag ${vorname},`;
    const emailIntro = isRO
      ? `Vă mulțumim pentru solicitare. Găsiți atașat <strong>analiza dvs. personalizată de finanțare în format PDF</strong>.`
      : `vielen Dank für Ihre Anfrage. Anbei finden Sie Ihre persönliche <strong>Finanzierungsauswertung als PDF</strong>.`;
    const emailBoxHeading = isRO
      ? `Evaluarea dvs. <span style="color:#D4AF37;">personalizată</span>`
      : `Ihre <span style="color:#D4AF37;">persönliche</span> Einschätzung`;
    const emailZinssatzLabel = isRO ? 'Dobândă nominală' : 'Zinssatz-Basis';
    const emailMaxKreditLabel = isRO ? 'Plafon maxim de finanțare' : `Max. ${typ === 'baufinanzierung' ? 'Kredit' : 'Kreditrahmen'}`;
    const emailMonatsrateLabel = isRO ? 'Rată lunară de rambursare' : 'Monatliche Rate';
    const emailPdfHint = isRO
      ? `Analiza completă cu planul de amortizare, scenarii și pașii următori o găsiți în <strong>PDF-ul atașat</strong>.`
      : `Die vollständige Auswertung mit Tilgungsplan, Szenarien und nächsten Schritten finden Sie im <strong>beigefügten PDF</strong>.`;
    const emailDisclaimer = isRO
      ? `Calcul estimativ, fără caracter obligatoriu — nu constituie o aprobare de finanțare bancară.`
      : `Unverbindliche Beispielrechnung — keine Finanzierungszusage einer Bank.`;
    const emailSalutation = isRO ? 'Cu stimă,' : 'Mit freundlichen Grüßen,';
    const emailPosition = isRO ? 'Director General' : 'Geschäftsführer';

    let emailSuccess = false;
    let emailErrorMessage: string | undefined;

    try {
      await resend.emails.send({
        from: 'Akrona GmbH <noreply@akrona.de>',
        to: email,
        replyTo: process.env.AKRONA_EMAIL ?? 'info@akrona.de',
        subject: emailSubject,
        attachments: [{ filename: dateiname, content: pdfBuffer }],
        html: `<!DOCTYPE html>
<html lang="${emailLang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F5F0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:#0A3D2C;padding:28px 40px;border-bottom:2px solid #D4AF37;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.45);">§ 34c &amp; § 34i GewO · IHK Region Stuttgart</p>
            </td>
            <td style="vertical-align:middle;text-align:right;">
              <img src="https://rechner.akrona.de/akrona-logo-transparent.png" alt="Akrona GmbH" width="120" style="display:block;height:auto;margin-left:auto;">
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;">${emailGreeting}</p>
          <p style="margin:0 0 24px;color:#444;line-height:1.7;font-size:14px;">${emailIntro}</p>

          <div style="background:#F7F5F0;border-radius:8px;padding:24px;margin-bottom:28px;border:1px solid #E8E2D9;">
            <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:#1a1a1a;">${emailBoxHeading}</p>
            <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0A3D2C;">${bonitaetLabelEmail}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 16px 0 0;">
                  <p style="margin:0;font-size:11px;color:#6b6b6b;">${emailZinssatzLabel}</p>
                  <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#0A3D2C;">${(zinssatz * 100).toFixed(1)} %</p>
                </td>
                <td>
                  <p style="margin:0;font-size:11px;color:#6b6b6b;">${emailMaxKreditLabel}</p>
                  <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#0A3D2C;">${fEuro(maxKredit)}</p>
                </td>
              </tr>
              <tr><td colspan="2" style="padding-top:16px;border-top:1px solid #E8E2D9;">
                <p style="margin:0;font-size:11px;color:#6b6b6b;">${emailMonatsrateLabel}</p>
                <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#D4AF37;">ca. ${fEuro(monatsRate)}</p>
              </td></tr>
            </table>
          </div>

          <p style="margin:0 0 6px;font-size:13px;color:#444;line-height:1.7;">${emailPdfHint}</p>
          <p style="margin:0 0 32px;font-size:13px;color:#6b6b6b;line-height:1.7;font-style:italic;">${emailDisclaimer}</p>

          <p style="margin:0 0 2px;color:#1a1a1a;font-size:14px;font-weight:600;">${emailSalutation}</p>
          <p style="margin:0;color:#0A3D2C;font-size:14px;font-weight:700;">Alperen Akbal</p>
          <p style="margin:0;color:#6b6b6b;font-size:12px;">${emailPosition}</p>
          <p style="margin:2px 0 0;color:#6b6b6b;font-size:13px;">Akrona GmbH</p>
        </td></tr>
        <tr><td style="background:#0A3D2C;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);">© 2025 Akrona GmbH · <a href="mailto:info@akrona.de" style="color:#D4AF37;text-decoration:none;">info@akrona.de</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });
      emailSuccess = true;
    } catch (e) {
      console.error('[Step 5] Resend error:', e);
      emailErrorMessage = e instanceof Error ? e.message : String(e);
    }

    // ── [6] E-Mail-Log speichern ──
    try {
      await supabase.from('email_logs').insert({
        pdf_report_id: pdfReportId ?? null,
        recipient_email: email,
        subject: emailSubject,
        status: emailSuccess ? 'sent' : 'failed',
        error_message: emailErrorMessage ?? null,
      });
    } catch {
      // Nicht kritisch — Tabelle möglicherweise noch nicht angelegt
    }

    if (!emailSuccess) {
      return NextResponse.json({ success: false, error: 'E-Mail-Versand fehlgeschlagen. Bitte versuchen Sie es erneut.' }, { status: 500 });
    }

    // ── [7] PDF-Status & Lead aktualisieren ──
    await Promise.allSettled([
      supabase.from('pdf_reports').update({ email_status: 'sent', email_sent_at: new Date().toISOString() }).eq('id', pdfReportId ?? ''),
      supabase.from('leads').update({ pdf_sent: true, pdf_sent_at: new Date().toISOString() }).eq('id', leadId),
    ]);

    // ── [8] Interne Benachrichtigung ──
    try {
      await resend.emails.send({
        from: 'Akrona GmbH <noreply@akrona.de>',
        to: process.env.AKRONA_EMAIL ?? 'info@akrona.de',
        subject: `Neuer Lead: ${vorname} ${nachname} – ${typLabel}`,
        html: `<div style="font-family:Arial,sans-serif;padding:24px;max-width:500px;">
          <h2 style="color:#0A3D2C;margin:0 0 16px;">Neuer Lead eingegangen</h2>
          <table cellpadding="6" cellspacing="0" style="width:100%;">
            <tr><td style="color:#6b6b6b;width:140px;">Name:</td><td><strong>${vorname} ${nachname}</strong></td></tr>
            <tr><td style="color:#6b6b6b;">E-Mail:</td><td><a href="mailto:${email}">${email}</a></td></tr>
            ${telefon ? `<tr><td style="color:#6b6b6b;">Telefon:</td><td>${telefon}</td></tr>` : ''}
            <tr><td style="color:#6b6b6b;">Typ:</td><td>${typLabel}</td></tr>
            <tr><td style="color:#6b6b6b;">Bonität:</td><td>${bonitaetLabel}</td></tr>
            <tr><td style="color:#6b6b6b;">Max. Kredit:</td><td><strong>${fEuro(maxKredit)}</strong></td></tr>
            <tr><td style="color:#6b6b6b;">Monatsrate:</td><td><strong>${fEuro(monatsRate)}</strong></td></tr>
            <tr><td style="color:#6b6b6b;">Newsletter:</td><td>${consents.newsletter ? 'Ja' : 'Nein'}</td></tr>
            <tr><td style="color:#6b6b6b;">Zeitpunkt:</td><td>${new Date().toLocaleString('de-DE')}</td></tr>
          </table>
        </div>`,
      });
    } catch (e) {
      console.error('[Step 8] Internal notification error:', e);
      // Nicht kritisch
    }

    return NextResponse.json({
      success: true,
      leadId,
      sessionId,
      message: 'Ihre Auswertung wurde per E-Mail versendet.',
    });

  } catch (err) {
    console.error('[Unhandled] send-pdf error:', err);
    return NextResponse.json(
      { success: false, error: `Unbekannter Fehler: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
