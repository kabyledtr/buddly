"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader, BudgetPicker, Chip, Field, inputCls, memberKey } from "../AppShell";
import AddressInput, { type Spot } from "./AddressInput";
import DatePicker, { absoluteLabel, type Slot } from "./DatePicker";
import { CATEGORY_LABEL, DIET_LABEL, type Budget, type Category, type Diet } from "@/lib/types";
import "./wizard.css";

const RADII = [
  { v: 1000, mode: "À pied", dist: "1 km" },
  { v: 3000, mode: "À vélo", dist: "3 km" },
  { v: 5000, mode: "En métro", dist: "5 km" },
  { v: 10000, mode: "En voiture", dist: "10 km" },
];

const NAME_IDEAS = ["Dîner entre potes", "Afterwork", "Sortie du samedi", "Anniversaire"];

const STEPS = [
  {
    pet: "/pet-wave.png",
    title: "Salut, moi c'est Bud !",
    say: "On trouve votre spot en 3 clics. Zéro débat, promis.",
  },
  {
    pet: "/pet-think.png",
    title: "Quand et où ?",
    say: "Je ne garde que les lieux ouverts à ce moment-là.",
  },
  {
    pet: "/pet-love.png",
    title: "Vos envies !",
    say: "Dernière ligne droite, je m'occupe du reste.",
  },
];

const PETS = ["/pet-wave.png", "/pet-think.png", "/pet-love.png", "/pet-happy.png"];

const LOADING = [
  "Je fouille le quartier…",
  "Je vérifie qui est ouvert à cette heure-là…",
  "Je lis les avis pour garder les meilleurs…",
  "Je prépare vos cartes à swiper…",
];

function Star({ className, color }: { className: string; color: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`wz-star absolute ${className}`} fill={color} aria-hidden>
      <path d="M12 1.5c.6 4.6 2.4 7.6 6 9.2.9.4.9 1.7 0 2.1-3.6 1.6-5.4 4.6-6 9.2-.2 1-1.6 1-1.8 0-.6-4.6-2.4-7.6-6-9.2-.9-.4-.9-1.7 0-2.1 3.6-1.6 5.4-4.6 6-9.2.2-1 1.6-1 1.8 0z" />
    </svg>
  );
}

function Decor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* bulles discrètes en haut à droite */}
      <span className="wz-blob absolute -right-20 -top-20 size-56 rounded-full bg-lilac/70" />
      <span className="wz-blob absolute right-10 top-40 size-5 rounded-full bg-violet/30 [animation-delay:-3s]" />

      {/* vagues en bas à gauche */}
      <svg viewBox="0 0 320 260" className="absolute -bottom-2 -left-2 h-[230px] w-[290px] sm:h-[300px] sm:w-[380px]">
        <path d="M0 40c60 6 98 44 120 92 20 44 60 70 120 74 30 2 56 12 80 54H0z" fill="#ece2fd" />
        <path d="M0 120c46 2 74 30 90 62 16 30 44 50 92 54 28 2 50 10 66 24H0z" fill="#c9b3ff" opacity=".7" />
        <path d="M0 186c34 0 54 18 66 38 10 18 28 30 58 36H0z" fill="#8b55e3" opacity=".55" />
        <path d="M-4 96c52 4 84 36 104 74" fill="none" stroke="#f7806a" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      </svg>

      {/* petite vague en bas à droite */}
      <svg viewBox="0 0 200 120" className="absolute -bottom-1 -right-1 h-[90px] w-[150px] sm:h-[120px] sm:w-[200px]">
        <path d="M200 10c-40 4-62 30-76 56-12 22-36 40-70 46-20 4-40 6-54 8h200z" fill="#ffe4dc" />
      </svg>

      {/* étoiles */}
      <Star className="left-[34%] top-[132px] size-3.5 sm:left-[26%]" color="#f7806a" />
      <Star className="bottom-7 left-[46%] size-5 [animation-delay:-1.2s]" color="#ffc93f" />
      <Star className="bottom-20 left-5 size-3 [animation-delay:-2.1s] sm:bottom-40 sm:left-16" color="#ffffff" />
      <Star className="bottom-24 right-7 size-3.5 [animation-delay:-.6s]" color="#f7806a" />
      <Star className="right-1 top-[46%] size-3 [animation-delay:-1.7s] sm:right-[12%] sm:size-4" color="#ffc93f" />
      <Star className="left-1 top-[58%] size-2.5 [animation-delay:-2.6s] sm:left-[12%] sm:size-4" color="#8b55e3" />
    </div>
  );
}

