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

function Pet({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 380" className={className} aria-label="Buddy, la mascotte Buddly" role="img">
      <defs>
        <linearGradient id="petg" gradientUnits="userSpaceOnUse" x1="60" y1="60" x2="420" y2="400">
          <stop offset="0" stopColor="#a26ef0" />
          <stop offset="1" stopColor="#7c45d8" />
        </linearGradient>
      </defs>
      <g fill="#f7806a">
        <rect x="88" y="40" width="22" height="70" rx="11" transform="rotate(-38 99 75)" />
        <rect x="150" y="10" width="22" height="70" rx="11" transform="rotate(-8 161 45)" />
        <rect x="40" y="110" width="22" height="64" rx="11" transform="rotate(-75 51 142)" />
      </g>
      <g fill="url(#petg)">
        <circle cx="160" cy="250" r="110" />
        <circle cx="270" cy="185" r="125" />
        <circle cx="360" cy="270" r="90" />
        <rect x="50" y="260" width="400" height="140" />
      </g>
      <circle cx="205" cy="245" r="58" fill="#fdf8ff" />
      <circle cx="320" cy="205" r="55" fill="#fdf8ff" />
      <ellipse cx="222" cy="234" rx="34" ry="38" fill="#2d1748" />
      <ellipse cx="334" cy="193" rx="33" ry="37" fill="#2d1748" />
      <circle cx="210" cy="220" r="10" fill="#fff" />
      <circle cx="322" cy="180" r="10" fill="#fff" />
      <path d="M268 300c22-26 58-34 82-30 8 28-2 62-30 76-26 12-58-6-60-30-1-6 2-11 8-16z" fill="#2d1748" />
      <path d="M282 334c8-18 34-24 52-14-4 16-16 26-30 28-10 1-18-4-22-14z" fill="#ff8a80" />
    </svg>
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

      <div className="relative mx-auto grid max-w-6xl gap-6 px-4 pb-10 pt-8 sm:px-6 lg:min-h-[600px] lg:pb-20 lg:grid-cols-[1.15fr_1fr] lg:pt-14">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-lilac px-4 py-2 text-sm font-semibold text-violet">
            <svg viewBox="0 0 24 24" className="size-4 text-[#f2a541]" fill="currentColor" aria-hidden>
              <path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7z" />
            </svg>
            Fini les « on fait quoi ce soir ? »
          </p>
          <h1 className="mt-6 font-display text-[3.4rem] font-bold leading-[0.98] tracking-tight text-ink sm:text-7xl lg:text-[5.4rem]">
            Sortez plus,
            <span className="relative mt-2 inline-block">
              <span className="absolute -inset-x-4 inset-y-2 -z-0 rounded-full bg-lilac" />
              <span className="relative text-plum">ensemble.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Des dizaines de messages, personne qui tranche, et la soirée tombe à l&apos;eau. Avec Buddly,
            chacun swipe des restos et activités autour de vous : quand tout le groupe dit oui, c&apos;est
            un match.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
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
          <div className="mt-8 flex items-center gap-3">
            <Laurel />
            <p className="text-center text-sm leading-tight text-muted">
              <b className="text-ink">Gratuit</b> jusqu&apos;à 4 amis
              <br />
              sans carte bancaire
            </p>
            <Laurel flip />
          </div>
        </div>

        <div className="relative h-[300px] sm:h-[380px] lg:h-auto">
          <Tile d={I.fork} className="left-[8%] top-0 size-20 -rotate-6 sm:size-24 lg:left-[6%] lg:top-6 lg:size-28" />
          <Tile d={I.pin} className="right-[30%] top-[-10px] size-16 rotate-6 sm:size-20 lg:right-[34%] lg:top-0" color="text-coral" />
          <Tile d={I.users} className="right-[2%] top-16 hidden size-20 rotate-12 sm:grid lg:right-[-2%] lg:top-28 lg:size-24" />
          <Tile d={I.check} className="right-[4%] top-56 hidden size-16 -rotate-6 lg:right-[0%] lg:top-[300px] lg:grid lg:size-20" color="text-[#3fb950]" />
          <Pet className="absolute bottom-[-60px] right-[-20px] w-[300px] sm:w-[380px] lg:bottom-[-130px] lg:right-[-60px] lg:w-[520px]" />
        </div>
      </div>

      {/* vagues */}
      <div className="relative z-10 -mt-6 lg:-mt-16">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block h-[70px] w-full sm:h-[110px] lg:h-[150px]" aria-hidden>
          <path d="M0 60C240 0 520 0 780 40S1220 50 1440 0V120H0z" fill="#f5eefd" />
          <path d="M0 88C280 38 560 46 840 76S1260 52 1440 14V120H0z" fill="#efe5fd" />
        </svg>
        <div className="bg-[#efe5fd]">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 pt-2 sm:grid-cols-3 sm:px-6">
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
