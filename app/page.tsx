import Image from "next/image";
import SwipeDemo from "./SwipeDemo";
import Hero from "./Hero";
import { Footer } from "./LegalPage";
import ScrollReveal from "./ScrollReveal";
import { Reveal, Words } from "./Reveal";

const STEPS = [
  {
    n: "1",
    title: "Crée le groupe",
    text: "Un lien d'invitation dans la conv WhatsApp, et tout le monde rejoint en 10 secondes. Pas besoin de compte pour voter.",
  },
  {
    n: "2",
    title: "Chacun donne ses envies",
    text: "Budget, quartier, distance max, dispos, type d'activité. Chacun de son côté, sans débat.",
  },
  {
    n: "3",
    title: "Swipez, ça matche",
    text: "Des restos et activités réels autour de vous. L'IA apprend les goûts du groupe et fait remonter le lieu qui plaît à tous.",
  },
];

const PROBLEMS = [
  ["Le débat", "Une soirée qui se joue sur des dizaines de messages, et une décision prise à 21h passées."],
  ["L'annulation", "Sans accord, la sortie glisse à « la semaine prochaine »… puis n'a jamais lieu."],
  ["La routine", "Toujours les mêmes lieux, parce que personne n'ose proposer autre chose."],
];
const TILTS = [-4, 3, -2];

const FREE = ["Toi et un pote", "10 adresses réelles à swiper", "1 atelier du jour trouvé par Bud", "Le lieu qui plaît le plus", "Le conseil IA de Bud"];
const PASS = ["Jusqu'à 4 personnes", "15 adresses à swiper", "3 ateliers du jour", "Tous les résultats, du 1er au dernier", "Pour cette sortie seulement"];
const PLUS = [
  "Toutes tes sorties, à vie",
  "Jusqu'à 15 personnes",
  "40 adresses à swiper",
  "Tous les ateliers du jour trouvés par Bud",
  "Tous les résultats, qui a aimé quoi",
  "Bud tranche les égalités et prépare un plan B",
  "Bud relance ceux qui n'ont pas swipé",
];

