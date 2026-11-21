import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nouvelle sortie · Buddly" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
