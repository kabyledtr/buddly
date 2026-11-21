"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader, Chip, Field, Spinner, inputCls, memberKey } from "../../AppShell";
import { CATEGORY_LABEL, type Budget, type Category, type Place } from "@/lib/types";

type Ranked = { place: Place; likes: number; nopes: number; likedBy: string[]; unanimous: boolean };
type State = {
  group: { id: string; name: string; when: string; area: string; premium: boolean; isCreator: boolean; totalPlaces: number };
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
    if (remaining.length === 1) {
      setTab("results");
      refresh();
    }
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
          <Deck remaining={remaining} total={state.deck.length} onVote={vote} onDone={() => setTab("results")} />
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
            <div className="flex gap-2">
              {([1, 2, 3] as Budget[]).map((b) => (
                <Chip key={b} active={budget === b} onClick={() => setBudget(b)}>
                  {"€".repeat(b)}
                </Chip>
              ))}
            </div>
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
  onVote,
  onDone,
}: {
  remaining: Place[];
  total: number;
  onVote: (p: Place, like: boolean) => void;
  onDone: () => void;
}) {
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const place = remaining[0];

  if (!place)
    return (
      <div className="rounded-3xl bg-paper p-8 text-center">
        <Image src="/pet.png" alt="" width={80} height={80} className="mx-auto size-20 rounded-2xl" />
        <h2 className="mt-4 font-display text-2xl font-bold text-plum">Tu as tout swipé !</h2>
        <p className="mt-1 text-muted">Regarde ce qui plaît au groupe.</p>
        <button onClick={onDone} className="mt-5 rounded-full bg-coral px-6 py-3 font-semibold text-paper">
          Voir les résultats
        </button>
      </div>
    );

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
      <div className="relative mx-auto h-[420px] max-w-sm select-none">
        {remaining[1] && <Card place={remaining[1]} className="scale-95 opacity-60" />}
        <Card
          key={place.id}
          place={place}
          className="cursor-grab touch-none active:cursor-grabbing"
          style={{
            transform: `translateX(${dx}px) rotate(${dx / 18}deg)`,
            transition: start.current === null ? "transform .25s ease" : "none",
          }}
          badge={dx > 40 ? "like" : dx < -40 ? "nope" : null}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("a")) return;
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
      <p className="mt-6 text-center text-xs text-muted">Données des lieux © contributeurs OpenStreetMap</p>
    </div>
  );
}

function Card({
  place,
  className = "",
  badge,
  ...rest
}: { place: Place; className?: string; badge?: "like" | "nope" | null } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br ${BG[place.category]} p-6 text-paper shadow-[0_24px_50px_-20px_rgba(67,32,122,0.5)] ${className}`}
    >
      {badge && (
        <span
          className={`absolute top-6 rounded-xl border-[3px] px-3 py-1 font-display text-2xl font-bold ${
            badge === "like" ? "left-6 -rotate-12 border-paper" : "right-6 rotate-12 border-ink text-ink"
          }`}
        >
          {badge === "like" ? "OUI" : "BOF"}
        </span>
      )}
      <div className="flex justify-end gap-2">
        <span className="rounded-full bg-paper/25 px-3 py-1 text-xs font-semibold">{"€".repeat(place.price)}</span>
        <span className="rounded-full bg-paper/25 px-3 py-1 text-xs font-semibold">{km(place.distance)}</span>
      </div>
      <div className="mt-auto">
        <p className="text-sm font-semibold uppercase tracking-wide opacity-90">{place.kind}</p>
        <h3 className="mt-1 font-display text-4xl font-bold leading-[1.05]">{place.name}</h3>
        {place.address && <p className="mt-2 text-sm opacity-90">{place.address}</p>}
        <a
          href={mapUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-paper/20 px-3 py-1.5 text-xs font-semibold hover:bg-paper/30"
        >
          Voir sur la carte ↗
        </a>
      </div>
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
      <div className={`overflow-hidden rounded-[2rem] bg-gradient-to-br ${BG[top.place.category]} p-6 text-paper`}>
        <p className="text-sm font-bold uppercase tracking-wide">
          {top.unanimous ? "C'est un match !" : "Meilleur compromis"}
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold leading-tight">{top.place.name}</h2>
        <p className="mt-1 text-sm opacity-90">
          {top.place.kind} · {"€".repeat(top.place.price)} · {km(top.place.distance)}
          {top.place.address ? ` · ${top.place.address}` : ""}
        </p>
        <p className="mt-3 text-sm font-semibold">
          {top.likes}/{state.members.length} oui : {top.likedBy.join(", ")}
        </p>
        <a href={mapUrl(top.place)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-paper px-4 py-2 text-sm font-semibold text-plum">
          Y aller ↗
        </a>
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
