"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader, Chip, Field, Spinner, inputCls, memberKey } from "../AppShell";
import { CATEGORY_LABEL, type Budget, type Category } from "@/lib/types";

const RADII = [
  [500, "500 m"],
  [1000, "1 km"],
  [2000, "2 km"],
  [5000, "5 km"],
] as const;

export default function CreateGroup() {
  const router = useRouter();
  const [creatorName, setCreatorName] = useState("");
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [area, setArea] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [radius, setRadius] = useState(1000);
  const [cats, setCats] = useState<Category[]>(["resto", "bar"]);
  const [budget, setBudget] = useState<Budget>(2);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  function locate() {
    if (!navigator.geolocation) return setError("La géolocalisation n'est pas disponible.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lon: p.coords.longitude });
        setArea("Autour de moi");
        setLocating(false);
        setError("");
      },
      () => {
        setLocating(false);
        setError("Position refusée : tape plutôt ton quartier ou ta ville.");
      },
      { timeout: 10000 },
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ creatorName, name, when, area, radius, categories: cats, budget, ...(coords ?? {}) }),
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

  return (
    <div className="min-h-svh bg-gradient-to-b from-[#fdf7fb] to-[#f3eafd]">
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 pb-16">
        <div className="flex items-center gap-4">
          <Image src="/pet.png" alt="" width={64} height={64} className="size-14 rounded-2xl" />
          <div>
            <h1 className="font-display text-3xl font-bold text-plum">Nouvelle sortie</h1>
            <p className="text-muted">Buddy trouve les adresses, vous swipez.</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-7">
          <Field label="Ton prénom">
            <input required maxLength={24} value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="Léa" className={inputCls} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="La sortie">
              <input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Dîner entre potes" className={inputCls} />
            </Field>
            <Field label="Quand ?">
              <input maxLength={40} value={when} onChange={(e) => setWhen(e.target.value)} placeholder="Vendredi soir" className={inputCls} />
            </Field>
          </div>

          <Field label="Où ?">
            <div className="flex gap-2">
              <input
                required={!coords}
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  setCoords(null);
                }}
                placeholder="Oberkampf, Paris"
                className={inputCls}
              />
              <button
                type="button"
                onClick={locate}
                className="grid shrink-0 place-items-center rounded-2xl border-2 border-plum/15 bg-paper px-4 text-plum hover:border-violet"
                aria-label="Utiliser ma position"
                title="Utiliser ma position"
              >
                {locating ? (
                  <Spinner />
                ) : (
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3.5" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {RADII.map(([v, l]) => (
                <Chip key={v} active={radius === v} onClick={() => setRadius(v)}>
                  {l}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Vos envies">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                <Chip
                  key={c}
                  active={cats.includes(c)}
                  onClick={() => setCats((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))}
                >
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
            disabled={loading || !cats.length}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-coral py-4 font-semibold text-paper shadow-[0_8px_0_-2px_#d9604b] transition hover:translate-y-0.5 hover:shadow-[0_5px_0_-2px_#d9604b] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner /> Buddy cherche les meilleures adresses…
              </>
            ) : (
              "Créer le groupe"
            )}
          </button>
          <p className="text-center text-sm text-muted">Gratuit jusqu&apos;à 4 amis. Sans compte, sans carte bancaire.</p>
        </form>
      </main>
    </div>
  );
}
