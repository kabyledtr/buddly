"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader, BudgetPicker, Chip, Field, Spinner, inputCls, memberKey } from "../../AppShell";
import "./celebrate.css";
import { SITE_URL, groupPath } from "@/lib/slug";
import { CATEGORY_LABEL, type Budget, type Category, type Place } from "@/lib/types";

type Ranked = { place: Place; likes: number; nopes: number; likedBy: string[]; unanimous: boolean };
type State = {
  group: { id: string; name: string; when: string; area: string; premium: boolean; tier: Tier; size: number | null; isCreator: boolean; totalPlaces: number; slot?: { date?: string }; eventsStatus: "pending" | "done" | null; wantsEvents: boolean };
  deck: Place[];
  members: { id: string; name: string; done: number }[];
  me: string | null;
  myVotes: Record<string, 0 | 1>;
  ranking: Ranked[];
  rankedCount: number;
  unanimousCount: number;
  maxMembers: number;
  lockedPlaces: number;
  prices: Record<"pass" | "plus", number>;
  tiers: Record<Tier, { members: number; places: number; events: number }>;
  plusSplit: number;
};
type Tier = "free" | "pass" | "plus";
const TIER_LABEL: Record<Tier, string> = { free: "Gratuit", pass: "Pass Sortie", plus: "Buddly+" };

const BG: Record<Category, string> = {
  resto: "from-coral to-[#f9a58f]",
  bar: "from-plum to-violet",
  cafe: "from-[#f2a541] to-coral",
  activite: "from-violet to-[#b48cf0]",
};

const euros = (c: number) => (c / 100).toFixed(2).replace(".", ",") + " €";
/** « 4 min à pied » jusqu'à 1,5 km, sinon la distance. */
const walk = (m: number) => (m <= 1500 ? `${Math.max(1, Math.round(m / 80))} min à pied` : `à ${(m / 1000).toFixed(1).replace(".", ",")} km`);
const km = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);
const mapUrl = (p: Place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.address ?? `${p.lat},${p.lon}`}`)}`;

