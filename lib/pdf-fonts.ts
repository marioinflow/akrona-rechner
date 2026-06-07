/**
 * Zentrale Schriftregistrierung für alle @react-pdf-Templates.
 *
 * Inter als eingebettete TTF (statische Instanzen 400/700, aus dem Variable
 * Font instanziert via fonttools). Deckt rumänische Diakritika vollständig
 * (ă ș ț î â) — die @react-pdf-Standardschrift Helvetica kann diese nicht.
 *
 * Schriftdateien: public/fonts/Inter-{Regular,Bold}.ttf
 * Werden serverseitig (renderToBuffer) über das Dateisystem geladen.
 */

import { Font } from '@react-pdf/renderer';
import path from 'path';

let registered = false;

export function registerPdfFonts() {
  if (registered) return;

  Font.register({
    family: 'Inter',
    fonts: [
      { src: path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf'), fontWeight: 'normal' },
      { src: path.join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf'),    fontWeight: 'bold' },
    ],
  });

  // Worttrennung deaktivieren — sonst zerteilt @react-pdf lange Wörter mit Bindestrich.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}
