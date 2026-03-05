import { NextRequest, NextResponse } from 'next/server';
import { berechneBaufinanzierung, berechnePrivatkredit } from '@/lib/berechnung';
import type { BaufinanzierungEingaben, PrivatkreditEingaben } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { typ, eingaben } = body;

    if (!typ || !eingaben) {
      return NextResponse.json(
        { success: false, error: 'Pflichtfelder fehlen.' },
        { status: 400 }
      );
    }

    if (typ === 'baufinanzierung') {
      const ergebnis = berechneBaufinanzierung(eingaben as BaufinanzierungEingaben);
      return NextResponse.json({ success: true, teilergebnis: ergebnis });
    }

    if (typ === 'privatkredit') {
      const ergebnis = berechnePrivatkredit(eingaben as PrivatkreditEingaben);
      return NextResponse.json({ success: true, teilergebnis: ergebnis });
    }

    return NextResponse.json(
      { success: false, error: 'Unbekannter Rechner-Typ.' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Berechnungsfehler. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    );
  }
}