function Buddly({ step, loading }: { step: number; loading: boolean }) {
  const s = STEPS[step];
  const [msg, setMsg] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setMsg((m) => (m + 1) % LOADING.length), 1800);
    return () => clearInterval(t);
  }, [loading]);

  const pet = loading ? "/pet-happy.png" : s.pet;
  return (
    <>
    {/* précharge toutes les images de Bud pour qu'elles s'affichent sans délai */}
    <div aria-hidden className="hidden">
      {PETS.map((p) => (
        <Image key={p} src={p} alt="" width={700} height={700} sizes="220px" priority />
      ))}
    </div>
    <div className={loading ? "flex flex-col items-center gap-4 pt-10 text-center" : "flex items-end gap-3"}>
      <div key={pet} className="wz-pet shrink-0">
        <Image src={pet} alt="Bud" width={700} height={700} sizes="220px" priority draggable={false} className={`${loading ? "h-52" : "h-24 sm:h-28"} w-auto select-none`} />
      </div>
      <div key={loading ? "l" + msg : step} className={`wz-bubble relative rounded-[1.75rem] bg-paper ${loading ? "" : "mb-5 rounded-bl-md"} px-5 py-4 shadow-[0_12px_30px_-14px_rgba(67,32,122,0.35)]`}>
        {loading ? (
          <p className="font-medium text-ink">
            {LOADING[msg]}
            <span className="ml-1 inline-flex gap-0.5">
              <span className="wz-dot">.</span>
              <span className="wz-dot [animation-delay:.2s]">.</span>
              <span className="wz-dot [animation-delay:.4s]">.</span>
            </span>
          </p>
        ) : (
          <>
            <p className="font-display text-lg font-bold leading-tight text-plum sm:text-xl">{s.title}</p>
            <p className="mt-0.5 text-sm leading-snug text-muted sm:text-[15px]">{s.say}</p>
          </>
        )}
      </div>
    </div>
    </>
  );
}

