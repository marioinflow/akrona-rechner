import { NextRequest, NextResponse } from 'next/server';
import { berechneBaufinanzierung, berechnePrivatkredit } from '@/lib/berechnung';
import { createServerClient } from '@/lib/supabase';
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

    let ergebnis;

    if (typ === 'baufinanzierung') {
      ergebnis = berechneBaufinanzierung(eingaben as BaufinanzierungEingaben);
    } else if (typ === 'privatkredit') {
      ergebnis = berechnePrivatkredit(eingaben as PrivatkreditEingaben);
    } else {
      return NextResponse.json(
        { success: false, error: 'Unbekannter Rechner-Typ.' },
        { status: 400 }
      );
    }

    // Calculation-Session speichern (schlägt still fehl wenn Tabelle fehlt)
    let sessionId: string | undefined;
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from('calculation_sessions')
        .insert({
          product_type: typ,
          request_payload_json: eingaben,
          response_payload_json: ergebnis,
        })
        .select('id')
        .single();
      sessionId = data?.id;
    } catch {
      // Nicht kritisch — Session-Tracking optional
    }

    return NextResponse.json({ success: true, ergebnis, sessionId });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Berechnungsfehler. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    );
  }
}
