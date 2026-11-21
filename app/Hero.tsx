import Image from "next/image";

const I = {
  fork: "M7 2v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2 M9 12v10 M17 2c-1.7 0-3 2-3 5s1.3 4 3 4v11",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21a7 7 0 0 1 14 0 M17 3.5a4 4 0 0 1 0 7.5 M22 21a7 7 0 0 0-4-6.3",
  check: "M5 12.5l4.5 4.5L19 7",
  chat: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z M8.5 12h.01 M12 12h.01 M15.5 12h.01",
  heart: "M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.3 12 20 12 20z",
};

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

function Tile({ d, className, color = "text-violet" }: { d: string; className: string; color?: string }) {
  return (
    <div className={`absolute grid place-items-center rounded-3xl bg-paper shadow-[0_18px_40px_-12px_rgba(67,32,122,0.25)] ${className}`}>
      <Icon d={d} className={`size-1/2 ${color}`} />
    </div>
  );
}

function Laurel({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 48" className={`h-12 w-6 text-violet/60 ${flip ? "-scale-x-100" : ""}`} fill="currentColor" aria-hidden>
      <path d="M18 46C8 40 4 30 6 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {[38, 30, 22, 14].map((y, i) => (
        <g key={y}>
          <ellipse cx={i < 2 ? 7 : 5} cy={y} rx="2.6" ry="5" transform={`rotate(-35 ${i < 2 ? 7 : 5} ${y})`} />
          <ellipse cx={i < 2 ? 14 : 11} cy={y + 2} rx="2.4" ry="4.6" transform={`rotate(40 ${i < 2 ? 14 : 11} ${y + 2})`} />
        </g>
      ))}
      <ellipse cx="7" cy="7" rx="2.4" ry="5" />
    </svg>
  );
}

