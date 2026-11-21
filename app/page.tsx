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

const FREE = ["Jusqu'à 4 amis par groupe", "15 adresses réelles à swiper", "Le lieu qui plaît le plus au groupe", "Le conseil IA de Buddly"];
const PREMIUM = [
  "Jusqu'à 15 amis par groupe",
  "40 adresses à swiper",
  "Le classement complet du groupe",
  "Qui a aimé quoi, lieu par lieu",
];

const FAQ: [string, string][] = [
  ["Mes amis doivent-ils créer un compte ?", "Non. Ils rejoignent le groupe avec le lien d'invitation et peuvent voter tout de suite."],
  ["Les lieux proposés sont-ils réels ?", "Oui : des restaurants, bars et activités existants autour de vous, filtrés selon le budget, la distance et les envies du groupe."],
  ["Comment fonctionne le match ?", "Chacun swipe de son côté. Dès qu'un lieu plaît à tout le groupe, Buddly vous l'annonce. Sinon, l'IA propose le meilleur compromis."],
  ["Que débloque le Pass Sortie ?", "Pour 0,99 € une seule fois, toute la sortie est débloquée pour le groupe : jusqu'à 15 amis, 40 adresses à swiper et le classement complet."],
  ["C'est un abonnement ?", "Non. Le Pass Sortie est un paiement unique de 0,99 € par sortie, sécurisé par Stripe. Rien n'est prélevé ensuite."],
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
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Reveal variant="left" className="rounded-3xl bg-paper p-8">
              <h3 className="font-display text-2xl font-semibold">Gratuit</h3>
              <p className="mt-2"><span className="font-display text-5xl font-bold">0 €</span></p>
              <ul className="mt-6 space-y-3 text-muted">
                {FREE.map((f, i) => (
                  <Reveal as="li" key={f} delay={250 + i * 70} className="flex gap-2">
                    <span className="text-violet">✓</span>{f}
                  </Reveal>
                ))}
              </ul>
              <a href="/app" className="mt-8 block rounded-full border-2 border-plum py-3 text-center font-semibold text-plum hover:bg-lilac">
                Commencer
              </a>
            </Reveal>
            <Reveal variant="right" delay={120} className="relative rounded-3xl bg-plum p-8 text-paper">
              <Reveal
                as="span"
                variant="pop"
                delay={650}
                tilt={14}
                className="absolute -top-3 right-6 rounded-full bg-coral px-3 py-1 text-xs font-bold"
              >
                Le plus choisi
              </Reveal>
              <h3 className="font-display text-2xl font-semibold">Pass Sortie</h3>
              <p className="mt-2">
                <span className="font-display text-5xl font-bold">0,99 €</span>
                <span className="text-lilac"> / sortie</span>
              </p>
              <ul className="mt-6 space-y-3 text-lilac">
                {PREMIUM.map((f, i) => (
                  <Reveal as="li" key={f} delay={370 + i * 70} className="flex gap-2">
                    <span className="text-coral">✓</span>{f}
                  </Reveal>
                ))}
              </ul>
              <a href="/app" className="mt-8 block rounded-full bg-coral py-3 text-center font-semibold hover:brightness-105">
                Créer une sortie
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
              alt="Buddly, la mascotte"
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
