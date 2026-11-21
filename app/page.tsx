import Image from "next/image";
import SwipeDemo from "./SwipeDemo";

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

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* NAV */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#" aria-label="Buddly, accueil">
          <Image src="/logo.png" alt="Buddly" width={940} height={420} priority className="h-10 w-auto sm:h-12" />
        </a>
        <nav className="flex items-center gap-1 text-sm font-medium sm:gap-6">
          <a href="#comment" className="hidden text-muted hover:text-ink sm:block">Comment ça marche</a>
          <a href="#tarifs" className="hidden text-muted hover:text-ink sm:block">Tarifs</a>
          <a href="#tarifs" className="rounded-full bg-plum px-4 py-2 text-paper transition hover:bg-ink">
            Essayer gratuitement
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-lilac px-3 py-1 text-sm font-medium text-plum">
            <span className="size-2 rounded-full bg-coral" /> Pour les groupes d&apos;amis qui n&apos;arrivent jamais à choisir
          </p>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.02] text-plum sm:text-6xl lg:text-7xl">
            « On se fait quoi ce soir ? »
            <span className="block text-coral">Réglé en 2 minutes.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            87 messages dans le groupe, trois « je sais pas, comme vous voulez », et vous finissez
            au même endroit que d&apos;habitude. Avec Buddly, chacun swipe des restos et des
            activités autour de vous. Quand tout le monde dit oui, c&apos;est un match.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#tarifs"
              className="rounded-full bg-coral px-6 py-3.5 font-semibold text-paper shadow-[0_8px_0_-2px_#d9604b] transition hover:translate-y-0.5 hover:shadow-[0_5px_0_-2px_#d9604b]"
            >
              Créer mon groupe
            </a>
            <a href="#comment" className="rounded-full px-5 py-3.5 font-semibold text-plum hover:bg-lilac">
              Voir comment ça marche →
            </a>
          </div>
          <p className="mt-4 text-sm text-muted">Gratuit jusqu&apos;à 4 amis. Sans carte bancaire.</p>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 hidden rotate-[-8deg] rounded-2xl bg-paper px-4 py-3 text-sm shadow-lg sm:block">
            <p className="font-semibold">Léa</p>
            <p className="text-muted">ok mais pas trop loin svp 🙏</p>
          </div>
          <SwipeDemo />
          <p className="mt-4 text-center text-sm text-muted">Essaie : glisse la carte ou utilise les boutons</p>
        </div>
      </section>

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

      {/* COMMENT */}
      <section id="comment" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-20 sm:px-6">
        <h2 className="font-display text-4xl font-bold text-plum sm:text-5xl">Comment ça marche</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-3xl bg-paper p-7 shadow-[0_2px_0_rgba(67,32,122,0.08)]">
              <span className="grid size-11 place-items-center rounded-2xl bg-lilac font-display text-xl font-bold text-plum">
                {s.n}
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </div>
          ))}
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

      <footer className="border-t border-plum/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Buddly</p>
          <p>Fait avec ♥ pendant la FounderRace</p>
        </div>
      </footer>
    </main>
  );
}