export default function CreateGroup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [creatorName, setCreatorName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [radius, setRadius] = useState(3000);
  const [cats, setCats] = useState<Category[]>(["resto", "bar"]);
  const [diets, setDiets] = useState<Diet[]>([]);
  const [budget, setBudget] = useState<Budget>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Chaque étape a son entrée dans l'historique : le bouton retour du téléphone revient à l'étape d'avant.
  function goStep(n: number) {
    setStep(n);
    window.history.pushState(null, "", n ? `/app?etape=${n + 1}` : "/app");
  }
  useEffect(() => {
    if (location.search.includes("etape")) window.history.replaceState(null, "", "/app"); // les réponses ne sont pas gardées
    const sync = () => {
      const e = Number(new URLSearchParams(location.search).get("etape"));
      setError("");
      setStep(e >= 2 && e <= 3 ? e - 1 : 0);
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  function next(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    if (step === 0 && !creatorName.trim()) return setError("Dis-moi ton prénom.");
    if (step === 1 && !slot) return setError("Choisis le jour et le créneau.");
    if (step === 1 && !spot) return setError("Choisis une adresse dans la liste ou utilise ta position.");
    if (step < 2) return goStep(step + 1);
    submit();
  }

  async function submit() {
    if (!cats.length) return setError("Choisis au moins une envie.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Il me faut ton e-mail pour lancer la recherche.");
    setLoading(true);
    try {
      const r = await fetch("/api/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          creatorName,
          email,
          name: name || "Notre sortie",
          when: absoluteLabel(slot!.date, slot!.from, slot!.to),
          date: slot!.date,
          from: slot!.from,
          to: slot!.to,
          area: spot!.label,
          lat: spot!.lat,
          lon: spot!.lon,
          radius,
          categories: cats,
          diets,
          budget,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Erreur");
      try {
        localStorage.setItem(memberKey(j.id), j.memberId);
      } catch {}
      router.push(`/g/${j.id}?nouveau=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  }

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="app-bg relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#fdf7fb] to-[#f3eafd]">
      <Decor />
      <div className="relative">
        <AppHeader />
        <main className="mx-auto max-w-xl px-4 pb-8">
          {/* progression */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (step ? window.history.back() : router.push("/"))}
              disabled={loading}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-paper text-lg text-plum shadow-sm transition hover:bg-lilac disabled:opacity-40"
              aria-label="Retour"
            >
              ‹
            </button>
            <div className="flex flex-1 gap-2">
              {STEPS.map((_, i) => (
                <span key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-paper">
                  <span
                    className="block h-full rounded-full bg-coral transition-all duration-500"
                    style={{ width: i < step || loading ? "100%" : i === step ? "50%" : "0%" }}
                  />
                </span>
              ))}
            </div>
            <span className="w-10 text-right text-sm font-semibold text-muted">{Math.min(step + 1, 3)}/3</span>
          </div>

          <div className="mt-3">
            <Buddly step={step} loading={loading} />
          </div>

          {!loading && (
            <form key={step} onSubmit={next} className="wz-step mt-2 space-y-4 rounded-[2.5rem] border border-plum/10 bg-paper/70 p-5 sm:p-7">
              {step === 0 && (
                <>
                  <Field label="Ton prénom">
                    <input autoFocus maxLength={24} value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="Léa" className={inputCls} />
                  </Field>
                  <Field label="Le nom de la sortie">
                    <input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Dîner entre potes" className={inputCls} />
                    <div className="flex flex-wrap gap-2 pt-1">
                      {NAME_IDEAS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setName(n)}
                          className="rounded-full bg-lilac/70 px-3 py-1.5 text-sm font-medium text-plum transition hover:bg-lilac"
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label="Quand ?">
                    <DatePicker value={slot} onChange={setSlot} />
                  </Field>
                  <Field label="Où ?">
                    <AddressInput value={spot} onChange={setSpot} />
                  </Field>
                  <Field label="Jusqu'où on est prêts à aller ?">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {RADII.map((r) => {
                        const active = radius === r.v;
                        return (
                          <button
                            key={r.v}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setRadius(r.v)}
                            className={`rounded-full border-2 px-4 py-2 text-left transition ${
                              active ? "border-plum bg-plum text-paper" : "border-plum/15 bg-paper text-ink hover:border-plum/40"
                            }`}
                          >
                            <span className="block text-sm font-semibold">{r.mode}</span>
                            <span className={`block text-xs ${active ? "text-lilac" : "text-muted"}`}>jusqu&apos;à {r.dist}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="Ça vous dit quoi ?">
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                        <Chip key={c} active={cats.includes(c)} onClick={() => setCats((s) => toggle(s, c))}>
                          {CATEGORY_LABEL[c]}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Dans le groupe, on mange…">
                    <div className="flex flex-wrap gap-2">
                      <Chip active={!diets.length} onClick={() => setDiets([])}>
                        De tout
                      </Chip>
                      {(Object.keys(DIET_LABEL) as Diet[]).map((d) => (
                        <Chip key={d} active={diets.includes(d)} onClick={() => setDiets((s) => toggle(s, d))}>
                          {DIET_LABEL[d]}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Ton budget">
                    <BudgetPicker value={budget} onChange={setBudget} />
                  </Field>
                  <Field label="Ton e-mail, pour retrouver ta sortie">
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      maxLength={120}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="lea@mail.com"
                      className={inputCls}
                    />
                  </Field>
                </>
              )}

              {error && <p className="rounded-2xl bg-peach px-4 py-3 text-sm font-medium text-[#a2402f]">{error}</p>}

              <button className="w-full rounded-full bg-coral py-3.5 font-semibold text-paper shadow-[0_8px_0_-2px_#d9604b] transition hover:translate-y-0.5 hover:shadow-[0_5px_0_-2px_#d9604b]">
                {step < 2 ? "Continuer" : "Trouver nos adresses"}
              </button>
              {step === 0 && <p className="text-center text-xs text-muted">Gratuit pour toi et un pote. Sans mot de passe, sans carte bancaire.</p>}
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
