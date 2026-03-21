import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { createServerClient } from '@/lib/supabase';
import { AkronaPDF } from '@/lib/pdf-template';
import type { LeadFormData } from '@/types';

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

export async function POST(request: NextRequest) {
  try {
    const body: LeadFormData = await request.json();
    const { vorname, nachname, email, typ, eingaben, ergebnis, consents } = body;

    // Pflicht-Validierung
    if (!vorname || !nachname || !email) {
      return NextResponse.json({ success: false, error: 'Bitte füllen Sie alle Pflichtfelder aus.' }, { status: 400 });
    }
    if (!consents.datenschutz || !consents.kontakt) {
      return NextResponse.json({ success: false, error: 'Bitte stimmen Sie den Pflicht-Checkboxen zu.' }, { status: 400 });
    }

    const ip = getClientIP(request);
    const supabaseClient = createServerClient();

    const bonitaetScore = 'bonitaetScore' in ergebnis ? ergebnis.bonitaetScore : 0;
    const bonitaetLabel = 'bonitaetLabel' in ergebnis ? ergebnis.bonitaetLabel : '';
    const maxKredit = 'maxKredit' in ergebnis ? ergebnis.maxKredit : 0;
    const monatsRate = 'monatsRate' in ergebnis ? ergebnis.monatsRate : 0;
    const zinssatz = 'zinssatz' in ergebnis ? ergebnis.zinssatz : 0;
    const typLabel = typ === 'baufinanzierung' ? 'Baufinanzierung' : 'Privatkredit';

    // ── Supabase: Lead speichern ──
    const { data: lead, error: dbError } = await supabaseClient
      .from('leads')
      .insert({
        vorname, nachname, email,
        rechner_typ: typ,
        consent_datenschutz: consents.datenschutz,
        consent_kontakt: consents.kontakt,
        consent_newsletter: consents.newsletter,
        consent_ip: ip,
        eingaben, ergebnis,
        bonitaet_score: bonitaetScore,
        bonitaet_label: bonitaetLabel,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Supabase error:', dbError);
      return NextResponse.json({ success: false, error: 'Speicherfehler. Bitte versuchen Sie es erneut.' }, { status: 500 });
    }

    // Newsletter bei Opt-in
    if (consents.newsletter) {
      await supabaseClient.from('newsletter_subscribers').upsert(
        { email, vorname, nachname, lead_id: lead.id },
        { onConflict: 'email' }
      );
    }

    // ── PDF generieren ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(AkronaPDF, { data: body }) as any
    );

    const resend = getResend();
    const dateiname = `Akrona_Finanzierungsauswertung_${vorname}_${nachname}.pdf`.replace(/\s+/g, '_');

    // ── E-Mail an Nutzer (mit PDF) ──
    await resend.emails.send({
      from: 'Akrona GmbH <noreply@akrona.de>',
      to: email,
      replyTo: process.env.AKRONA_EMAIL ?? 'info@akrona.de',
      subject: 'Ihre Finanzierungsauswertung von Akrona GmbH',
      attachments: [
        {
          filename: dateiname,
          content: Buffer.from(pdfBuffer),
        },
      ],
      html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F5F0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:#0A3D2C;padding:32px 40px;border-bottom:1px solid rgba(212,175,55,0.2);">
          <p style="margin:0;color:#D4AF37;font-size:22px;font-weight:700;letter-spacing:1px;">AKRONA <span style="color:#fff;font-weight:300;">GmbH</span></p>
          <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.45);">§ 34c & § 34i GewO · IHK Region Stuttgart</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;">Guten Tag ${vorname},</p>
          <p style="margin:0 0 24px;color:#444;line-height:1.7;font-size:14px;">vielen Dank für Ihre Anfrage. Anbei finden Sie Ihre persönliche <strong>Finanzierungsauswertung als PDF</strong>.</p>

          <div style="background:#F7F5F0;border-radius:8px;padding:24px;margin-bottom:28px;border:1px solid #E8E2D9;">
            <p style="margin:0 0 4px;font-size:10px;color:#6b6b6b;text-transform:uppercase;letter-spacing:1px;">Ihre Bonität</p>
            <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0A3D2C;">${bonitaetLabel}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 16px 0 0;">
                  <p style="margin:0;font-size:11px;color:#6b6b6b;">Zinssatz-Basis</p>
                  <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#0A3D2C;">${(zinssatz*100).toFixed(1)}%</p>
                </td>
                <td>
                  <p style="margin:0;font-size:11px;color:#6b6b6b;">Max. ${typLabel === 'Baufinanzierung' ? 'Kredit' : 'Kreditrahmen'}</p>
                  <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#0A3D2C;">${fEuro(maxKredit)}</p>
                </td>
              </tr>
              <tr><td colspan="2" style="padding-top:16px;border-top:1px solid #E8E2D9;">
                <p style="margin:0;font-size:11px;color:#6b6b6b;">Monatliche Rate</p>
                <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#D4AF37;">ca. ${fEuro(monatsRate)}</p>
              </td></tr>
            </table>
          </div>

          <p style="margin:0 0 6px;font-size:13px;color:#444;line-height:1.7;">Die vollständige Auswertung mit Tilgungsplan, Szenarien und nächsten Schritten finden Sie im <strong>beigefügten PDF</strong>.</p>
          <p style="margin:0 0 32px;font-size:13px;color:#6b6b6b;line-height:1.7;">Diese Auswertung ist eine unverbindliche Ersteinschätzung — keine Bankzusage.</p>

          <p style="margin:0 0 2px;color:#1a1a1a;font-size:14px;font-weight:600;">Mit freundlichen Grüßen,</p>
          <p style="margin:0;color:#0A3D2C;font-size:14px;font-weight:700;">Alperen Akbal</p>
          <p style="margin:0;color:#6b6b6b;font-size:13px;">Akrona GmbH</p>
        </td></tr>
        <tr><td style="background:#0A3D2C;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);">© 2025 Akrona GmbH · <a href="mailto:info@akrona-gmbh.de" style="color:#D4AF37;text-decoration:none;">info@akrona-gmbh.de</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    // ── Interne Benachrichtigung ──
    await resend.emails.send({
      from: 'Akrona GmbH <noreply@akrona.de>',
      to: process.env.AKRONA_EMAIL ?? 'info@akrona.de',
      subject: `🔔 Neuer Lead: ${vorname} ${nachname} – ${typLabel}`,
      html: `<div style="font-family:Arial,sans-serif;padding:24px;max-width:500px;">
        <h2 style="color:#0A3D2C;margin:0 0 16px;">Neuer Lead eingegangen</h2>
        <table cellpadding="6" cellspacing="0" style="width:100%;">
          <tr><td style="color:#6b6b6b;width:120px;">Name:</td><td><strong>${vorname} ${nachname}</strong></td></tr>
          <tr><td style="color:#6b6b6b;">E-Mail:</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="color:#6b6b6b;">Typ:</td><td>${typLabel}</td></tr>
          <tr><td style="color:#6b6b6b;">Bonität:</td><td>${bonitaetLabel}</td></tr>
          <tr><td style="color:#6b6b6b;">Max. Kredit:</td><td><strong>${fEuro(maxKredit)}</strong></td></tr>
          <tr><td style="color:#6b6b6b;">Newsletter:</td><td>${consents.newsletter ? 'Ja' : 'Nein'}</td></tr>
          <tr><td style="color:#6b6b6b;">Zeitpunkt:</td><td>${new Date().toLocaleString('de-DE')}</td></tr>
        </table>
      </div>`,
    });

    // pdf_sent markieren
    await supabaseClient
      .from('leads')
      .update({ pdf_sent: true, pdf_sent_at: new Date().toISOString() })
      .eq('id', lead.id);

    return NextResponse.json({ success: true, leadId: lead.id, message: 'Ihre Auswertung wurde per E-Mail versendet.' });

  } catch (err) {
    console.error('send-pdf error:', err);
    return NextResponse.json(
      { success: false, error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    );
  }
}
