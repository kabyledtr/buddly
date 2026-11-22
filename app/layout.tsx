import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MetaPixel from "./MetaPixel";

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

// La page va jusqu'aux bords de l'écran (zone de la barre d'accueil de l'iPhone comprise)
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  title: "Buddly — Swipez, Matchez, Sortez !",
  description:
    "Buddly organise vos sorties entre amis : chacun swipe des restos et activités près de chez vous, et l'IA trouve le lieu qui plaît à tout le groupe.",
  metadataBase: new URL("https://buddly.io"),
  // nom sous l'icône quand on ajoute le site à l'écran d'accueil de l'iPhone
  appleWebApp: { capable: true, title: "Buddly", statusBarStyle: "default" },
  openGraph: {
    title: "Buddly — Swipez, Matchez, Sortez !",
    description: "Fini les 100 messages pour choisir où sortir : chacun swipe, et Buddly trouve le lieu qui plaît à tout le groupe.",
    url: "https://buddly.io",
    siteName: "Buddly",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buddly — Swipez, Matchez, Sortez !",
    description: "Fini les 100 messages pour choisir où sortir : chacun swipe, et Buddly trouve le lieu qui plaît à tout le groupe.",
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
        <MetaPixel />
      </body>
    </html>
  );
}
