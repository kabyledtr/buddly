import Image from "next/image";
import SwipeDemo from "./SwipeDemo";
import Hero from "./Hero";
import { Footer } from "./LegalPage";

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

const FREE = ["1 groupe actif", "Jusqu'à 4 amis par groupe", "20 lieux à swiper par sortie", "Matching de base"];
const PREMIUM = [
  "Groupes illimités",
  "Jusqu'à 15 amis par groupe",
  "Swipes illimités",
  "Recommandations IA selon les goûts du groupe",
  "Point de rendez-vous équitable pour tous",
];

const FAQ: [string, string][] = [
  ["Mes amis doivent-ils créer un compte ?", "Non. Ils rejoignent le groupe avec le lien d'invitation et peuvent voter tout de suite."],
  ["Les lieux proposés sont-ils réels ?", "Oui : des restaurants, bars et activités existants autour de vous, filtrés selon le budget, la distance et les envies du groupe."],
  ["Comment fonctionne le match ?", "Chacun swipe de son côté. Dès qu'un lieu plaît à tout le groupe, Buddly vous l'annonce. Sinon, l'IA propose le meilleur compromis."],
  ["Que débloque Premium ?", "Groupes et swipes illimités, jusqu'à 15 amis par groupe, des recommandations IA plus fines et un point de rendez-vous équitable pour tous."],
  ["Puis-je résilier quand je veux ?", "Oui, l'abonnement est sans engagement et se résilie à tout moment depuis votre compte."],
];

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Hero />

      {/* PROBLÈME */}
      <section className="bg-plum py-20 text-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Le plus dur dans une sortie, ce n&apos;est pas d&apos;y aller. C&apos;est de choisir.
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              ["Le débat", "Une soirée qui se joue sur des dizaines de messages, et une décision prise à 21h passées."],
              ["L'annulation", "Sans accord, la sortie glisse à « la semaine prochaine »… puis n'a jamais lieu."],
              ["La routine", "Toujours les mêmes lieux, parce que personne n'ose proposer autre chose."],
            ].map(([big, small]) => (
              <div key={big} className="rounded-3xl bg-paper/10 p-6">
                <p className="font-display text-4xl font-bold text-coral">{big}</p>
                <p className="mt-2 text-lilac">{small}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-lilac">
            Le budget de l&apos;un, le régime de l&apos;autre, celui qui habite à 40 minutes, celle qui ne
            peut que samedi. Personne ne veut trancher, alors personne ne tranche.
          </p>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-20 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SwipeDemo />
            <p className="mt-4 text-center text-sm text-muted">Essaie : glisse la carte ou utilise les boutons</p>
          </div>
          <div>
            <h2 className="font-display text-4xl font-bold text-plum sm:text-5xl">Comment ça marche</h2>
            <div className="mt-8 space-y-4">
              {STEPS.map((s) => (
                <div key={s.n} className="flex gap-5 rounded-3xl bg-paper p-6 shadow-[0_2px_0_rgba(67,32,122,0.08)]">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lilac font-display text-xl font-bold text-plum">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{s.title}</h3>
                    <p className="mt-1 text-muted">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="scroll-mt-8 bg-lilac/60 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-center font-display text-4xl font-bold text-plum sm:text-5xl">Simple et sans surprise</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl bg-paper p-8">
              <h3 className="font-display text-2xl font-semibold">Gratuit</h3>
              <p className="mt-2"><span className="font-display text-5xl font-bold">0 €</span></p>
              <ul className="mt-6 space-y-3 text-muted">
                {FREE.map((f) => <li key={f} className="flex gap-2"><span className="text-violet">✓</span>{f}</li>)}
              </ul>
              <a href="#" className="mt-8 block rounded-full border-2 border-plum py-3 text-center font-semibold text-plum hover:bg-lilac">
                Commencer
              </a>
            </div>
            <div className="relative rounded-3xl bg-plum p-8 text-paper">
              <span className="absolute -top-3 right-6 rounded-full bg-coral px-3 py-1 text-xs font-bold">Le plus choisi</span>
              <h3 className="font-display text-2xl font-semibold">Premium</h3>
              <p className="mt-2">
                <span className="font-display text-5xl font-bold">4,99 €</span>
                <span className="text-lilac"> / mois</span>
              </p>
              <ul className="mt-6 space-y-3 text-lilac">
                {PREMIUM.map((f) => <li key={f} className="flex gap-2"><span className="text-coral">✓</span>{f}</li>)}
              </ul>
              <a href="#" className="mt-8 block rounded-full bg-coral py-3 text-center font-semibold hover:brightness-105">
                Passer Premium
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-8 px-4 py-20 sm:px-6">
        <h2 className="text-center font-display text-4xl font-bold text-plum sm:text-5xl">Questions fréquentes</h2>
        <div className="mt-10 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-2xl bg-paper p-5 open:shadow-[0_2px_0_rgba(67,32,122,0.08)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                {q}
                <span className="text-2xl text-violet transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <Image src="/pet.png" alt="Buddy, la mascotte de Buddly" width={512} height={512} className="mx-auto size-28 rounded-[1.75rem]" />
        <h2 className="mx-auto mt-6 max-w-xl font-display text-4xl font-bold text-plum sm:text-5xl">
          Ce soir, c&apos;est Buddly qui tranche.
        </h2>
        <a href="#tarifs" className="mt-8 inline-block rounded-full bg-coral px-7 py-4 font-semibold text-paper">
          Créer mon groupe gratuitement
        </a>
      </section>

      <Footer />
    </main>
  );
}
