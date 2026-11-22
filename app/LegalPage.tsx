import Image from "next/image";
import Link from "next/link";
import SupportButton from "./SupportButton";

export const CONTACT_EMAIL = "contact@buddly.io";
export const UPDATED = "21 novembre 2026";

export function Footer() {
  return (
    <footer className="border-t border-plum/10">
      <div className="mx-auto flex max-w-6xl xl:max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© 2026 Buddly</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/mentions-legales" className="hover:text-ink">Mentions légales</Link>
          <Link href="/cgv" className="hover:text-ink">Conditions générales de vente</Link>
          <SupportButton email={CONTACT_EMAIL} />
        </nav>
      </div>
    </footer>
  );
}

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <header className="mx-auto flex max-w-6xl xl:max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Buddly, accueil" draggable={false}>
          <Image src="/logo.png" alt="Buddly" width={940} height={420} draggable={false} className="h-10 w-auto select-none sm:h-12 [-webkit-user-drag:none]" />
        </Link>
        <Link href="/" className="text-sm font-medium text-muted hover:text-ink">← Retour à l&apos;accueil</Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6">
        <h1 className="font-display text-4xl font-bold text-plum sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">Dernière mise à jour : {UPDATED}</p>
        <div className="legal mt-10 space-y-8 text-[15px] leading-relaxed text-ink/90">{children}</div>
      </main>
      <Footer />
    </>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-semibold text-plum">{title}</h2>
      {children}
    </section>
  );
}
