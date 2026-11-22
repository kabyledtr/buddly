import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoShell, { Faq, crumbsLd, faqLd } from "../../SeoShell";
import { SITE, THEMES, themePath } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return THEMES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = THEMES.find((x) => x.slug === slug);
  if (!t) return {};
  const title = `${t.title} · Buddly`;
  return {
    title,
    description: t.description,
    alternates: { canonical: themePath(t) },
    openGraph: { title, description: t.description, url: SITE + themePath(t), siteName: "Buddly", type: "article", locale: "fr_FR" },
  };
}

export default async function ThemePage({ params }: Props) {
  const { slug } = await params;
  const t = THEMES.find((x) => x.slug === slug);
  if (!t) notFound();
  const crumbs = [
    { name: "Accueil", href: "/" },
    { name: "Idées de sorties", href: "/idees" },
    { name: t.h1, href: themePath(t) },
  ];
  return (
    <SeoShell crumbs={crumbs} jsonLd={[faqLd(t.faq), crumbsLd(crumbs, SITE)]}>
      <header>
        <h1 className="font-display text-4xl font-bold leading-tight text-plum sm:text-5xl">{t.h1}</h1>
        <p className="mt-4 text-lg text-muted">{t.intro}</p>
      </header>
      {t.sections.map((s) => (
        <section key={s.h}>
          <h2 className="font-display text-2xl font-semibold text-plum">{s.h}</h2>
          <p className="mt-3">{s.p}</p>
        </section>
      ))}
      <Faq items={t.faq} />
    </SeoShell>
  );
}
