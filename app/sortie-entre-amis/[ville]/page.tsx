import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoShell, { Faq, crumbsLd, faqLd } from "../../SeoShell";
import { CITIES, SITE, cityPath } from "@/lib/seo";

type Props = { params: Promise<{ ville: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return CITIES.map((c) => ({ ville: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  const c = CITIES.find((x) => x.slug === ville);
  if (!c) return {};
  const title = `Que faire entre amis ${c.at} ? Idées de sorties · Buddly`;
  const description = `Restos, bars, activités originales ${c.at} : les quartiers où sortir entre amis et une façon simple de choisir un lieu qui plaît à tout le groupe.`;
  return {
    title,
    description,
    alternates: { canonical: cityPath(c) },
    openGraph: { title, description, url: SITE + cityPath(c), siteName: "Buddly", type: "article", locale: "fr_FR" },
  };
}

export default async function CityPage({ params }: Props) {
  const { ville } = await params;
  const c = CITIES.find((x) => x.slug === ville);
  if (!c) notFound();
  const crumbs = [
    { name: "Accueil", href: "/" },
    { name: "Idées de sorties", href: "/idees" },
    { name: `Sortir ${c.at}`, href: cityPath(c) },
  ];
  const faq = [
    {
      q: `Où sortir entre amis ${c.at} ?`,
      a: `Les quartiers les plus animés ${c.at} sont ${c.quartiers.map((x) => x.name).join(", ")}. Sur Buddly, indiquez votre point de rendez-vous et une distance : seuls les lieux proches et ouverts à votre créneau sont proposés.`,
    },
    {
      q: `Que faire ${c.at} avec un petit budget ?`,
      a: `Bars de quartier, street food, bars à jeux ou happy hours : il y a de quoi faire ${c.at} sans se ruiner. Sur Buddly, chacun indique son budget et le classement fait remonter les lieux qui conviennent à tout le monde.`,
    },
    {
      q: `Comment choisir un lieu ${c.at} à plusieurs ?`,
      a: "Créez une sortie sur Buddly, partagez le lien et laissez chacun swiper de vrais lieux. Ce qui plaît à tout le monde est un match ; sinon, Bud propose le meilleur compromis.",
    },
  ];
  return (
    <SeoShell crumbs={crumbs} jsonLd={[faqLd(faq), crumbsLd(crumbs, SITE)]}>
      <header>
        <h1 className="font-display text-4xl font-bold leading-tight text-plum sm:text-5xl">Que faire entre amis {c.at} ?</h1>
        <p className="mt-4 text-lg text-muted">{c.intro}</p>
      </header>

      <section>
        <h2 className="font-display text-2xl font-semibold text-plum">Les quartiers où sortir {c.at}</h2>
        <ul className="mt-3 space-y-2">
          {c.quartiers.map((q) => (
            <li key={q.name}>
              <strong className="text-ink">{q.name}</strong> : {q.text}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-plum">Idées de sorties entre amis {c.at}</h2>
        <p className="mt-3">
          <strong>Pour dîner :</strong> un resto où chacun trouve son plat, avec des options halal, végétariennes, vegan ou sans gluten si
          le groupe en a besoin.
        </p>
        <p className="mt-2">
          <strong>Pour l&apos;apéro :</strong> un bar à cocktails, une terrasse ou un bar à vin, ouvert à l&apos;heure qui vous arrange.
        </p>
        <p className="mt-2">
          <strong>Pour changer :</strong> escape game, karaoké, bowling, stand-up, atelier poterie ou cours de cuisine. Buddly cherche aussi
          les ateliers du jour publiés sur le web {c.at}.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-plum">Choisir sans débattre</h2>
        <p className="mt-3">
          Buddly propose de vrais lieux {c.at}, avec photos, notes et avis Google, ouverts sur votre créneau. Chaque ami swipe de son côté
          selon ses envies et son budget, et le lieu qui plaît à tout le groupe ressort tout seul.
        </p>
      </section>

      <Faq items={faq} />
    </SeoShell>
  );
}
