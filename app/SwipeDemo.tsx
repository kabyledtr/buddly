"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Spot = {
  name: string;
  kind: string;
  area: string;
  price: string;
  distance: string;
  tags: string[];
  likes: number; // amis du groupe qui ont déjà liké
  bg: string;
};

const GROUP = ["Inès", "Yanis", "Léa", "Toi"];

const SPOTS: Spot[] = [
  { name: "Chez Nonna", kind: "Pizzeria", area: "Oberkampf", price: "€€", distance: "650 m", tags: ["Terrasse", "Végé ok"], likes: 2, bg: "from-coral to-[#f9a58f]" },
  { name: "Le Bowling Bleu", kind: "Bowling & bar", area: "Bastille", price: "€€", distance: "1,2 km", tags: ["Groupe", "Jusqu'à 2h"], likes: 1, bg: "from-violet to-[#b48cf0]" },
  { name: "Saïgon Street", kind: "Street food viet", area: "Belleville", price: "€", distance: "900 m", tags: ["Pas cher", "Rapide"], likes: 3, bg: "from-plum to-violet" },
  { name: "Escape Room 404", kind: "Escape game", area: "République", price: "€€€", distance: "1,5 km", tags: ["4-6 pers.", "Réservation"], likes: 0, bg: "from-[#f2a541] to-coral" },
];

export default function SwipeDemo() {
  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0);
  const [match, setMatch] = useState<Spot | null>(null);
  const start = useRef<number | null>(null);

  const done = index >= SPOTS.length;
  const spot = SPOTS[index];

  function decide(like: boolean) {
    if (done) return;
    if (like && spot.likes === GROUP.length - 1) setMatch(spot);
    setDx(0);
    setIndex((i) => i + 1);
  }

  function onUp() {
    if (start.current === null) return;
    start.current = null;
    if (dx > 90) decide(true);
    else if (dx < -90) decide(false);
    else setDx(0);
  }

  return (
    <div className="relative mx-auto w-full max-w-[320px] select-none rounded-[2.5rem] border-[10px] border-ink bg-paper p-4 shadow-[0_30px_60px_-20px_rgba(67,32,122,0.45)]">
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted">
        <span>Vendredi soir · 4 amis</span>
        <span className="flex -space-x-2">
          {GROUP.map((n, i) => (
            <span
              key={n}
              title={n}
              className={`grid size-6 place-items-center rounded-full border-2 border-paper text-[10px] font-bold text-paper ${["bg-coral", "bg-violet", "bg-plum", "bg-ink"][i]}`}
            >
              {n[0]}
            </span>
          ))}
        </span>
      </div>

      <div className="relative h-[360px]">
        {done ? (
          <div className="grid h-full place-items-center rounded-3xl bg-lilac p-6 text-center">
            <div>
              <p className="font-display text-xl font-semibold text-plum">Tout le monde a voté</p>
              <p className="mt-2 text-sm text-muted">Buddly a trouvé votre sortie.</p>
              <button
                onClick={() => { setIndex(0); setMatch(null); }}
                className="mt-4 rounded-full bg-plum px-4 py-2 text-sm font-semibold text-paper"
              >
                Recommencer
              </button>
            </div>
          </div>
        ) : (
          <>
            {SPOTS[index + 1] && (
              <Card spot={SPOTS[index + 1]} className="scale-95 opacity-70" />
            )}
            <Card
              spot={spot}
              className="cursor-grab touch-none active:cursor-grabbing"
              style={{
                transform: `translateX(${dx}px) rotate(${dx / 18}deg)`,
                transition: start.current === null ? "transform .25s ease" : "none",
              }}
              onPointerDown={(e) => {
                start.current = e.clientX;
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => start.current !== null && setDx(e.clientX - start.current)}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              badge={dx > 40 ? "like" : dx < -40 ? "nope" : null}
            />
          </>
        )}

        {match && (
          <div className="absolute inset-0 z-20 grid place-items-center rounded-3xl bg-plum/95 p-6 text-center text-paper">
            <div>
              <Image src="/pet.png" alt="" width={80} height={80} className="mx-auto size-20 rounded-2xl" />
              <p className="mt-4 font-display text-2xl font-bold">C&apos;est un match !</p>
              <p className="mt-1 text-sm text-lilac">
                Les 4 veulent aller chez <b>{match.name}</b>.
              </p>
              <button
                onClick={() => setMatch(null)}
                className="mt-5 rounded-full bg-coral px-5 py-2 text-sm font-semibold text-paper"
              >
                Réserver pour 4
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-6">
        <button
          aria-label="Passer"
          onClick={() => decide(false)}
          disabled={done}
          className="grid size-14 place-items-center rounded-full border-2 border-ink/10 bg-paper text-2xl text-muted transition hover:scale-105 disabled:opacity-40"
        >
          ✕
        </button>
        <button
          aria-label="J'aime"
          onClick={() => decide(true)}
          disabled={done}
          className="grid size-14 place-items-center rounded-full bg-coral text-2xl text-paper transition hover:scale-105 disabled:opacity-40"
        >
          ♥
        </button>
      </div>
    </div>
  );
}

function Card({
  spot,
  className = "",
  badge,
  ...rest
}: { spot: Spot; className?: string; badge?: "like" | "nope" | null } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`absolute inset-0 flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br ${spot.bg} p-5 text-paper ${className}`}
    >
      {badge && (
        <span
          className={`absolute top-5 rounded-lg border-2 px-2 py-0.5 font-display text-lg font-bold ${
            badge === "like" ? "left-5 -rotate-12 border-paper" : "right-5 rotate-12 border-ink text-ink"
          }`}
        >
          {badge === "like" ? "OUI" : "BOF"}
        </span>
      )}
      <span className="self-end rounded-full bg-paper/25 px-3 py-1 text-xs font-semibold backdrop-blur">
        {spot.distance}
      </span>
      <div className="mt-auto">
        <p className="text-sm font-medium opacity-90">
          {spot.kind} · {spot.area} · {spot.price}
        </p>
        <h3 className="font-display text-3xl font-bold leading-tight">{spot.name}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {spot.tags.map((t) => (
            <span key={t} className="rounded-full bg-paper/20 px-2.5 py-1 text-xs font-medium">
              {t}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs font-medium opacity-90">
          {spot.likes === 0 ? "Sois le premier à voter" : `${spot.likes}/3 de tes amis ont dit oui`}
        </p>
      </div>
    </div>
  );
}