function Phone({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute flex flex-col overflow-hidden rounded-[1.6em] border-[0.4em] border-ink bg-paper p-[0.5em] shadow-[0_1.5em_3em_-1em_rgba(42,21,72,0.45)] ${className}`}>
      <span className="mx-auto mb-[0.5em] h-[0.45em] w-[3.5em] rounded-full bg-ink/90" />
      {children}
    </div>
  );
}

function PetScene() {
  return (
    <div className="mx-auto w-full max-w-[560px] [container-type:inline-size] lg:mr-[-30px]">
    <div className="relative aspect-[6/5] w-full text-[2cqw]">
      {/* corps + bras (derrière les téléphones) */}
      <svg viewBox="0 0 600 500" className="absolute inset-0 size-full overflow-visible" role="img" aria-label="Buddy, la mascotte Buddly, tient deux téléphones avec l'app">
        <defs>
          <linearGradient id="petg" gradientUnits="userSpaceOnUse" x1="300" y1="120" x2="640" y2="520">
            <stop offset="0" stopColor="#a56ff2" />
            <stop offset="1" stopColor="#7d46d9" />
          </linearGradient>
        </defs>
        <g fill="#f7806a">
          <rect x="300" y="88" width="24" height="74" rx="12" transform="rotate(-40 312 125)" />
          <rect x="365" y="60" width="24" height="74" rx="12" transform="rotate(-10 377 97)" />
          <rect x="262" y="160" width="24" height="66" rx="12" transform="rotate(-72 274 193)" />
        </g>
        <g fill="url(#petg)">
          <circle cx="330" cy="420" r="85" />
          <circle cx="400" cy="300" r="115" />
          <circle cx="520" cy="250" r="115" />
          <rect x="330" y="250" width="305" height="300" />
          <path d="M300 420 Q 250 400 200 372" fill="none" stroke="url(#petg)" strokeWidth="34" strokeLinecap="round" />
          <path d="M430 470 Q 410 470 385 455" fill="none" stroke="url(#petg)" strokeWidth="34" strokeLinecap="round" />
        </g>
        <g stroke="#9b6be8" strokeWidth="7" strokeLinecap="round">
          <path d="M622 300 l26 -14" />
          <path d="M628 326 l28 2" />
        </g>
        <circle cx="405" cy="300" r="54" fill="#fdf8ff" />
        <circle cx="522" cy="262" r="52" fill="#fdf8ff" />
        <ellipse cx="421" cy="288" rx="32" ry="36" fill="#2d1748" />
        <ellipse cx="536" cy="250" rx="31" ry="35" fill="#2d1748" />
        <circle cx="409" cy="272" r="9" fill="#fff" />
        <circle cx="524" cy="235" r="9" fill="#fff" />
        <path d="M455 372c22-26 62-34 88-28 7 31-5 60-34 71-27 10-55-9-59-30-1-5 1-9 5-13z" fill="#2d1748" />
        <path d="M468 404c10-17 38-22 56-11-5 15-18 24-32 25-11 1-20-5-24-14z" fill="#ff8a80" />
      </svg>

      {/* téléphones */}
      <Phone className="left-[6%] top-[24%] h-[56%] w-[23%] -rotate-[10deg]">
        <p className="text-[0.75em] font-semibold text-muted">Vendredi soir · 4 amis</p>
        <div className="mt-[0.5em] flex flex-1 flex-col justify-end rounded-[1em] bg-gradient-to-br from-coral to-[#f9a58f] p-[0.7em] text-paper">
          <span className="self-end rounded-full bg-paper/25 px-[0.5em] text-[0.7em] font-semibold">650 m</span>
          <span className="mt-auto text-[0.7em] opacity-90">Pizzeria · €€</span>
          <span className="font-display text-[1.25em] font-bold leading-tight">Chez Nonna</span>
          <span className="mt-[0.3em] text-[0.65em] opacity-90">2/3 amis ont dit oui</span>
        </div>
        <div className="mt-[0.6em] flex justify-center gap-[0.8em]">
          <span className="grid size-[2.3em] place-items-center rounded-full border border-ink/10 text-[0.9em] text-muted">✕</span>
          <span className="grid size-[2.3em] place-items-center rounded-full bg-coral text-[0.9em] text-paper">♥</span>
        </div>
      </Phone>
      <Phone className="left-[40%] top-[46%] h-[56%] w-[23%] rotate-[7deg]">
        <div className="flex flex-1 flex-col items-center justify-center rounded-[1em] bg-plum p-[0.6em] text-center text-paper">
          <Image src="/pet.png" alt="" width={64} height={64} className="size-[3.2em] rounded-[0.8em]" />
          <span className="mt-[0.6em] font-display text-[1.15em] font-bold leading-tight">C&apos;est un match !</span>
          <span className="mt-[0.3em] text-[0.68em] text-lilac">Les 4 veulent aller chez Saïgon Street</span>
          <span className="mt-[0.8em] rounded-full bg-coral px-[0.9em] py-[0.35em] text-[0.7em] font-semibold">Réserver pour 4</span>
        </div>
      </Phone>

      {/* mains (devant les téléphones) */}
      <svg viewBox="0 0 600 500" className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
        <g fill="#9160e8" stroke="#6f3cc9" strokeWidth="2">
          <ellipse cx="198" cy="372" rx="21" ry="25" transform="rotate(-25 198 372)" />
          <ellipse cx="383" cy="452" rx="21" ry="25" transform="rotate(10 383 452)" />
        </g>
      </svg>

      <Tile d={I.fork} className="left-[2%] top-[-4%] size-[13%] -rotate-6" />
      <Tile d={I.pin} className="left-[34%] top-[-8%] size-[10%] rotate-6" color="text-coral" />
      <Tile d={I.users} className="right-[-2%] top-[2%] size-[12%] rotate-12" />
    </div>
    </div>
  );
}

export function Nav() {
  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <a href="#" aria-label="Buddly, accueil" className="shrink-0">
        <Image src="/logo.png" alt="Buddly" width={940} height={420} priority className="h-10 w-auto sm:h-12" />
      </a>
      <nav className="hidden items-center gap-10 text-[15px] font-semibold text-ink md:flex">
        <a href="#fonctionnalites" className="hover:text-violet">Fonctionnalités</a>
        <a href="#tarifs" className="hover:text-violet">Tarifs</a>
        <a href="#faq" className="hover:text-violet">FAQ</a>
      </nav>
      <div className="flex items-center gap-2">
        <a href="#tarifs" className="hidden rounded-full bg-lilac px-5 py-2.5 text-sm font-semibold text-plum hover:bg-[#e2d3fc] sm:block">
          Se connecter
        </a>
        <a href="#tarifs" className="rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ink">
          Commencer gratuitement
        </a>
      </div>
    </header>
  );
}

const FEATURES = [
  { d: I.chat, title: "Fini les débats", text: "Plus de conv interminable : chacun vote de son côté." },
  { d: I.users, title: "Swipez entre amis", text: "Le groupe swipe, Buddly trouve ce qui plaît à tous." },
  { d: I.pin, title: "Des lieux réels", text: "Restos et activités près de vous, selon votre budget." },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf7fb] to-[#f7f0fd]">
      <Nav />

      {/* fond violet derrière la mascotte */}
      <div className="pointer-events-none absolute -right-40 top-24 hidden size-[640px] rounded-full bg-lilac/70 lg:block" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-6 pt-6 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-10 lg:pt-6">
        <div className="relative z-10">
          <h1 className="font-display text-[3.4rem] font-bold leading-[0.98] tracking-tight text-ink sm:text-7xl lg:text-[5rem]">
            Sortez plus,
            <span className="relative mt-2 inline-block">
              <span className="absolute -inset-x-4 inset-y-2 -z-0 rounded-full bg-lilac" />
              <span className="relative text-plum">ensemble.</span>
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Des dizaines de messages, personne qui tranche, et la soirée tombe à l&apos;eau. Avec Buddly,
            chacun swipe des restos et activités autour de vous : quand tout le groupe dit oui, c&apos;est
            un match.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#tarifs"
              className="rounded-full bg-coral px-6 py-3.5 font-semibold text-paper shadow-[0_8px_0_-2px_#d9604b] transition hover:translate-y-0.5 hover:shadow-[0_5px_0_-2px_#d9604b]"
            >
              Créer mon groupe
            </a>
            <a
              href="#fonctionnalites"
              className="inline-flex items-center gap-2 rounded-full border-2 border-lilac bg-paper/60 px-5 py-3 font-semibold text-plum hover:bg-paper"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden><path d="M7 4.5v15l12-7.5z" /></svg>
              Voir la démo
            </a>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Laurel />
            <p className="text-center text-sm leading-tight text-muted">
              <b className="text-ink">Gratuit</b> jusqu&apos;à 4 amis
              <br />
              sans carte bancaire
            </p>
            <Laurel flip />
          </div>
        </div>

        <div className="relative">
          <PetScene />
        </div>
      </div>

      {/* vagues */}
      <div className="relative z-10 -mt-8 lg:-mt-14">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block h-[60px] w-full sm:h-[90px] lg:h-[120px]" aria-hidden>
          <path d="M0 60C240 0 520 0 780 40S1220 50 1440 0V120H0z" fill="#f5eefd" />
          <path d="M0 88C280 38 560 46 840 76S1260 52 1440 14V120H0z" fill="#efe5fd" />
        </svg>
        <div className="bg-[#efe5fd]">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 pt-0 sm:grid-cols-3 sm:px-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-paper/80">
                  <Icon d={f.d} className="size-7 text-violet" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">{f.title}</h3>
                  <p className="mt-1 text-[15px] text-muted">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { I as icons };
