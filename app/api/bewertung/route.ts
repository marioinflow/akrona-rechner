import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { createServerClient } from '@/lib/supabase';
import { berechneImmobilienbewertung } from '@/lib/bewertung';
import { BewertungPDF } from '@/lib/pdf-bewertung-template';
import type { BewertungLeadData } from '@/types';

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

function validatePhone(telefon: string): boolean {
  return /[0-9]/.test(telefon) && telefon.replace(/\D/g, '').length >= 6;
}

export async function POST(request: NextRequest) {
  try {
    const body: BewertungLeadData = await request.json();
    const { vorname, nachname, email, telefon, eingaben, consents } = body;

    // ── Honeypot: Bots füllen das versteckte Feld — still "erfolgreich" antworten ──
    if (body.website && body.website.trim() !== '') {
      return NextResponse.json({ success: true });
    }

    // ── Serverseitige Validierung ──
    if (!vorname?.trim() || !nachname?.trim() || !email?.trim() || !telefon?.trim()) {
      return NextResponse.json({ success: false, error: 'Bitte füllen Sie alle Pflichtfelder aus.' }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ success: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' }, { status: 400 });
    }
    if (!validatePhone(telefon)) {
      return NextResponse.json({ success: false, error: 'Bitte geben Sie eine gültige Telefonnummer ein.' }, { status: 400 });
    }
    if (!consents?.datenschutz) {
      return NextResponse.json({ success: false, error: 'Bitte stimmen Sie der Datenschutzerklärung zu.' }, { status: 400 });
    }
    if (!eingaben || !/^\d{5}$/.test(eingaben.plz?.trim() ?? '') || !eingaben.bundesland) {
      return NextResponse.json({ success: false, error: 'Unvollständige Objektdaten übermittelt.' }, { status: 400 });
    }

    const ip = getClientIP(request);
    const supabase = createServerClient();
    const lang = body.lang ?? 'de';
    const isRO = lang === 'ro';

    // ── Serverseitige Berechnung (Ergebnis bleibt auf dem Server) ──
    let ergebnis;
    try {
      ergebnis = berechneImmobilienbewertung(eingaben);
    } catch (e) {
      return NextResponse.json({ success: false, error: `Berechnungsfehler: ${e instanceof Error ? e.message : String(e)}` }, { status: 400 });
    }

    // ── [1] Calculation-Session speichern (nicht kritisch) ──
    let sessionId: string | undefined;
    try {
      const { data: sessionData } = await supabase
        .from('calculation_sessions')
        .insert({
          product_type: 'immobilienbewertung',
          request_payload_json: eingaben,
          response_payload_json: ergebnis,
        })
        .select('id')
        .single();
      sessionId = sessionData?.id;
    } catch {
      // Nicht kritisch — CHECK-Constraint ggf. noch nicht erweitert (Migration 002)
    }

    // ── [2] Lead speichern ──
    let leadId: string;
    try {
      const { data, error: dbError } = await supabase
        .from('leads')
        .insert({
          vorname, nachname, email, telefon,
          rechner_typ: 'immobilienbewertung',
          calculation_session_id: sessionId ?? null,
          consent_datenschutz: consents.datenschutz,
          // Die Bewertungs-Einwilligung umfasst Verarbeitung + Kontaktaufnahme
          consent_kontakt: consents.datenschutz,
          consent_newsletter: false,
          consent_ip: ip,
          eingaben,
          ergebnis,
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('[Bewertung Step 2] Supabase insert error:', dbError);
        return NextResponse.json({ success: false, error: `Speicherfehler: ${dbError.message}` }, { status: 500 });
      }
      leadId = data.id;
    } catch (e) {
      console.error('[Bewertung Step 2] Supabase exception:', e);
      return NextResponse.json({ success: false, error: 'Supabase-Verbindungsfehler. Bitte versuchen Sie es erneut.' }, { status: 500 });
    }

    // ── [3] PDF generieren ──
    let pdfBuffer: Buffer;
    try {
      const raw = await renderToBuffer(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        React.createElement(BewertungPDF, { data: { vorname, nachname, lang, eingaben, ergebnis } }) as any
      );
      pdfBuffer = Buffer.from(raw);
    } catch (e) {
      console.error('[Bewertung Step 3] PDF generation error:', e);
      return NextResponse.json({ success: false, error: `PDF-Fehler: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
    }

    const resend = getResend();
    const dateiname = `Akrona_Immobilien_Werteinschaetzung_${vorname}_${nachname}.pdf`.replace(/\s+/g, '_');

    // ── [4] E-Mail an Interessenten (mit PDF) ──
    const emailSubject = isRO
      ? 'Evaluarea imobilului dumneavoastră – Akrona'
      : 'Ihre Immobilien-Werteinschätzung – Akrona';
    const emailGreeting = isRO ? `Bună ziua, ${vorname},` : `Guten Tag ${vorname},`;
    const emailIntro = isRO
      ? `vă mulțumim pentru solicitare. Găsiți atașat <strong>evaluarea imobilului dumneavoastră în format PDF</strong> — cu intervalul estimat al valorii de piață, nivelul de încredere și o explicație a metodei.`
      : `vielen Dank für Ihre Anfrage. Anbei finden Sie Ihre <strong>Immobilien-Werteinschätzung als PDF</strong> — mit geschätzter Marktwertspanne, Konfidenznote und Erklärung der Methodik.`;
    const emailDisclaimer = isRO
      ? `Evaluare inițială orientativă — nu reprezintă un raport de evaluare a valorii de piață.`
      : `Unverbindliche Ersteinschätzung — kein Verkehrswertgutachten.`;
    const emailCta = isRO
      ? `Doriți o evaluare personală? Răspundeți pur și simplu la acest e-mail sau scrieți-ne la <a href="mailto:info@akrona.de" style="color:#0A3D2C;">info@akrona.de</a>.`
      : `Sie möchten eine persönliche Einschätzung? Antworten Sie einfach auf diese E-Mail oder schreiben Sie an <a href="mailto:info@akrona.de" style="color:#0A3D2C;">info@akrona.de</a>.`;
    const emailSalutation = isRO ? 'Cu stimă,' : 'Mit freundlichen Grüßen,';
    const emailPosition = isRO ? 'Director General' : 'Geschäftsführer';

    let emailSuccess = false;
    let emailErrorMessage: string | undefined;

    try {
      const { error: emailError } = await resend.emails.send({
        from: 'Akrona GmbH <noreply@akrona.de>',
        to: email,
        replyTo: process.env.AKRONA_EMAIL ?? 'info@akrona.de',
        subject: emailSubject,
        attachments: [{ filename: dateiname, content: pdfBuffer }],
        html: `<!DOCTYPE html>
<html lang="${isRO ? 'ro' : 'de'}">
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
          <p style="margin:0 0 6px;font-size:13px;color:#444;line-height:1.7;">${emailCta}</p>
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
      if (emailError) {
        console.error('[Bewertung Step 4] Resend error:', emailError);
        emailErrorMessage = emailError.message;
      } else {
        emailSuccess = true;
      }
    } catch (e) {
      console.error('[Bewertung Step 4] Resend error:', e);
      emailErrorMessage = e instanceof Error ? e.message : String(e);
    }

    // ── [5] E-Mail-Log speichern (nicht kritisch) ──
    try {
      await supabase.from('email_logs').insert({
        recipient_email: email,
        subject: emailSubject,
        status: emailSuccess ? 'sent' : 'failed',
        error_message: emailErrorMessage ?? null,
      });
    } catch {
      // Nicht kritisch
    }

    if (!emailSuccess) {
      return NextResponse.json({ success: false, error: 'E-Mail-Versand fehlgeschlagen. Bitte versuchen Sie es erneut.' }, { status: 500 });
    }

    // ── [6] Lead-Status aktualisieren ──
    await supabase.from('leads').update({ pdf_sent: true, pdf_sent_at: new Date().toISOString() }).eq('id', leadId);

    // ── [7] Interne Lead-Benachrichtigung an Akrona ──
    const anlassMap: Record<string, string> = {
      verkauf: 'Verkauf geplant',
      kauf: 'Kauf geplant',
      anschlussfinanzierung: 'Anschlussfinanzierung',
      interesse: 'Nur Interesse',
    };
    const verkaufszeitraumMap: Record<string, string> = {
      schnellstmoeglich: 'Schnellstmöglich',
      sechs_monate: 'In den nächsten 6 Monaten',
      zwei_jahre: 'In den nächsten 2 Jahren',
      spaeter: 'Später',
    };
    const eigentuemerMap: Record<string, string> = {
      ja: 'Ja, Eigentümer',
      teileigentuemer: 'Teil-Eigentümer',
      angehoeriger: 'Angehöriger',
      nein: 'Nein',
    };
    const objektartMap: Record<string, string> = {
      wohnung: 'Eigentumswohnung',
      einfamilienhaus: 'Einfamilienhaus',
      mehrfamilienhaus: 'Mehrfamilienhaus',
      grundstueck: 'Grundstück',
    };
    try {
      await resend.emails.send({
        from: 'Akrona GmbH <noreply@akrona.de>',
        to: process.env.AKRONA_EMAIL ?? 'info@akrona.de',
        subject: `Neuer Bewertungs-Lead: ${vorname} ${nachname} – ${eingaben.ort?.trim() || eingaben.plz}`,
        html: `<div style="font-family:Arial,sans-serif;padding:24px;max-width:520px;">
          <h2 style="color:#0A3D2C;margin:0 0 16px;">Neuer Bewertungs-Lead eingegangen</h2>
          <table cellpadding="6" cellspacing="0" style="width:100%;">
            <tr><td style="color:#6b6b6b;width:170px;">Name:</td><td><strong>${vorname} ${nachname}</strong></td></tr>
            <tr><td style="color:#6b6b6b;">E-Mail:</td><td><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="color:#6b6b6b;">Telefon:</td><td>${telefon}</td></tr>
            <tr><td style="color:#6b6b6b;">Sprache:</td><td>${isRO ? 'Rumänisch' : 'Deutsch'}</td></tr>
            <tr><td colspan="2" style="border-top:1px solid #E8E2D9;padding-top:12px;"><strong style="color:#0A3D2C;">Objekt</strong></td></tr>
            <tr><td style="color:#6b6b6b;">Objektart:</td><td>${objektartMap[eingaben.objektart] ?? eingaben.objektart}</td></tr>
            <tr><td style="color:#6b6b6b;">Lage:</td><td>${eingaben.plz}${eingaben.ort ? ` ${eingaben.ort}` : ''}, ${eingaben.bundesland}</td></tr>
            ${eingaben.wohnflaeche ? `<tr><td style="color:#6b6b6b;">Wohnfläche:</td><td>${eingaben.wohnflaeche} m²</td></tr>` : ''}
            ${eingaben.zimmer ? `<tr><td style="color:#6b6b6b;">Zimmer:</td><td>${String(eingaben.zimmer).replace('.', ',')}</td></tr>` : ''}
            ${eingaben.baujahr ? `<tr><td style="color:#6b6b6b;">Baujahr:</td><td>${eingaben.baujahr}</td></tr>` : ''}
            ${eingaben.grundstuecksflaeche ? `<tr><td style="color:#6b6b6b;">Grundstück:</td><td>${eingaben.grundstuecksflaeche} m²</td></tr>` : ''}
            ${eingaben.zustand ? `<tr><td style="color:#6b6b6b;">Zustand:</td><td>${eingaben.zustand}</td></tr>` : ''}
            ${eingaben.ausstattung ? `<tr><td style="color:#6b6b6b;">Ausstattung:</td><td>${eingaben.ausstattung}</td></tr>` : ''}
            ${eingaben.modernisierungsjahr ? `<tr><td style="color:#6b6b6b;">Modernisierung:</td><td>${eingaben.modernisierungsjahr}</td></tr>` : ''}
            ${eingaben.extras?.length ? `<tr><td style="color:#6b6b6b;">Extras:</td><td>${eingaben.extras.join(', ')}</td></tr>` : ''}
            <tr><td colspan="2" style="border-top:1px solid #E8E2D9;padding-top:12px;"><strong style="color:#0A3D2C;">Bewertung</strong></td></tr>
            <tr><td style="color:#6b6b6b;">Wertspanne:</td><td><strong>${fEuro(ergebnis.wertVon)} – ${fEuro(ergebnis.wertBis)}</strong></td></tr>
            <tr><td style="color:#6b6b6b;">Konfidenz:</td><td>${ergebnis.konfidenz}</td></tr>
            <tr><td style="color:#6b6b6b;">Anlass:</td><td><strong>${eingaben.anlass ? (anlassMap[eingaben.anlass] ?? eingaben.anlass) : 'Keine Angabe'}</strong></td></tr>
            <tr><td style="color:#6b6b6b;">Verkaufszeitraum:</td><td><strong>${eingaben.verkaufszeitraum ? (verkaufszeitraumMap[eingaben.verkaufszeitraum] ?? eingaben.verkaufszeitraum) : 'Keine Angabe'}</strong></td></tr>
            <tr><td style="color:#6b6b6b;">Eigentümer:</td><td><strong>${eingaben.eigentuemer ? (eigentuemerMap[eingaben.eigentuemer] ?? eingaben.eigentuemer) : 'Keine Angabe'}</strong></td></tr>
            <tr><td style="color:#6b6b6b;">Zeitpunkt:</td><td>${new Date().toLocaleString('de-DE')}</td></tr>
          </table>
        </div>`,
      });
    } catch (e) {
      console.error('[Bewertung Step 7] Internal notification error:', e);
      // Nicht kritisch
    }

    // ── Bewusst nur success — keine Werte ans Frontend ──
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[Unhandled] bewertung error:', err);
    return NextResponse.json(
      { success: false, error: `Unbekannter Fehler: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
