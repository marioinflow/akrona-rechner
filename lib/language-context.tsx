'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { translations, Lang, TranslationKey } from './translations';

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

interface LanguageContextType {
  lang: Lang;
}

const LanguageContext = createContext<LanguageContextType>({ lang: 'de' });

function LangDetector({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lang: Lang = pathname.startsWith('/romania') ? 'ro' : 'de';

  return (
    <LanguageContext.Provider value={{ lang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  return <LangDetector>{children}</LangDetector>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  const { lang } = useLanguage();
  return (key: TranslationKey, vars?: Record<string, string | number>): string => {
    const str = (translations[lang][key] ?? translations.de[key]) as string;
    return interpolate(str, vars);
  };
}
