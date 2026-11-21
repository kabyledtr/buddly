"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader, BudgetPicker, Chip, Field, Spinner, inputCls, memberKey } from "../../AppShell";
import "./celebrate.css";
import { CATEGORY_LABEL, type Budget, type Category, type Place } from "@/lib/types";

type Ranked = { place: Place; likes: number; nopes: number; likedBy: string[]; unanimous: boolean };
type State = {
  group: { id: string; name: string; when: string; area: string; premium: boolean; isCreator: boolean; totalPlaces: number; slot?: { date?: string } };
  deck: Place[];
  members: { id: string; name: string; done: number }[];
  me: string | null;
  myVotes: Record<string, 0 | 1>;
  ranking: Ranked[];
  rankedCount: number;
  unanimousCount: number;
  maxMembers: number;
  lockedPlaces: number;
  priceCents: number;
};

const BG: Record<Category, string> = {
  resto: "from-coral to-[#f9a58f]",
  bar: "from-plum to-violet",
  cafe: "from-[#f2a541] to-coral",
  activite: "from-violet to-[#b48cf0]",
};

const euros = (c: number) => (c / 100).toFixed(2).replace(".", ",") + " €";
const km = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);
const mapUrl = (p: Place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.address ?? `${p.lat},${p.lon}`}`)}`;

export default function GroupApp({ id }: { id: string }) {
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState("");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [tab, setTab] = useState<"swipe" | "results">("swipe");
  const [toast, setToast] = useState("");
  const [localVotes, setLocalVotes] = useState<Record<string, 0 | 1>>({});

  useEffect(() => {
    try {
      setMemberId(localStorage.getItem(memberKey(id)));
    } catch {}
    const q = new URLSearchParams(location.search);
    if (q.get("paiement") === "ok") {
      setToast("Pass Sortie activé ! Tout est débloqué pour le groupe.");
      setTab("results");
    } else if (q.get("paiement") === "annule") setToast("Paiement annulé.");
    else if (q.get("paiement") === "erreur") setToast("Le paiement n'a pas pu être vérifié.");
    if (q.get("paiement")) history.replaceState(null, "", `/g/${id}`);
  }, [id]);

  const refresh = useCallback(async () => {
    const r = await fetch(`/api/groups/${id}?m=${memberId ?? ""}`, { cache: "no-store" });
    const j = await r.json();
    if (!r.ok) return setError(j.error ?? "Erreur");
    setState(j);
  }, [id, memberId]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  if (error)
    return (
      <Screen>
        <div className="mt-16 text-center">
          <Image src="/pet.png" alt="" width={96} height={96} className="mx-auto size-24 rounded-3xl" />
          <h1 className="mt-6 font-display text-3xl font-bold text-plum">{error}</h1>
          <p className="mt-2 text-muted">Le lien a peut-être expiré.</p>
          <Link href="/app" className="mt-6 inline-block rounded-full bg-coral px-6 py-3 font-semibold text-paper">
            Créer une sortie
          </Link>
        </div>
      </Screen>
    );

  if (!state)
    return (
      <Screen>
        <div className="mt-24 flex justify-center text-violet">
          <Spinner className="size-8" />
        </div>
      </Screen>
    );

  if (!state.me)
    return (
      <Screen>
        <Join state={state} onJoined={(m) => setMemberId(m)} />
      </Screen>
    );

  const votes = { ...state.myVotes, ...localVotes };
  const remaining = state.deck.filter((p) => votes[p.id] === undefined);

  async function vote(p: Place, like: boolean) {
    setLocalVotes((v) => ({ ...v, [p.id]: like ? 1 : 0 }));
    await fetch(`/api/groups/${id}/vote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberId: state!.me, placeId: p.id, like }),
    });
    if (remaining.length === 1) refresh();
  }

  return (
    <Screen right={<Invite id={id} name={state.group.name} />}>
      <div className="px-1">
        <h1 className="font-display text-2xl font-bold leading-tight text-plum">{state.group.name}</h1>
        <p className="text-sm text-muted">
          {[state.group.when, state.group.area].filter(Boolean).join(" · ")}
          {state.group.premium && <span className="ml-2 rounded-full bg-coral px-2 py-0.5 text-xs font-bold text-paper">Pass Sortie</span>}
        </p>
      </div>

      <Members state={state} />

      <div className="mt-5 grid grid-cols-2 rounded-full bg-lilac p-1 text-sm font-semibold">
        {(["swipe", "results"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full py-2.5 transition ${tab === t ? "bg-paper text-plum shadow-sm" : "text-muted"}`}
          >
            {t === "swipe" ? `Swiper (${remaining.length})` : `Résultats${state.rankedCount ? ` (${state.rankedCount})` : ""}`}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "swipe" ? (
          <Deck remaining={remaining} total={state.deck.length} date={state.group.slot?.date} onVote={vote} onDone={() => setTab("results")} />
        ) : (
          <Results id={id} state={state} />
        )}
      </div>

      {toast && (
        <div className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-2xl bg-ink px-5 py-4 text-center text-sm font-medium text-paper shadow-xl">
          {toast}
        </div>
      )}
    </Screen>
  );
}

