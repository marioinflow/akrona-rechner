import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Akzeptiert "40.000", "40 000", "40000", "40.000 €" etc. und gibt 40000 zurück.
// Verhindert den Locale-Bug, bei dem <input type="number"> den Punkt als Dezimaltrenner liest.
export function parseNumberInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  return digits === '' ? 0 : Number(digits);
}

export function parseOptionalNumberInput(value: string): number | undefined {
  const digits = value.replace(/\D/g, '');
  return digits === '' ? undefined : Number(digits);
}

// Formatiert Zahl mit Tausenderpunkten für Live-Anzeige im Input. 0/undefined → "".
export function formatNumberInput(value: number | undefined): string {
  if (!value) return '';
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(value);
}
