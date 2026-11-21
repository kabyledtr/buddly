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

function PetScene() {
  const noDrag = { draggable: false };
  const handClip = (c: string) => (
    <Image
      src="/pet-phones.png"
      alt=""
      width={1100}
      height={950}
      {...noDrag}
      className="pointer-events-none absolute inset-0 size-full select-none"
      style={{ clipPath: c }}
    />
  );
  return (
    <div className="mx-auto w-full max-w-[600px] [container-type:inline-size] lg:mr-[-50px]">
      <div className="relative aspect-[1100/950] w-full select-none text-[2cqw] [-webkit-touch-callout:none] [&_img]:[-webkit-user-drag:none]">
        {/* cercle violet clair */}
        <div className="absolute left-[20%] top-[6%] aspect-square w-[78%] rounded-full bg-lilac" />

        <Image
          src="/pet-phones.png"
          alt="Buddy, la mascotte Buddly, tient deux téléphones avec l'app"
          width={1100}
          height={950}
          priority
          {...noDrag}
          className="pointer-events-none absolute inset-0 size-full select-none"
        />

        {/* écran 1 : swipe */}
        <div
          className="absolute flex flex-col overflow-hidden rounded-[1.3em] bg-paper p-[0.55em] pt-[1.9em]"
          style={{ left: "11.9%", top: "26%", width: "17.8%", height: "42.9%", transform: "rotate(-11deg)" }}
        >
          <p className="text-[0.7em] font-semibold text-muted">Vendredi · 4 amis</p>
          <div className="mt-[0.4em] flex flex-1 flex-col rounded-[0.9em] bg-gradient-to-br from-coral to-[#f9a58f] p-[0.6em] text-paper">
            <span className="self-end rounded-full bg-paper/25 px-[0.5em] text-[0.65em] font-semibold">650 m</span>
            <span className="mt-auto text-[0.65em] opacity-90">Pizzeria · €€</span>
            <span className="font-display text-[1.15em] font-bold leading-tight">Chez Nonna</span>
          </div>
          <div className="mt-[0.5em] flex justify-center gap-[0.7em]">
            <span className="grid size-[2.1em] place-items-center rounded-full border border-ink/10 text-[0.85em] text-muted">✕</span>
            <span className="grid size-[2.1em] place-items-center rounded-full bg-coral text-[0.85em] text-paper">♥</span>
          </div>
        </div>

        {/* écran 2 : match */}
        <div
          className="absolute flex flex-col overflow-hidden rounded-[1.3em] bg-paper p-[0.55em] pt-[1.9em]"
          style={{ left: "29.3%", top: "37.6%", width: "18.4%", height: "42%", transform: "rotate(7deg)" }}
        >
          <div className="flex flex-1 flex-col items-center justify-center rounded-[0.9em] bg-plum p-[0.5em] text-center text-paper">
            <Image src="/pet.png" alt="" width={64} height={64} {...noDrag} className="size-[3em] rounded-[0.7em]" />
            <span className="mt-[0.5em] font-display text-[1.1em] font-bold leading-tight">C&apos;est un match !</span>
            <span className="mt-[0.3em] text-[0.62em] text-lilac">Les 4 veulent aller chez Saïgon Street</span>
            <span className="mt-[0.7em] rounded-full bg-coral px-[0.8em] py-[0.3em] text-[0.65em] font-semibold">Réserver</span>
          </div>
        </div>

        {/* mains par-dessus les écrans */}
        {handClip("circle(4.6% at 13.7% 54.9%)")}
        {handClip("circle(5% at 44.5% 67.8%)")}
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

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-6 pt-6 sm:px-6 lg:min-h-[calc(100svh-88px)] lg:grid-cols-[1.05fr_1fr] lg:pb-16 lg:pt-0">
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
      <div className="relative z-10 -mt-8 lg:mt-0">
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
