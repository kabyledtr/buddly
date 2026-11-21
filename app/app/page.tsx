"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader, BudgetPicker, Chip, Field, Spinner, inputCls, memberKey } from "../AppShell";
import AddressInput, { type Spot } from "./AddressInput";
import DatePicker, { type Slot } from "./DatePicker";
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
  const [slot, setSlot] = useState<Slot | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [radius, setRadius] = useState(1000);
  const [cats, setCats] = useState<Category[]>(["resto", "bar"]);
  const [budget, setBudget] = useState<Budget>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!slot) return setError("Choisis le jour et l'heure de la sortie.");
    if (!spot) return setError("Choisis une adresse dans la liste ou utilise ta position.");
    setLoading(true);
    try {
      const r = await fetch("/api/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          creatorName,
          name,
          when: slot.label,
          date: slot.date,
          from: slot.from,
          to: slot.to,
          area: spot.label,
          lat: spot.lat,
          lon: spot.lon,
          radius,
          categories: cats,
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

  return (
    <div className="min-h-svh bg-gradient-to-b from-[#fdf7fb] to-[#f3eafd]">
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 pb-16">
        <div className="flex items-center gap-4">
          <Image src="/pet.png" alt="" width={64} height={64} className="size-14 rounded-2xl" />
          <div>
            <h1 className="font-display text-3xl font-bold text-plum">Nouvelle sortie</h1>
            <p className="text-muted">Buddly trouve les adresses, vous swipez.</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-7">
          <Field label="Ton prénom">
            <input required maxLength={24} value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="Léa" className={inputCls} />
          </Field>

          <Field label="La sortie">
            <input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Dîner entre potes" className={inputCls} />
          </Field>

          <Field label="Quand ?">
            <DatePicker value={slot} onChange={setSlot} />
          </Field>

          <Field label="Où ?">
            <AddressInput value={spot} onChange={setSpot} />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-sm text-muted">Dans un rayon de</span>
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
            <BudgetPicker value={budget} onChange={setBudget} />
          </Field>

          {error && <p className="rounded-2xl bg-peach px-4 py-3 text-sm font-medium text-[#a2402f]">{error}</p>}

          <button
            disabled={loading || !cats.length}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-coral py-4 font-semibold text-paper shadow-[0_8px_0_-2px_#d9604b] transition hover:translate-y-0.5 hover:shadow-[0_5px_0_-2px_#d9604b] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner /> Buddly cherche les meilleures adresses…
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
