import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { AkronaPDF } from '@/lib/pdf-template';
import { berechneBaufinanzierung } from '@/lib/berechnung';
import type { LeadFormData, BaufinanzierungEingaben } from '@/types';

// Nur in Development verfügbar
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const eingaben: BaufinanzierungEingaben = {
    nettoeinkommen: 4500,
    eigenkapital: 60000,
    haushaltsgroesse: 2,
    laufzeit: 25,
    tilgungssatz: 0.02,
    status: 'angestellt',
    verwendungszweck: 'kauf',
    kaufpreis: 420000,
    bundesland: 'Baden-Württemberg',
    maklergebuehr: 3.57,
    kreditnehmer: 'allein',
  };

  const ergebnis = berechneBaufinanzierung(eingaben);

  const data: LeadFormData = {
    vorname: 'Max',
    nachname: 'Mustermann',
    email: 'max@test.de',
    telefon: '',
    typ: 'baufinanzierung',
    lang: 'de',
    eingaben,
    ergebnis,
    consents: { datenschutz: true, kontakt: true, newsletter: false },
  };

  const raw = await renderToBuffer(
    React.createElement(AkronaPDF, { data }) as React.ReactElement
  );

  return new NextResponse(Buffer.from(raw), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="akrona-preview.pdf"',
    },
  });
}