export default function GroupApp({ id }: { id: string }) {
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState("");
  // undefined tant qu'on n'a pas lu le navigateur : sinon l'organisateur voit un instant l'écran « X t'invite »
  const [memberId, setMemberId] = useState<string | null | undefined>(undefined);
  const [tab, setTab] = useState<"swipe" | "results">("swipe");
  const [toast, setToast] = useState("");
  const [localVotes, setLocalVotes] = useState<Record<string, 0 | 1>>({});
  const [inviteStep, setInviteStep] = useState(false); // écran « Invite ta bande » juste après la création

  useEffect(() => {
    let m: string | null = null;
    try {
      m = localStorage.getItem(memberKey(id));
    } catch {}
    setMemberId(m);
    const q = new URLSearchParams(location.search);
    // l'écran d'invitation reste tant que l'organisateur ne l'a pas validé (même si la page se recharge après le partage)
    try {
      if (q.get("nouveau")) sessionStorage.setItem(`buddly:invite:${id}`, "1");
      if (sessionStorage.getItem(`buddly:invite:${id}`)) setInviteStep(true);
    } catch {
      if (q.get("nouveau")) setInviteStep(true);
    }
    if (q.get("paiement") === "ok") {
      setToast("Pass Sortie activé ! Tout est débloqué pour le groupe.");
      setTab("results");
    } else if (q.get("paiement") === "plus") {
      setToast("Bienvenue dans Buddly+ ! Toutes tes sorties sont débloquées, à vie, avec ton e-mail.");
      setTab("results");
    } else if (q.get("paiement") === "annule") setToast("Paiement annulé.");
    else if (q.get("paiement") === "erreur") setToast("Le paiement n'a pas pu être vérifié.");

  }, [id]);

  const refresh = useCallback(async () => {
    if (memberId === undefined) return;
    const r = await fetch(`/api/groups/${id}?m=${memberId ?? ""}`, { cache: "no-store" });
    const j = await r.json();
    if (!r.ok) return setError(j.error ?? "Erreur");
    setState(j);
    const pretty = groupPath(id, j.group.name);
    if (location.pathname !== pretty || location.search) history.replaceState(null, "", pretty);
  }, [id, memberId]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  // Ateliers datés trouvés sur le web : cherchés une seule fois, juste après la création, puis ajoutés au deck.
  const eventsAsked = useRef(false);
  useEffect(() => {
    if (!state?.me || !state.group.wantsEvents || state.group.eventsStatus || eventsAsked.current) return;
    eventsAsked.current = true;
    fetch(`/api/groups/${id}/events`, { method: "POST" })
      .then((r) => r.json())
      .then((j) => {
        if (j.count > 0) setToast(`Bud a trouvé ${j.count} atelier${j.count > 1 ? "s" : ""} du jour : ils arrivent dans ton deck.`);
        refresh();
      })
      .catch(() => {});
  }, [id, state, refresh]);

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

  if (inviteStep && state.group.isCreator)
    return (
      <Screen>
        <InviteStep
          state={state}
          onDone={() => {
            try {
              sessionStorage.removeItem(`buddly:invite:${id}`);
            } catch {}
            setInviteStep(false);
          }}
        />
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
    <Screen right={<Invite state={state} />}>
      <div className="px-1">
        <h1 className="font-display text-2xl font-bold leading-tight text-plum">{state.group.name}</h1>
        <p className="text-sm text-muted">
          {[state.group.when, state.group.area].filter(Boolean).join(" · ")}
          {state.group.tier !== "free" && (
            <span className="ml-2 rounded-full bg-coral px-2 py-0.5 text-xs font-bold text-paper">{TIER_LABEL[state.group.tier]}</span>
          )}
        </p>
      </div>

      <Members state={state} onChange={refresh} />

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
    <div className="app-bg min-h-dvh bg-gradient-to-b from-[#fdf7fb] to-[#f3eafd]">
      <AppHeader right={right} />
      <main className="mx-auto max-w-xl px-4 pb-16">{children}</main>
    </div>
  );
}

/* ---------- inviter ---------- */

function inviteMessage(state: State) {
  const g = state.group;
  // le lien pointe vers le site où la sortie existe (buddly.io en prod, l'adresse locale pendant les tests)
  const origin = typeof window !== "undefined" ? window.location.origin : SITE_URL;
  const url = origin + groupPath(g.id, g.name);
  const me = state.members.find((m) => m.id === state.me)?.name;
  const when = g.when ? g.when.charAt(0).toLowerCase() + g.when.slice(1) : "";
  const spot = g.area.split(",")[0];
  const variants = [
    `${me ? `${me} t'a gardé une place` : "Je t'ai gardé une place"} pour « ${g.name} »${when ? `, ${when}` : ""} 🎉\nPas de débat de 3 jours : tu swipes les spots du coin, et Bud garde ce qui plaît à tout le monde.`,
    `« ${g.name} »${when ? ` · ${when}` : ""} 📍 ${spot}\nJe te laisse voter : 30 secondes de swipe et on sait où on va.`,
    `Bon, on arrête les « je sais pas, comme vous voulez » 😅\nPour « ${g.name} »${when ? ` (${when})` : ""}, chacun swipe ses spots préférés et on garde le match.`,
  ];
  const text = variants[g.id.charCodeAt(0) % variants.length];
  return { url, text };
}

function Invite({ state }: { state: State }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const { url, text } = inviteMessage(state);
    if (navigator.share) {
      try {
        await navigator.share({ title: state.group.name, text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
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

/** Écran affiché juste après la création : on invite la bande avant de swiper. */
function InviteStep({ state, onDone }: { state: State; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const { url, text } = inviteMessage(state);
  const pretty = url.replace(/^https?:\/\//, "");

  async function share() {
    haptic("tick");
    if (navigator.share) {
      try {
        await navigator.share({ title: state.group.name, text, url });
        setShared(true);
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setShared(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  }

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center text-center">
      <Image src="/pet-wave.png" alt="" width={700} height={665} sizes="180px" priority className="buddy-bob h-36 w-auto" />
      <h1 className="mt-4 font-display text-3xl font-bold text-plum">Invite ta bande</h1>
      <p className="mt-2 max-w-xs text-muted">
        Envoie le lien. Chacun swipe de son côté, et je garde ce qui plaît à tout le monde.
      </p>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
          } catch {}
        }}
        className="mt-6 max-w-full truncate rounded-full border border-plum/15 bg-paper px-5 py-2.5 text-sm font-semibold text-plum"
      >
        {copied ? "Lien copié !" : pretty}
      </button>
      <button
        type="button"
        onClick={share}
        className="mt-4 flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-coral py-3.5 font-semibold text-paper shadow-[0_8px_0_-2px_#d9604b] transition active:translate-y-0.5"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {shared ? "Partager encore" : "Partager le lien"}
      </button>
      {shared ? (
        <button
          type="button"
          onClick={onDone}
          className="mt-3 w-full max-w-xs rounded-full bg-plum py-3.5 font-semibold text-paper shadow-[0_8px_0_-2px_#2a1650] transition active:translate-y-0.5"
        >
          C&apos;est bon, c&apos;est partagé
        </button>
      ) : (
        <button type="button" onClick={onDone} className="mt-5 text-sm font-semibold text-muted underline-offset-4 hover:underline">
          Ma bande est déjà au courant
        </button>
      )}
    </div>
  );
}

function Members({ state, onChange }: { state: State; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const total = state.deck.length;
  const size = Math.min(state.group.size ?? state.maxMembers, state.maxMembers);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {state.members.map((m) => {
        const done = m.done >= total;
        const mine = m.id === state.me;
        return (
          <span
            key={m.id}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${mine ? "bg-plum text-paper" : "bg-paper text-ink"}`}
            title={done ? `${m.name} a fini de swiper` : `${m.name} a vu ${m.done} lieux sur ${total}`}
          >
            {m.name}
            {done && (
              <svg viewBox="0 0 24 24" className={`size-3.5 ${mine ? "text-lilac" : "text-[#1f9d55]"}`} aria-label="a fini">
                <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        );
      })}
      {state.group.isCreator ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 rounded-full border border-plum/15 bg-paper/60 px-3 py-1 text-xs font-semibold text-plum transition hover:bg-paper"
        >
          {state.members.length} sur {size} personnes
          <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden>
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <span className="text-xs text-muted">
          {state.members.length} sur {size} personnes
        </span>
      )}
      {open && <SizeSheet state={state} onClose={() => setOpen(false)} onSaved={onChange} />}
    </div>
  );
}

/** « Vous serez combien ? » : l'organisateur choisit la taille du groupe ; au-delà de l'offre, on propose la bonne. */
function SizeSheet({ state, onClose, onSaved }: { state: State; onClose: () => void; onSaved: () => void }) {
  const [n, setN] = useState(Math.min(state.group.size ?? state.maxMembers, state.maxMembers));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const max = state.tiers.plus.members;
  const fits = n <= state.maxMembers;
  const need: "pass" | "plus" = n <= state.tiers.pass.members && state.group.tier === "free" ? "pass" : "plus";

  async function save() {
    setBusy(true);
    setError("");
    const r = await fetch(`/api/groups/${state.group.id}/size`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberId: state.me, size: n }),
    });
    setBusy(false);
    if (!r.ok) return setError((await r.json().catch(() => ({}))).error ?? "Impossible d'enregistrer.");
    haptic("tick");
    onSaved();
    onClose();
  }
  async function pay(tier: "pass" | "plus") {
    setBusy(true);
    setError("");
    const r = await fetch(`/api/groups/${state.group.id}/checkout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberId: state.me, tier }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.url) return void (location.href = j.url);
    setBusy(false);
    setError(j.error ?? "Erreur de paiement");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-[2rem] bg-paper p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display text-2xl font-bold text-plum">Vous serez combien ?</p>
        <p className="mt-1 text-sm text-muted">Toi compris. Ton offre actuelle : jusqu&apos;à {state.maxMembers} personnes.</p>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {Array.from({ length: max - 1 }, (_, i) => i + 2).map((k) => {
            const locked = k > state.maxMembers;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setN(k)}
                aria-pressed={n === k}
                className={`relative grid aspect-square place-items-center rounded-full text-sm font-bold transition ${
                  n === k ? "bg-plum text-paper" : locked ? "bg-lilac/50 text-plum/50" : "bg-lilac text-plum hover:bg-lilac/80"
                }`}
              >
                {k}
              </button>
            );
          })}
        </div>
        {fits ? (
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center rounded-full bg-coral py-3.5 font-semibold text-paper shadow-[0_6px_0_-2px_#d9604b] disabled:opacity-60"
          >
            {busy ? <Spinner /> : `C'est parti pour ${n}`}
          </button>
        ) : (
          <div className="mt-6 rounded-3xl bg-plum p-5 text-paper">
            <p className="font-display text-lg font-semibold">
              À {n}, il te faut {need === "pass" ? "le Pass Sortie" : "Buddly+"}
            </p>
            <p className="mt-1 text-sm text-lilac">
              {need === "pass"
                ? `Jusqu'à ${state.tiers.pass.members} personnes pour cette sortie, ${euros(state.prices.pass)}. Ou Buddly+ à vie : jusqu'à ${max} personnes, ${euros(state.prices.plus)}.`
                : `Jusqu'à ${max} personnes sur toutes tes sorties, à vie, pour ${euros(state.prices.plus)}.`}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => pay("plus")}
                disabled={busy}
                className="rounded-full bg-coral py-3 font-semibold disabled:opacity-60"
              >
                {busy ? <Spinner /> : `Passer à Buddly+ · ${euros(state.prices.plus)}`}
              </button>
              {need === "pass" && (
                <button type="button" onClick={() => pay("pass")} disabled={busy} className="rounded-full border border-paper/30 py-3 font-semibold disabled:opacity-60">
                  Prendre le Pass · {euros(state.prices.pass)}
                </button>
              )}
            </div>
          </div>
        )}
        {error && <p className="mt-3 text-center text-sm text-[#a2402f]">{error}</p>}
        <button type="button" onClick={onClose} className="mt-4 w-full text-center text-sm font-semibold text-muted">
          Fermer
        </button>
      </div>
    </div>
  );
}

/* ---------- rejoindre ---------- */

function Join({ state, onJoined }: { state: State; onJoined: (m: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      body: JSON.stringify({ name, email, budget, likes }),
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
          Le groupe est complet ({state.maxMembers} personnes max). Demande à l&apos;organisateur de débloquer plus de places.
        </p>
      ) : (
        <form onSubmit={join} className="mt-6 space-y-6">
          <Field label="Ton prénom">
            <input required maxLength={24} value={name} onChange={(e) => setName(e.target.value)} placeholder="Yanis" className={inputCls} />
          </Field>
          <Field label="Ton e-mail">
            <input
              required
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yanis@mail.com"
              className={inputCls}
            />
            <p className="mt-1.5 px-2 text-xs text-muted">Pour que Bud te prévienne si la bande t&apos;attend. Jamais de pub.</p>
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


/* ---------- retours du swipe : vibration, feu d'artifice, croix et cœurs ---------- */

/** Vibration courte : API Vibration (Android), sinon l'interrupteur natif d'iOS 18+ qui déclenche un retour haptique. */
function haptic(kind: "tick" | "like" | "nope") {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(kind === "like" ? [12, 50, 18] : kind === "nope" ? 18 : 8);
      return;
    }
    // iOS 18+ : basculer un interrupteur natif produit un retour haptique léger (doit suivre un geste de l'utilisateur)
    const label = document.createElement("label");
    label.ariaHidden = "true";
    label.style.display = "none";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    label.appendChild(input);
    document.head.appendChild(label);
    label.click();
    document.head.removeChild(label);
  } catch {}
}

type Spark = { x: number; y: number; c: string; s: number; heart: boolean; d: number };
const SPARK_COLORS = ["#f7806a", "#8b55e3", "#ffc93f", "#ff5c8a", "#4d8dff", "#43207a"];
function makeSparks(): Spark[] {
  return Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + Math.random() * 0.35;
    const dist = 80 + Math.random() * 110;
    return {
      x: Math.cos(a) * dist,
      y: Math.sin(a) * dist - 40,
      c: SPARK_COLORS[i % SPARK_COLORS.length],
      s: 7 + Math.random() * 9,
      heart: i % 3 === 0,
      d: Math.random() * 90,
    };
  });
}

function HeartIcon({ className = "", color = "#ff5c8a", size }: { className?: string; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width={size} height={size} aria-hidden>
      <path fill={color} d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}
function ThumbIcon({ className = "", size }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width={size} height={size} aria-hidden>
      <path fill="#4d8dff" d="M2 10.5h3.5V21H2zM7 21V10.2l4.6-7.1c.5-.8 1.6-1 2.4-.4.6.5.9 1.2.7 2l-1 4.3h5.9c1.4 0 2.4 1.3 2.1 2.6l-1.7 7.6c-.3 1.1-1.3 1.8-2.4 1.8z" />
    </svg>
  );
}
function CrossIcon({ className = "", size }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width={size} height={size} aria-hidden>
      <path stroke="#ff3b4f" strokeWidth="4.2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// positions des icônes qui apparaissent pendant qu'on tire la carte (en % de la zone du deck)
const AURA: { x: number; y: number; r: number; size: number; d: number }[] = [
  { x: 6, y: 12, r: -14, size: 46, d: 0 },
  { x: 16, y: 38, r: 10, size: 34, d: 0.4 },
  { x: 4, y: 62, r: -6, size: 52, d: 0.2 },
  { x: 18, y: 82, r: 16, size: 30, d: 0.6 },
  { x: 26, y: 22, r: 4, size: 26, d: 0.9 },
];

function SwipeAura({ dx }: { dx: number }) {
  const p = Math.min(1, Math.abs(dx) / 120);
  if (p < 0.08) return null;
  const like = dx > 0;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {AURA.map((a, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            [like ? "left" : "right"]: `${a.x}%`,
            top: `${a.y}%`,
            opacity: p,
            transform: `scale(${0.5 + 0.7 * p}) rotate(${like ? -a.r : a.r}deg)`,
            transition: "opacity .12s, transform .12s",
          }}
        >
          <span className="swipe-float block" style={{ animationDelay: `${a.d}s` }}>
            {like ? (
              i % 2 ? (
                <ThumbIcon className="drop-shadow-md" size={a.size} />
              ) : (
                <HeartIcon className="drop-shadow-md" size={a.size} color={i % 4 === 0 ? "#ff5c8a" : "#f7806a"} />
              )
            ) : (
              <CrossIcon className="drop-shadow-md" size={a.size} />
            )}
          </span>
        </span>
      ))}
    </div>
  );
}

// icônes le long du bord de l'écran (en % de la hauteur)
const EDGE: { y: number; x: number; r: number; size: number; d: number }[] = [
  { y: 14, x: 10, r: -12, size: 40, d: 0 },
  { y: 30, x: 28, r: 8, size: 28, d: 0.5 },
  { y: 47, x: 6, r: -4, size: 48, d: 0.2 },
  { y: 64, x: 30, r: 14, size: 30, d: 0.8 },
  { y: 80, x: 12, r: -10, size: 38, d: 0.35 },
];

/** Lueur et icônes sur le bord de l'écran vers lequel part la carte. */
function EdgeEffects({ dx }: { dx: number }) {
  const p = Math.min(1, Math.abs(dx) / 120);
  if (p < 0.08) return null;
  const like = dx > 0;
  return (
    <div
      className={`pointer-events-none fixed inset-y-0 z-30 w-28 sm:w-40 ${like ? "right-0" : "left-0"}`}
      style={{
        opacity: p,
        background: like
          ? "linear-gradient(to left, rgba(255,92,138,.28), rgba(255,92,138,0))"
          : "linear-gradient(to right, rgba(255,59,79,.26), rgba(255,59,79,0))",
      }}
      aria-hidden
    >
      {EDGE.map((e, i) => (
        <span
          key={i}
          className="absolute"
          style={{ top: `${e.y}%`, [like ? "right" : "left"]: `${e.x}%`, transform: `scale(${0.5 + 0.6 * p}) rotate(${like ? -e.r : e.r}deg)` }}
        >
          <span className="swipe-float block" style={{ animationDelay: `${e.d}s` }}>
            {like ? (
              i % 2 ? <ThumbIcon size={e.size} className="drop-shadow-md" /> : <HeartIcon size={e.size} className="drop-shadow-md" />
            ) : (
              <CrossIcon size={e.size} className="drop-shadow-md" />
            )}
          </span>
        </span>
      ))}
    </div>
  );
}

function Fireworks({ sparks }: { sparks: Spark[] }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[42%] z-40" aria-hidden>
      {sparks.map((p, i) =>
        p.heart ? (
          <span
            key={i}
            className="firework"
            style={{ "--x": `${p.x}px`, "--y": `${p.y}px`, animationDelay: `${p.d}ms` } as React.CSSProperties}
          >
            <HeartIcon color={p.c} className="block" size={18} />
          </span>
        ) : (
          <span
            key={i}
            className="firework rounded-full"
            style={{ "--x": `${p.x}px`, "--y": `${p.y}px`, width: p.s, height: p.s, background: p.c, animationDelay: `${p.d}ms` } as React.CSSProperties}
          />
        ),
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
  const [leaving, setLeaving] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; sparks: Spark[] }[]>([]);
  const start = useRef<{ x: number; y: number } | null>(null);
  const crossed = useRef(false);
  const place = remaining[0];
  const upcoming = remaining
    .slice(1, 5)
    .map((p) => p.photos?.[0])
    .filter(Boolean)
    .join("|");
  useEffect(() => {
    for (const n of upcoming.split("|").filter(Boolean)) {
      const img = new window.Image();
      img.src = photoSrc(n);
    }
  }, [upcoming]);

  if (!place)
    return (
      <>
        {bursts.map((b) => (
          <Fireworks key={b.id} sparks={b.sparks} />
        ))}
        <Celebrate onDone={onDone} />
      </>
    );

  const decide = (like: boolean) => {
    if (leaving) return;
    haptic(like ? "like" : "nope");
    setLeaving(true);
    setDx(like ? 560 : -560);
    if (like) {
      const id = Date.now();
      setBursts((b) => [...b, { id, sparks: makeSparks() }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1200);
    }
    setTimeout(() => {
      setLeaving(false);
      setDx(0);
      crossed.current = false;
      onVote(place, like);
    }, 240);
  };
  const up = () => {
    if (start.current === null) return;
    start.current = null;
    if (dx > 90) decide(true);
    else if (dx < -90) decide(false);
    else {
      setDx(0);
    }
  };

  const p = Math.min(1, Math.abs(dx) / 120);
  const mood = dx > 40 ? "yes" : dx < -40 ? "nope" : null;
  const dragging = start.current !== null;

  return (
    <div>
      <p className="mb-3 text-center text-sm font-medium text-muted">
        {total - remaining.length + 1} / {total}
      </p>
      <div className="relative mx-auto h-[540px] max-w-sm select-none">
        {remaining[1] && (
          <Card
            place={remaining[1]}
            style={{
              transform: `scale(${0.94 + 0.06 * p})`,
              opacity: 0.55 + 0.45 * p,
              transition: dragging ? "none" : "transform .25s ease, opacity .25s ease",
            }}
          />
        )}
        <SwipeAura dx={dx} />
        <EdgeEffects dx={dx} />
        <Card
          key={place.id}
          place={place}
          date={date}
          active
          className="cursor-grab touch-pan-y active:cursor-grabbing"
          style={{
            transform: `translateX(${dx}px) rotate(${dx / 16}deg)`,
            transition: dragging ? "none" : leaving ? "transform .24s cubic-bezier(.4,.1,.8,.4)" : "transform .35s cubic-bezier(.2,1.4,.4,1)",
          }}
          badge={dx > 40 ? "like" : dx < -40 ? "nope" : null}
          onPointerDown={(e) => {
            if (leaving || (e.target as HTMLElement).closest("a,button,[data-noswipe]")) return;
            start.current = { x: e.clientX, y: e.clientY };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (start.current === null) return;
            const x = e.clientX - start.current.x;
            // on ne bouge la carte que si le geste est surtout horizontal (sinon c'est un scroll)
            if (Math.abs(x) < 8 && Math.abs(e.clientY - start.current.y) > Math.abs(x)) return;
            setDx(x);
            const over = Math.abs(x) > 90;
            if (over && !crossed.current) haptic("tick");
            crossed.current = over;
          }}
          onPointerUp={up}
          onPointerCancel={up}
        />
        {bursts.map((b) => (
          <Fireworks key={b.id} sparks={b.sparks} />
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-5">
        <button
          aria-label="Bof"
          onClick={() => decide(false)}
          className="grid size-16 place-items-center rounded-full border-2 border-ink/10 bg-paper shadow-sm transition hover:scale-105 active:scale-90"
          style={{ transform: mood === "nope" ? `scale(${1 + 0.15 * p})` : undefined }}
        >
          <CrossIcon className="size-7" />
        </button>
        <div className="relative size-20" aria-hidden>
          <Image
            src="/pet-wonder.png"
            alt=""
            width={425}
            height={480}
            sizes="80px"
            className="absolute inset-0 size-full object-contain transition duration-150"
            style={{ opacity: mood ? 0 : 1 }}
          />
          <Image
            src="/pet-nope.png"
            alt=""
            width={454}
            height={480}
            sizes="80px"
            className="absolute inset-0 size-full object-contain transition duration-150"
            style={{ opacity: mood === "nope" ? 1 : 0, transform: mood === "nope" ? `scale(${1 + 0.12 * p}) rotate(-6deg)` : "scale(.8)" }}
          />
          <Image
            src="/pet-yes.png"
            alt=""
            width={433}
            height={480}
            sizes="80px"
            className="absolute inset-0 size-full object-contain transition duration-150"
            style={{ opacity: mood === "yes" ? 1 : 0, transform: mood === "yes" ? `scale(${1 + 0.12 * p}) rotate(6deg)` : "scale(.8)" }}
          />
        </div>
        <button
          aria-label="J'aime"
          onClick={() => decide(true)}
          className="grid size-16 place-items-center rounded-full bg-coral shadow-[0_6px_0_-1px_#d9604b] transition hover:scale-105 active:scale-90"
          style={{ transform: mood === "yes" ? `scale(${1 + 0.15 * p})` : undefined }}
        >
          <HeartIcon className="size-8" color="#fff" />
        </button>
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        {place.photos ? "Photos, notes et avis : Google" : "Données des lieux © contributeurs OpenStreetMap"}
      </p>
    </div>
  );
}

const photoSrc = (n: string, w = 1080) => `/api/photo?n=${encodeURIComponent(n)}&w=${w}`;

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
  const [bad, setBad] = useState<string[]>([]);
  const photos = (place.photos ?? []).filter((n) => !bad.includes(n)); // photos qui ont échoué : on passe à la suivante
  const [rawI, setI] = useState(0);
  const i = Math.min(rawI, Math.max(0, photos.length - 1));
  const [loaded, setLoaded] = useState<string | null>(null);
  const [films, setFilms] = useState<{ films: { title: string; times: string[]; version?: string; genre?: string }[]; note?: string; unavailable?: boolean } | null>(null);
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
          decoding="async"
          fetchPriority={active ? "high" : "auto"}
          onLoad={() => setLoaded(photos[i])}
          onError={() => setBad((b) => [...b, photos[i]])}
          className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-300 ${
            loaded === photos[i] ? "opacity-100" : "opacity-0"
          }`}
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
                className="absolute left-3 top-[46%] z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/95 text-plum shadow-[0_6px_16px_-6px_rgba(67,32,122,0.55)] transition active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                type="button"
                aria-label="Photo suivante"
                onPointerDown={stop}
                onClick={() => setI((i + 1) % photos.length)}
                className="absolute right-3 top-[46%] z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/95 text-plum shadow-[0_6px_16px_-6px_rgba(67,32,122,0.55)] transition active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
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


      {/* infos */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <p className="text-sm font-semibold text-paper/85">
          {place.kind}
          {place.event && <span className="text-coral"> · Atelier du jour</span>}
          {place.diet && <span className="text-[#b9f5cf]"> · {place.diet}</span>}
        </p>
        <h3 className="mt-1 font-display text-[2rem] font-bold leading-[1.05]">{place.name}</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-paper/90">
          {place.openLabel && (
            <>
              <span className="size-1.5 rounded-full bg-[#5ee08f]" aria-hidden />
              <span>{place.openLabel}</span>
              <span className="text-paper/50">·</span>
            </>
          )}
          <span>{walk(place.distance)}</span>
        </p>
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
          {place.event && (
            <a
              href={place.event.url}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={stop}
              className="rounded-full bg-paper px-3 py-1.5 text-xs font-bold text-plum"
            >
              Réserver{place.event.source ? ` sur ${place.event.source}` : ""} ↗
            </a>
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
                <Spinner className="size-4" /> Bud cherche les séances…
              </p>
            ) : films?.films.length ? (
              <>
                {films.note && <p className="mb-1 text-sm text-lilac">{films.note}</p>}
                {films.films.map((f) => (
                  <div key={f.title} className="flex items-start gap-3 rounded-2xl bg-paper/10 p-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-coral/90 text-sm" aria-hidden>
                      ▶
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-tight">{f.title}</p>
                      {(f.genre || f.version) && (
                        <p className="mt-0.5 text-xs text-paper/60">{[f.genre, f.version].filter(Boolean).join(" · ")}</p>
                      )}
                      {f.times.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[...f.times].sort().map((t) => (
                            <span key={t} className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-bold text-plum">
                              {t.replace(":", "h")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="rounded-2xl bg-paper/10 p-4 text-sm text-paper/85">
                <p>
                  {films?.unavailable
                    ? "La recherche de séances n'est pas encore activée."
                    : films?.note ?? "Le programme de ce jour n'est pas encore publié."}
                </p>
                <p className="mt-2 text-paper/60">Les cinémas publient leurs séances environ une semaine à l&apos;avance.</p>
              </div>
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
      <div className="mx-auto mt-6 w-60 pb-3">
        <Image src="/pet-cool.png" alt="Bud avec ses lunettes de soleil" width={900} height={816} sizes="240px" priority className="buddy-bob mx-auto h-48 w-auto select-none" draggable={false} />
      </div>
      <h2 className="font-display text-3xl font-bold text-plum">Tu as tout swipé !</h2>
      <p className="mt-1 text-muted">Bud fait les comptes : regarde ce qui plaît au groupe.</p>
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

  async function pay(tier: "pass" | "plus") {
    setPaying(true);
    setPayError("");
    const r = await fetch(`/api/groups/${id}/checkout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberId: state.me, tier }),
    });
    const j = await r.json();
    if (r.ok && j.url) return (location.href = j.url);
    setPaying(false);
    setPayError(j.error ?? "Erreur de paiement");
  }

  const waiting = state.members.filter((m) => m.done < state.deck.length).map((m) => m.name);
  const tier = state.group.tier;

  if (!top)
    return (
      <div className="rounded-3xl bg-paper p-8 text-center">
        <p className="font-display text-2xl font-bold text-plum">Pas encore de résultat</p>
        <p className="mt-2 text-muted">Swipe quelques lieux et invite tes amis : le classement apparaît dès les premiers « oui ».</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {waiting.length > 0 && <Waiting id={id} state={state} names={waiting} />}

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
        <p className="font-display text-lg font-semibold">
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
        {top.place.event && (
          <a href={top.place.event.url} target="_blank" rel="noopener noreferrer" className="ml-2 mt-4 inline-block rounded-full bg-coral px-4 py-2 text-sm font-semibold text-paper">
            Réserver l&apos;atelier ↗
          </a>
        )}
        </div>
      </div>

      {/* IA */}
      <div className="flex gap-3 rounded-3xl bg-paper p-5">
        <Image src="/pet.png" alt="" width={48} height={48} className="size-12 shrink-0 rounded-2xl" />
        <div>
          <p className="font-display text-lg font-semibold text-plum">Le mot de Bud</p>
          <p className="mt-1 text-[15px] text-ink/90">{aiLoading && !ai ? "Bud réfléchit…" : ai}</p>
        </div>
      </div>

      {/* tous les résultats ou paywall */}
      {tier !== "free" ? (
        <div className="rounded-3xl bg-paper p-5">
          <p className="font-display text-xl font-semibold text-plum">Tous les résultats</p>
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
          <div className="relative mt-[-5.5rem]">
            <Paywall state={state} paying={paying} onPay={pay} />
          </div>
        </div>
      )}

      {tier === "pass" && <Paywall state={state} paying={paying} onPay={pay} plusOnly />}
      {payError && <p className="text-center text-sm text-[#a2402f]">{payError}</p>}
    </div>
  );
}

/* ---------- relance des retardataires (Buddly+) ---------- */

function Waiting({ id, state, names }: { id: string; state: State; names: string[] }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const plus = state.group.tier === "plus";
  const others = names.filter((n) => n !== state.members.find((m) => m.id === state.me)?.name);

  async function remind() {
    setBusy(true);
    setMsg("");
    const r = await fetch(`/api/groups/${id}/remind`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberId: state.me }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setMsg(j.error ?? "La relance n'a pas marché.");
    if (j.sent?.length) return setMsg(`Bud a relancé ${j.sent.join(", ")} par e-mail.`);
    if (j.message) return setMsg(j.message);
    // Personne de joignable par e-mail (ou relance trop récente) : on passe par WhatsApp.
    const { url } = inviteMessage(state);
    const text = `${others.join(", ")}, il ne manque que vous pour « ${state.group.name} » ! 1 minute pour swiper :`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank", "noopener");
    setMsg("Déjà relancé il y a peu par e-mail : message WhatsApp prêt.");
  }

  return (
    <div className="rounded-2xl bg-paper px-4 py-3 text-sm text-muted">
      <div className="flex items-center gap-3">
        <p className="flex-1">
          En attente de <b className="text-ink">{names.join(", ")}</b>. Les résultats se mettent à jour en direct.
        </p>
        {plus && others.length > 0 && (
          <button
            onClick={remind}
            disabled={busy}
            className="shrink-0 rounded-full bg-plum px-4 py-2 text-xs font-bold text-paper disabled:opacity-60"
          >
            {busy ? <Spinner /> : "Relancer"}
          </button>
        )}
      </div>
      {!plus && others.length > 0 && <p className="mt-1 text-xs">Avec Buddly+, Bud relance les retardataires pour toi.</p>}
      {msg && <p className="mt-1.5 text-xs font-semibold text-plum">{msg}</p>}
    </div>
  );
}

/* ---------- paywall : Pass Sortie (leurre) et Buddly+ à vie ---------- */

function Paywall({
  state,
  paying,
  onPay,
  plusOnly = false,
}: {
  state: State;
  paying: boolean;
  onPay: (t: "pass" | "plus") => void;
  plusOnly?: boolean;
}) {
  const { prices, tiers, plusSplit } = state;
  const cents = Math.round(prices.plus / plusSplit);
  return (
    <div className="space-y-3">
      <div className="relative rounded-3xl bg-plum p-6 text-paper shadow-xl ring-4 ring-coral/40">
        <span className="absolute -top-3 right-5 rounded-full bg-coral px-3 py-1 text-xs font-bold">Recommandé</span>
        <p className="font-display text-lg font-semibold text-coral">Buddly+ à vie</p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold">{euros(prices.plus)}</span>
          <span className="text-sm text-lilac">une fois, pour toujours</span>
        </p>
        <p className="mt-2 text-sm font-semibold">
          Divisé par ta bande de {plusSplit}, ça fait {cents} centimes chacun. Pour ne plus jamais entendre « je sais pas, comme vous voulez ».
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-lilac">
          <li>✓ Toutes tes sorties débloquées, à vie</li>
          <li>✓ Jusqu&apos;à {tiers.plus.members} personnes et {tiers.plus.places} adresses</li>
          <li>✓ Tous les ateliers du jour trouvés par Bud</li>
          <li>✓ Tous les résultats, du 1er au dernier</li>
          <li>✓ Bud tranche les égalités et prépare un plan B</li>
          <li>✓ Bud relance ceux qui n&apos;ont pas swipé</li>
        </ul>
        <button
          onClick={() => onPay("plus")}
          disabled={paying}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3.5 font-semibold text-paper shadow-[0_6px_0_-2px_#d9604b] disabled:opacity-60"
        >
          {paying ? <Spinner /> : `Passer à Buddly+ pour ${euros(prices.plus)}`}
        </button>
        <p className="mt-3 text-center text-xs text-lilac/80">
          Paiement unique sécurisé par Stripe, lié à ton e-mail. <Link href="/cgv" className="underline">CGV</Link>
        </p>
      </div>

      {!plusOnly && (
        <div className="flex items-center gap-3 rounded-3xl border border-plum/15 bg-paper p-4">
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-plum">Pass Sortie · {euros(prices.pass)}</p>
            <p className="text-xs text-muted">
              Cette sortie seulement : {tiers.pass.members} personnes, {tiers.pass.places} adresses, {tiers.pass.events} ateliers du jour, tous les résultats.
            </p>
          </div>
          <button
            onClick={() => onPay("pass")}
            disabled={paying}
            className="shrink-0 rounded-full border border-plum/25 px-4 py-2 text-sm font-semibold text-plum disabled:opacity-60"
          >
            Choisir
          </button>
        </div>
      )}
    </div>
  );
}
