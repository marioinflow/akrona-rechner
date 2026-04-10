import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finanzierungsrechner | Akrona GmbH",
  description:
    "Ermitteln Sie Ihre persönliche Finanzierungsmöglichkeit kostenlos und unverbindlich. Baufinanzierung & Privatkredit — Akrona GmbH, IHK Region Stuttgart.",
  keywords: "Baufinanzierung, Privatkredit, Finanzierungsrechner, Immobilien, Stuttgart, Akrona",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${manrope.className} antialiased`}>
          <LanguageProvider>{children}</LanguageProvider>
        </body>
    </html>
  );
}