const FAQ: [string, string][] = [
  ["Mes amis doivent-ils créer un compte ?", "Non. Ils rejoignent avec le lien d'invitation, leur prénom et leur e-mail, sans mot de passe, et votent tout de suite."],
  ["Les lieux proposés sont-ils réels ?", "Oui : des restaurants, bars et activités existants autour de vous, filtrés selon le budget, la distance et les envies du groupe."],
  ["Comment fonctionne le match ?", "Chacun swipe de son côté. Dès qu'un lieu plaît à tout le groupe, Buddly vous l'annonce. Sinon, l'IA propose le meilleur compromis."],
  ["Que change Buddly+ ?", "Pour 3,99 € une seule fois, toutes tes sorties sont débloquées à vie : jusqu'à 15 personnes, 40 adresses, tous les résultats, le plan B de Bud et la relance des retardataires. Divisé par une bande de 6, ça fait 67 centimes chacun."],
  ["C'est un abonnement ?", "Non. Buddly+ (3,99 €) et le Pass Sortie (2,99 €, une seule sortie) sont des paiements uniques sécurisés par Stripe. Rien n'est prélevé ensuite."],
  ["Comment Buddly+ me reconnaît sur une nouvelle sortie ?", "Grâce à ton e-mail : crée ou rejoins une sortie avec la même adresse, et elle est débloquée automatiquement."],
];

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <ScrollReveal />
      <Hero />

      {/* PROBLÈME */}
      <section className="bg-plum py-20 text-paper">
        <div className="mx-auto max-w-6xl xl:max-w-7xl px-4 sm:px-6">
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            <Words text="Le plus dur dans une sortie, ce n'est pas d'y aller." accent="C'est de choisir." />
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {PROBLEMS.map(([big, small], i) => (
              <Reveal key={big} variant="pop" delay={i * 110} tilt={TILTS[i]} className="rounded-3xl bg-paper/10 p-6">
                <p className="font-display text-4xl font-bold text-coral">{big}</p>
                <p className="mt-2 text-lilac">{small}</p>
              </Reveal>
            ))}
          </div>
          <Reveal as="p" delay={150} className="mt-8 max-w-2xl text-lilac">
            Le budget de l&apos;un, le régime de l&apos;autre, celui qui habite à 40 minutes, celle qui ne
            peut que samedi. Personne ne veut trancher, alors personne ne tranche.
          </Reveal>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl xl:max-w-7xl scroll-mt-8 px-4 py-20 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <Reveal variant="pop" tilt={-5}>
            <SwipeDemo />
            <p className="mt-4 text-center text-sm text-muted">Essaie : glisse la carte ou utilise les boutons</p>
          </Reveal>
          <div>
            <h2 className="font-display text-4xl font-bold text-plum sm:text-5xl">
              <Words text="Comment ça marche" />
            </h2>
            <div className="mt-8 space-y-4">
              {STEPS.map((s, i) => (
                <Reveal
                  key={s.n}
                  variant="right"
                  delay={i * 120}
                  className="flex gap-5 rounded-3xl bg-paper p-6 shadow-[0_2px_0_rgba(67,32,122,0.08)]"
                >
                  <Reveal
                    as="span"
                    variant="pop"
                    delay={i * 120 + 220}
                    tilt={-12}
                    className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lilac font-display text-xl font-bold text-plum"
                  >
                    {s.n}
                  </Reveal>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{s.title}</h3>
                    <p className="mt-1 text-muted">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="scroll-mt-8 bg-lilac/60 py-20">
        <div className="mx-auto max-w-4xl xl:max-w-5xl px-4 sm:px-6">
          <h2 className="text-center font-display text-4xl font-bold text-plum sm:text-5xl">
            <Words text="Simple et" accent="sans surprise" />
          </h2>
          <div className="mt-12 grid items-stretch gap-5 md:grid-cols-3">
            <Reveal variant="left" className="flex flex-col rounded-3xl bg-paper p-7">
              <h3 className="font-display text-2xl font-semibold">Gratuit</h3>
              <p className="mt-2"><span className="font-display text-5xl font-bold">0 €</span></p>
              <ul className="mb-8 mt-6 space-y-3 text-muted">
                {FREE.map((f, i) => (
                  <Reveal as="li" key={f} delay={250 + i * 70} className="flex gap-2">
                    <span className="text-violet">✓</span>{f}
                  </Reveal>
                ))}
              </ul>
              <a href="/app" className="mt-auto block rounded-full border-2 border-plum py-3 text-center font-semibold text-plum hover:bg-lilac">
                Commencer
              </a>
            </Reveal>
            <Reveal variant="right" delay={120} className="relative flex flex-col rounded-3xl bg-plum p-7 text-paper shadow-xl ring-4 ring-coral/40 md:order-last">
              <Reveal
                as="span"
                variant="pop"
                delay={650}
                tilt={14}
                className="absolute -top-3 right-6 rounded-full bg-coral px-3 py-1 text-xs font-bold"
              >
                Recommandé
              </Reveal>
              <h3 className="font-display text-2xl font-semibold">Buddly+</h3>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-5xl font-bold">3,99 €</span>
                <span className="text-lilac">à vie</span>
                <span className="text-sm font-semibold text-coral">soit 0,67 € / pers.</span>
              </p>
              <ul className="mb-8 mt-6 space-y-3 text-lilac">
                {PLUS.map((f, i) => (
                  <Reveal as="li" key={f} delay={370 + i * 70} className="flex gap-2">
                    <span className="text-coral">✓</span>{f}
                  </Reveal>
                ))}
              </ul>
              <a href="/api/checkout?offre=plus" className="mt-auto block rounded-full bg-coral py-3 text-center font-semibold hover:brightness-105">
                Passer à Buddly+
              </a>
            </Reveal>
            <Reveal variant="up" delay={60} className="flex flex-col rounded-3xl bg-paper p-7">
              <h3 className="font-display text-2xl font-semibold">Pass Sortie</h3>
              <p className="mt-2">
                <span className="font-display text-5xl font-bold">2,99 €</span>
                <span className="text-muted"> / sortie</span>
              </p>
              <ul className="mb-8 mt-6 space-y-3 text-muted">
                {PASS.map((f, i) => (
                  <Reveal as="li" key={f} delay={300 + i * 70} className="flex gap-2">
                    <span className="text-violet">✓</span>{f}
                  </Reveal>
                ))}
              </ul>
              <a href="/api/checkout?offre=pass" className="mt-auto block rounded-full border-2 border-plum py-3 text-center font-semibold text-plum hover:bg-lilac">
                Prendre le Pass
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl xl:max-w-4xl scroll-mt-8 px-4 py-20 sm:px-6">
        <h2 className="text-center font-display text-4xl font-bold text-plum sm:text-5xl">
          <Words text="Questions fréquentes" />
        </h2>
        <div className="mt-10 space-y-3">
          {FAQ.map(([q, a], i) => (
            <Reveal key={q} delay={i * 70}>
              <details className="group rounded-2xl bg-paper p-5 open:shadow-[0_2px_0_rgba(67,32,122,0.08)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                  {q}
                  <span className="text-2xl text-violet transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-muted">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl xl:max-w-7xl px-4 py-20 text-center sm:px-6">
        <Reveal variant="pop" tilt={-8} className="mx-auto w-fit">
          <div className="buddy-float group relative mx-auto w-40 sm:w-48">
            <Image
              src="/buddy.png"
              alt="Bud, la mascotte de Buddly"
              width={640}
              height={560}
              className="hello relative z-10 w-full transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
            />
            <span className="buddy-shadow" aria-hidden />
          </div>
        </Reveal>
        <h2 className="mx-auto mt-6 max-w-xl font-display text-4xl font-bold text-plum sm:text-5xl">
          <Words text="Ce soir, c'est Buddly qui" accent="tranche." delay={150} />
        </h2>
        <Reveal variant="pop" delay={500} tilt={0} className="mt-8">
          <a href="/app" className="inline-block rounded-full bg-coral px-7 py-4 font-semibold text-paper">
            Créer mon groupe gratuitement
          </a>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
