import Image from "next/image";
import Link from "next/link";
import { Footer } from "./LegalPage";
import { CITIES, THEMES, cityPath, themePath } from "@/lib/seo";

/** Gabarit commun des pages guides : en-tête, contenu, appel à l'action, liens internes, pied de page. */
export default function SeoShell({
  crumbs,
  jsonLd,
  children,
}: {
  crumbs: { name: string; href: string }[];
  jsonLd: object[];
  children: React.ReactNode;
}) {
  return (
    <>
      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
      <header className="mx-auto flex max-w-6xl xl:max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Buddly, accueil" draggable={false}>
          <Image src="/logo.png" alt="Buddly" width={940} height={420} draggable={false} className="h-10 w-auto select-none sm:h-12" />
        </Link>
        <Link href="/app" className="rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ink">
          Créer une sortie
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
          {crumbs.map((c, i) => (
            <span key={c.href}>
              {i > 0 && " › "}
              {i < crumbs.length - 1 ? (
                <Link href={c.href} className="hover:text-ink">
                  {c.name}
                </Link>
              ) : (
                <span className="text-ink">{c.name}</span>
              )}
            </span>
          ))}
        </nav>
        <article className="seo mt-6 space-y-8 text-[16px] leading-relaxed text-ink/90">{children}</article>

        <div className="mt-12 rounded-[2rem] bg-plum p-7 text-paper">
          <p className="font-display text-2xl font-bold">Fini les débats dans la conv.</p>
          <p className="mt-2 text-lilac">
            Crée une sortie en 3 questions, partage le lien, et chacun swipe de vrais lieux autour de vous. Ce qui plaît à tout le
            monde, c&apos;est un match.
          </p>
          <Link href="/app" className="mt-5 inline-block rounded-full bg-coral px-6 py-3 font-semibold">
            Créer une sortie gratuitement
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-plum">Sortir entre amis dans ta ville</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Link key={c.slug} href={cityPath(c)} className="rounded-full bg-lilac/70 px-3 py-1.5 text-sm font-medium text-plum hover:bg-lilac">
                {c.name}
              </Link>
            ))}
          </div>
          <h2 className="mt-8 font-display text-xl font-semibold text-plum">Plus d&apos;idées</h2>
          <ul className="mt-3 space-y-1.5">
            {THEMES.map((t) => (
              <li key={t.slug}>
                <Link href={themePath(t)} className="text-violet underline-offset-4 hover:underline">
                  {t.h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold text-plum">Questions fréquentes</h2>
      <div className="mt-4 space-y-3">
        {items.map((f) => (
          <details key={f.q} className="rounded-2xl bg-paper p-5" open>
            <summary className="cursor-pointer font-semibold text-ink">{f.q}</summary>
            <p className="mt-2 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export const faqLd = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const crumbsLd = (crumbs: { name: string; href: string }[], site: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: site + c.href })),
});
