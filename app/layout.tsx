import type { Metadata } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Buddly — Swipez, Matchez, Sortez !",
  description:
    "Buddly organise vos sorties entre amis : chacun swipe des restos et activités près de chez vous, et l'IA trouve le lieu qui plaît à tout le groupe.",
  metadataBase: new URL("https://buddly.io"),
  icons: { icon: "/pet.png", apple: "/pet.png" },
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
