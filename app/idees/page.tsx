import type { Metadata } from "next";
import Link from "next/link";
import SeoShell, { crumbsLd } from "../SeoShell";
import { CITIES, SITE, THEMES, cityPath, themePath } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Idées de sorties entre amis, ville par ville · Buddly",
  description:
    "Tous nos guides pour sortir entre amis : idées de restos, bars et activités originales, sorties pas chères, afterworks, anniversaires, et les quartiers où sortir dans chaque grande ville.",
  alternates: { canonical: "/idees" },
};

export default function IdeasHub() {
  const crumbs = [
    { name: "Accueil", href: "/" },
    { name: "Idées de sorties", href: "/idees" },
  ];
  return (
    <SeoShell crumbs={crumbs} jsonLd={[crumbsLd(crumbs, SITE)]}>
      <header>
        <h1 className="font-display text-4xl font-bold leading-tight text-plum sm:text-5xl">Idées de sorties entre amis</h1>
        <p className="mt-4 text-lg text-muted">
          Des idées concrètes pour sortir entre amis, et les quartiers où aller dans les grandes villes de France.
        </p>
      </header>
      <section>
        <h2 className="font-display text-2xl font-semibold text-plum">Nos guides</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {THEMES.map((t) => (
            <li key={t.slug}>
              <Link href={themePath(t)} className="block h-full rounded-2xl bg-paper p-5 hover:shadow-md">
                <span className="font-display text-lg font-semibold text-plum">{t.h1}</span>
                <span className="mt-1 block text-sm text-muted">{t.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl font-semibold text-plum">Par ville</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CITIES.map((c) => (
            <li key={c.slug}>
              <Link href={cityPath(c)} className="block rounded-2xl bg-lilac/60 p-4 font-semibold text-plum hover:bg-lilac">
                Sortir {c.at}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SeoShell>
  );
}
