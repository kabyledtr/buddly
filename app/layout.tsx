import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Polices hébergées dans le projet (SIL OFL) : aucun téléchargement pendant le build.
const display = localFont({
  src: "./fonts/fredoka-latin.woff2",
  variable: "--font-fredoka",
  weight: "500 700",
  display: "swap",
});

const body = localFont({
  src: "./fonts/dmsans-latin.woff2",
  variable: "--font-dmsans",
  weight: "100 1000",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buddly — Swipez, Matchez, Sortez !",
  description:
    "Buddly organise vos sorties entre amis : chacun swipe des restos et activités près de chez vous, et l'IA trouve le lieu qui plaît à tout le groupe.",
  metadataBase: new URL("https://buddly.io"),
  openGraph: {
    title: "Buddly",
    description: "Swipez ensemble, sortez ensemble.",
    url: "https://buddly.io",
    siteName: "Buddly",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Active les animations au scroll avant le premier rendu (sans JS, tout reste visible) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('rv')" }} />
      </head>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