function Screen({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-gradient-to-b from-[#fdf7fb] to-[#f3eafd]">
      <AppHeader right={right} />
      <main className="mx-auto max-w-xl px-4 pb-16">{children}</main>
    </div>
  );
}

/* ---------- inviter ---------- */

function Invite({ id, name }: { id: string; name: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = `${location.origin}/g/${id}`;
    const text = `On choisit où sortir sur Buddly : « ${name} ». Swipe les adresses ici :`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Buddly", text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }
  return (
    <button onClick={share} className="rounded-full bg-plum px-4 py-2 text-sm font-semibold text-paper hover:bg-ink">
      {copied ? "Lien copié !" : "Inviter des amis"}
    </button>
  );
}

function Members({ state }: { state: State }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {state.members.map((m) => {
        const done = m.done >= state.deck.length;
        return (
          <span
            key={m.id}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              m.id === state.me ? "bg-plum text-paper" : "bg-paper text-ink"
            }`}
          >
            {m.name}
            <span className={m.id === state.me ? "text-lilac" : "text-muted"}>{done ? "✓" : `${m.done}/${state.deck.length}`}</span>
          </span>
        );
      })}
      <span className="text-xs text-muted">
        {state.members.length}/{state.maxMembers} amis
      </span>
    </div>
  );
}

/* ---------- rejoindre ---------- */

function Join({ state, onJoined }: { state: State; onJoined: (m: string) => void }) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState<Budget>(2);
  const [likes, setLikes] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const full = state.members.length >= state.maxMembers;

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const r = await fetch(`/api/groups/${state.group.id}/join`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, budget, likes }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) return setError(j.error ?? "Erreur");
    try {
      localStorage.setItem(memberKey(state.group.id), j.memberId);
    } catch {}
    onJoined(j.memberId);
  }

  const names = state.members.map((m) => m.name);
  return (
    <div className="mt-4">
      <div className="rounded-3xl bg-plum p-6 text-paper">
        <p className="text-sm text-lilac">
          {names.length > 1 ? `${names.slice(0, -1).join(", ")} et ${names.at(-1)}` : names[0]} t&apos;invite{names.length > 1 ? "nt" : ""} à
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight">{state.group.name}</h1>
        <p className="mt-1 text-lilac">{[state.group.when, state.group.area].filter(Boolean).join(" · ")}</p>
        <p className="mt-4 text-sm">
          Swipe {state.deck.length} adresses autour du point de rendez-vous. Quand tout le monde dit oui, c&apos;est un match.
        </p>
      </div>

      {full ? (
        <p className="mt-6 rounded-2xl bg-peach px-4 py-3 text-sm font-medium text-[#a2402f]">
          Le groupe est complet ({state.maxMembers} amis max en gratuit). Demande à l&apos;organisateur de débloquer le Pass Sortie.
        </p>
      ) : (
        <form onSubmit={join} className="mt-6 space-y-6">
          <Field label="Ton prénom">
            <input required maxLength={24} value={name} onChange={(e) => setName(e.target.value)} placeholder="Yanis" className={inputCls} />
          </Field>
          <Field label="Tes envies">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                <Chip key={c} active={likes.includes(c)} onClick={() => setLikes((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))}>
                  {CATEGORY_LABEL[c]}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Ton budget">
            <BudgetPicker value={budget} onChange={setBudget} />
          </Field>
          {error && <p className="rounded-2xl bg-peach px-4 py-3 text-sm font-medium text-[#a2402f]">{error}</p>}
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-coral py-4 font-semibold text-paper shadow-[0_8px_0_-2px_#d9604b] disabled:opacity-60"
          >
            {loading ? <Spinner /> : "Rejoindre et swiper"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ---------- swipe ---------- */

function Deck({
  remaining,
  total,
  date,
  onVote,
  onDone,
}: {
  remaining: Place[];
  total: number;
  date?: string;
  onVote: (p: Place, like: boolean) => void;
  onDone: () => void;
}) {
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const place = remaining[0];

  if (!place) return <Celebrate onDone={onDone} />;

  const decide = (like: boolean) => {
    setDx(0);
    onVote(place, like);
  };
  const up = () => {
    if (start.current === null) return;
    start.current = null;
    if (dx > 90) decide(true);
    else if (dx < -90) decide(false);
    else setDx(0);
  };

  return (
    <div>
      <p className="mb-3 text-center text-sm font-medium text-muted">
        {total - remaining.length + 1} / {total}
      </p>
      <div className="relative mx-auto h-[540px] max-w-sm select-none">
        {remaining[1] && <Card place={remaining[1]} className="scale-95 opacity-60" />}
        <Card
          key={place.id}
          place={place}
          date={date}
          active
          className="cursor-grab touch-none active:cursor-grabbing"
          style={{
            transform: `translateX(${dx}px) rotate(${dx / 18}deg)`,
            transition: start.current === null ? "transform .25s ease" : "none",
          }}
          badge={dx > 40 ? "like" : dx < -40 ? "nope" : null}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("a,button,[data-noswipe]")) return;
            start.current = e.clientX;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => start.current !== null && setDx(e.clientX - start.current)}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </div>
      <div className="mt-5 flex justify-center gap-6">
        <button
          aria-label="Bof"
          onClick={() => decide(false)}
          className="grid size-16 place-items-center rounded-full border-2 border-ink/10 bg-paper text-2xl text-muted shadow-sm transition hover:scale-105"
        >
          ✕
        </button>
        <button
          aria-label="J'aime"
          onClick={() => decide(true)}
          className="grid size-16 place-items-center rounded-full bg-coral text-2xl text-paper shadow-[0_6px_0_-1px_#d9604b] transition hover:scale-105"
        >
          ♥
        </button>
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        {place.photos ? "Photos, notes et avis : Google" : "Données des lieux © contributeurs OpenStreetMap"}
      </p>
    </div>
  );
}

const photoSrc = (n: string, w = 1600) => `/api/photo?n=${encodeURIComponent(n)}&w=${w}`;

function Stars({ value, count, light = true }: { value: number; count?: number; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-block text-[15px] leading-none tracking-[1px]" aria-label={`${value} sur 5`}>
        <span className={light ? "text-paper/35" : "text-ink/15"}>★★★★★</span>
        <span className="absolute inset-0 overflow-hidden text-[#ffc93f]" style={{ width: `${(value / 5) * 100}%` }}>
          ★★★★★
        </span>
      </span>
      <b className="text-sm">{value.toFixed(1).replace(".", ",")}</b>
      {count != null && <span className="text-xs opacity-80">({count.toLocaleString("fr-FR")} avis)</span>}
    </span>
  );
}

const BUDGET_TXT = ["", "Petit budget", "Raisonnable", "On se fait plaisir"];

function Card({
  place,
  className = "",
  badge,
  active = false,
  date,
  ...rest
}: { place: Place; className?: string; badge?: "like" | "nope" | null; active?: boolean; date?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const photos = place.photos ?? [];
  const [i, setI] = useState(0);
  const [films, setFilms] = useState<{ films: { title: string; times: string[] }[]; answer?: string; unavailable?: boolean } | null>(null);
  const [showFilms, setShowFilms] = useState(false);
  const [loadingFilms, setLoadingFilms] = useState(false);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  // précharge la photo suivante
  const next = photos[i + 1];
  useEffect(() => {
    if (!active || !next) return;
    const img = new window.Image();
    img.src = photoSrc(next);
  }, [active, next]);

  async function openFilms() {
    setShowFilms(true);
    if (films) return;
    setLoadingFilms(true);
    try {
      const r = await fetch(
        `/api/cinema?name=${encodeURIComponent(place.name)}&address=${encodeURIComponent(place.address ?? "")}${date ? `&date=${date}` : ""}`,
      );
      setFilms(await r.json());
    } catch {
      setFilms({ films: [] });
    }
    setLoadingFilms(false);
  }

  return (
    <div
      {...rest}
      className={`absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br ${BG[place.category]} text-paper shadow-[0_24px_50px_-20px_rgba(67,32,122,0.5)] ${className}`}
    >
      {/* photos */}
      {photos.length > 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={photos[i]}
          src={photoSrc(photos[i])}
          alt={`${place.name}, photo ${i + 1}`}
          draggable={false}
          className="pointer-events-none absolute inset-0 size-full object-cover"
          loading={active ? "eager" : "lazy"}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

      {/* indicateurs + flèches */}
      {photos.length > 1 && (
        <>
          <div className="absolute inset-x-4 top-3 z-10 flex gap-1">
            {photos.map((_, k) => (
              <span key={k} className={`h-1 flex-1 rounded-full ${k === i ? "bg-paper" : "bg-paper/40"}`} />
            ))}
          </div>
          {active && (
            <>
              <button
                type="button"
                aria-label="Photo précédente"
                onPointerDown={stop}
                onClick={() => setI((i - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-[38%] z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/85 text-xl font-bold text-plum shadow-md backdrop-blur transition hover:scale-105"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Photo suivante"
                onPointerDown={stop}
                onClick={() => setI((i + 1) % photos.length)}
                className="absolute right-3 top-[38%] z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/85 text-xl font-bold text-plum shadow-md backdrop-blur transition hover:scale-105"
              >
                ›
              </button>
            </>
          )}
        </>
      )}

      {badge && (
        <span
          className={`absolute top-10 z-20 rounded-xl border-[3px] px-3 py-1 font-display text-2xl font-bold ${
            badge === "like" ? "left-6 -rotate-12 border-[#7dffa8] text-[#7dffa8]" : "right-6 rotate-12 border-coral text-coral"
          }`}
        >
          {badge === "like" ? "OUI" : "BOF"}
        </span>
      )}

      <div className="absolute left-4 right-4 top-7 z-10 flex flex-wrap justify-end gap-2">
        {place.openLabel && (
          <span className="mr-auto rounded-full bg-[#1f9d55]/90 px-3 py-1 text-xs font-semibold">{place.openLabel}</span>
        )}
        {place.special && <span className="rounded-full bg-coral px-3 py-1 text-xs font-bold">Original</span>}
        <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold backdrop-blur">{km(place.distance)}</span>
      </div>

      {/* infos */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-paper/85">{place.kind}</p>
        <h3 className="mt-1 font-display text-[2rem] font-bold leading-[1.05]">{place.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {place.rating != null && <Stars value={place.rating} count={place.ratingCount} />}
          <span className="text-sm font-semibold">
            {place.priceRange ?? BUDGET_TXT[place.price]}
          </span>
        </div>
        {place.review && (
          <p className="mt-2 line-clamp-2 text-[13px] italic leading-snug text-paper/90">
            « {place.review.text} » <span className="not-italic text-paper/70">— {place.review.author}</span>
          </p>
        )}
        {place.address && <p className="mt-1.5 truncate text-xs text-paper/75">{place.address}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {place.cinema && active && (
            <button
              type="button"
              onPointerDown={stop}
              onClick={openFilms}
              className="rounded-full bg-paper px-3 py-1.5 text-xs font-bold text-plum"
            >
              Films à l&apos;affiche
            </button>
          )}
          <a
            href={place.mapsUri ?? mapUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-paper/20 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-paper/30"
          >
            Voir sur la carte ↗
          </a>
        </div>
      </div>

      {/* films du cinéma */}
      {showFilms && (
        <div data-noswipe onPointerDown={stop} className="absolute inset-0 z-30 flex flex-col bg-ink/95 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl font-bold">À l&apos;affiche{date ? ` le ${new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : ""}</p>
            <button type="button" onClick={() => setShowFilms(false)} className="grid size-9 place-items-center rounded-full bg-paper/15 text-lg" aria-label="Fermer">
              ✕
            </button>
          </div>
          <p className="text-sm text-paper/70">{place.name}</p>
          <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
            {loadingFilms ? (
              <p className="flex items-center gap-2 text-sm text-paper/80">
                <Spinner className="size-4" /> Buddy cherche les séances…
              </p>
            ) : films?.films.length ? (
              films.films.map((f) => (
                <div key={f.title} className="rounded-2xl bg-paper/10 p-3">
                  <p className="font-semibold">{f.title}</p>
                  {f.times.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {f.times.map((t) => (
                        <span key={t} className="rounded-full bg-coral px-2 py-0.5 text-xs font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-paper/80">
                {films?.answer ?? (films?.unavailable ? "La recherche de séances n'est pas encore activée." : "Pas de programme trouvé pour cette date.")}
              </p>
            )}
          </div>
          <a
            href={place.website ?? place.mapsUri ?? mapUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 rounded-full bg-paper py-2.5 text-center text-sm font-bold text-plum"
          >
            Programme complet ↗
          </a>
        </div>
      )}
    </div>
  );
}

/* ---------- fin du deck ---------- */

function Celebrate({ onDone }: { onDone: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
    };
    resize();
    const colors = ["#f7806a", "#8b55e3", "#ffc93f", "#c9b3ff", "#43207a", "#7dffa8"];
    type P = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
    let parts: P[] = [];
    const burst = () => {
      const x = (0.15 + Math.random() * 0.7) * c.width;
      const y = (0.12 + Math.random() * 0.35) * c.height;
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let k = 0; k < 46; k++) {
        const a = (Math.PI * 2 * k) / 46 + Math.random() * 0.2;
        const s = (2.2 + Math.random() * 3.2) * dpr;
        parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color: Math.random() < 0.25 ? "#fff" : color, size: (2 + Math.random() * 2.5) * dpr });
      }
    };
    const timers = [0, 350, 800, 1250, 1700, 2300, 2900].map((t) => setTimeout(burst, t));
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      parts = parts.filter((p) => p.life > 0);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06 * dpr;
        p.vx *= 0.985;
        p.life -= 0.012;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    const stop = setTimeout(() => cancelAnimationFrame(raf), 5200);
    addEventListener("resize", resize);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(stop);
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-paper px-6 pb-8 pt-6 text-center">
      <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-40 size-full" aria-hidden />
      <div className="relative mx-auto h-56 w-60">
        <Image src="/pet-cool.png" alt="Buddy avec ses lunettes de soleil" width={900} height={816} priority className="buddy-bob relative z-10 mx-auto h-48 w-auto select-none" draggable={false} />
        <span className="buddy-shadow absolute bottom-5 left-1/2 h-4 w-36 rounded-[50%] bg-plum/25 blur-[3px]" />
      </div>
      <h2 className="font-display text-3xl font-bold text-plum">Tu as tout swipé !</h2>
      <p className="mt-1 text-muted">Buddy fait les comptes : regarde ce qui plaît au groupe.</p>
      <button onClick={onDone} className="mt-5 rounded-full bg-coral px-7 py-3.5 font-semibold text-paper shadow-[0_6px_0_-1px_#d9604b]">
        Voir les résultats
      </button>
    </div>
  );
}

/* ---------- résultats + paywall ---------- */

function Results({ id, state }: { id: string; state: State }) {
  const [ai, setAi] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const top = state.ranking[0];
  const sig = top ? `${top.place.id}:${top.likes}:${top.nopes}:${state.members.length}` : "";

  useEffect(() => {
    if (!sig) return;
    let alive = true;
    setAiLoading(true);
    fetch(`/api/groups/${id}/ai`, { method: "POST" })
      .then((r) => r.json())
      .then((j) => alive && setAi(j.text))
      .finally(() => alive && setAiLoading(false));
    return () => {
      alive = false;
    };
  }, [id, sig]);

  async function pay() {
    setPaying(true);
    setPayError("");
    const r = await fetch(`/api/groups/${id}/checkout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberId: state.me }),
    });
    const j = await r.json();
    if (r.ok && j.url) return (location.href = j.url);
    setPaying(false);
    setPayError(j.error ?? "Erreur de paiement");
  }

  const waiting = state.members.filter((m) => m.done < state.deck.length).map((m) => m.name);

  if (!top)
    return (
      <div className="rounded-3xl bg-paper p-8 text-center">
        <p className="font-display text-2xl font-bold text-plum">Pas encore de résultat</p>
        <p className="mt-2 text-muted">Swipe quelques lieux et invite tes amis : le classement apparaît dès les premiers « oui ».</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {waiting.length > 0 && (
        <p className="rounded-2xl bg-paper px-4 py-3 text-sm text-muted">
          En attente de <b className="text-ink">{waiting.join(", ")}</b>. Le classement se met à jour en direct.
        </p>
      )}

      {/* meilleur lieu */}
      <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${BG[top.place.category]} p-6 text-paper`}>
        {top.place.photos?.[0] && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoSrc(top.place.photos[0], 1200)} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
          </>
        )}
        <div className="relative">
        <p className="text-sm font-bold uppercase tracking-wide">
          {top.unanimous ? "C'est un match !" : "Meilleur compromis"}
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold leading-tight">{top.place.name}</h2>
        <p className="mt-1 text-sm opacity-90">
          {top.place.kind} · {top.place.priceRange ?? BUDGET_TXT[top.place.price]} · {km(top.place.distance)}
          {top.place.address ? ` · ${top.place.address}` : ""}
        </p>
        <p className="mt-3 text-sm font-semibold">
          {top.likes}/{state.members.length} oui : {top.likedBy.join(", ")}
        </p>
        {top.place.rating != null && (
          <div className="mt-2">
            <Stars value={top.place.rating} count={top.place.ratingCount} />
          </div>
        )}
        <a href={top.place.mapsUri ?? mapUrl(top.place)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-paper px-4 py-2 text-sm font-semibold text-plum">
          Y aller ↗
        </a>
        </div>
      </div>

      {/* IA */}
      <div className="flex gap-3 rounded-3xl bg-paper p-5">
        <Image src="/pet.png" alt="" width={48} height={48} className="size-12 shrink-0 rounded-2xl" />
        <div>
          <p className="font-display text-lg font-semibold text-plum">Le mot de Buddy</p>
          <p className="mt-1 text-[15px] text-ink/90">{aiLoading && !ai ? "Buddy réfléchit…" : ai}</p>
        </div>
      </div>

      {/* classement complet ou paywall */}
      {state.group.premium ? (
        <div className="rounded-3xl bg-paper p-5">
          <p className="font-display text-xl font-semibold text-plum">Classement complet</p>
          <ol className="mt-3 divide-y divide-plum/10">
            {state.ranking.map((r, i) => (
              <li key={r.place.id} className="flex items-center gap-3 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-lilac font-display font-bold text-plum">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <a href={mapUrl(r.place)} target="_blank" rel="noopener noreferrer" className="block truncate font-semibold hover:text-violet">
                    {r.place.name}
                  </a>
                  <p className="truncate text-xs text-muted">
                    {r.place.kind} · {km(r.place.distance)} · {r.likedBy.join(", ")}
                  </p>
                </div>
                <span className="text-sm font-bold text-coral">
                  {r.likes}/{state.members.length}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-paper p-5">
          <div aria-hidden className="pointer-events-none space-y-3 blur-[5px]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="size-8 rounded-xl bg-lilac" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded bg-ink/15" />
                  <div className="h-2.5 w-1/3 rounded bg-ink/10" />
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-[-5.5rem] rounded-3xl bg-plum p-6 text-paper shadow-xl">
            <p className="text-sm font-bold uppercase tracking-wide text-coral">Pass Sortie</p>
            <h3 className="mt-1 font-display text-2xl font-bold leading-tight">Débloque tout le groupe pour {euros(state.priceCents)}</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-lilac">
              <li>✓ Le classement complet{state.rankedCount > 1 ? ` (${state.rankedCount - 1} autres lieux aimés)` : ""}</li>
              {state.lockedPlaces > 0 && <li>✓ {state.lockedPlaces} adresses de plus à swiper</li>}
              <li>✓ Jusqu&apos;à 15 amis dans le groupe</li>
            </ul>
            <button
              onClick={pay}
              disabled={paying}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3.5 font-semibold text-paper disabled:opacity-60"
            >
              {paying ? <Spinner /> : `Débloquer pour ${euros(state.priceCents)}`}
            </button>
            {payError && <p className="mt-3 text-center text-sm text-peach">{payError}</p>}
            <p className="mt-3 text-center text-xs text-lilac/80">
              Paiement unique et sécurisé par Stripe. Valable pour tout le groupe.{" "}
              <Link href="/cgv" className="underline">CGV</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
