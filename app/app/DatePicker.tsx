"use client";

import { useEffect, useRef, useState } from "react";

export type Slot = { date: string; from: string; to: string; label: string };

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const PRESETS = [
  { name: "Déj", from: "12:00", to: "14:00" },
  { name: "Apéro", from: "18:30", to: "20:30" },
  { name: "Soirée", from: "20:00", to: "23:30" },
  { name: "Tard", from: "22:00", to: "02:00" },
];
const TIMES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hh = (t: string) => t.replace(":00", "h").replace(":", "h");

export function slotLabel(date: string, from: string, to: string) {
  const d = new Date(`${date}T12:00:00`);
  const today = iso(new Date());
  const tomorrow = iso(new Date(Date.now() + 864e5));
  const day =
    date === today
      ? "Ce soir"
      : date === tomorrow
        ? "Demain"
        : d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }).replace(/^./, (c) => c.toUpperCase());
  return `${day} · ${hh(from)} – ${hh(to)}`;
}

export default function DatePicker({ value, onChange }: { value: Slot | null; onChange: (s: Slot) => void }) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [date, setDate] = useState(value?.date ?? iso(now));
  const [from, setFrom] = useState(value?.from ?? "20:00");
  const [to, setTo] = useState(value?.to ?? "23:30");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const first = (cursor.getDay() + 6) % 7; // lundi = 0
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const todayIso = iso(now);
  const canPrev = cursor > new Date(now.getFullYear(), now.getMonth(), 1);

  function confirm() {
    onChange({ date, from, to, label: slotLabel(date, from, to) });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-paper px-4 py-3 text-left transition ${
          open ? "border-violet" : "border-plum/15 hover:border-plum/40"
        }`}
      >
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-violet" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        <span className={value ? "font-semibold text-ink" : "text-muted/70"}>{value?.label ?? "Choisir le jour et l'heure"}</span>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 rounded-3xl border border-plum/10 bg-paper p-5 shadow-[0_24px_60px_-20px_rgba(67,32,122,0.45)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="grid size-9 place-items-center rounded-full text-plum hover:bg-lilac disabled:opacity-30"
              aria-label="Mois précédent"
            >
              ‹
            </button>
            <p className="font-display text-lg font-semibold capitalize text-plum">
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </p>
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="grid size-9 place-items-center rounded-full text-plum hover:bg-lilac"
              aria-label="Mois suivant"
            >
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {DAYS.map((d, i) => (
              <span key={i} className="pb-1 text-xs font-semibold text-muted">
                {d}
              </span>
            ))}
            {Array.from({ length: first }).map((_, i) => (
              <span key={"e" + i} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const d = iso(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1));
              const past = d < todayIso;
              const sel = d === date;
              return (
                <button
                  key={d}
                  type="button"
                  disabled={past}
                  onClick={() => setDate(d)}
                  className={`aspect-square rounded-full text-sm font-semibold transition ${
                    sel
                      ? "bg-plum text-paper shadow-[0_4px_0_-1px_#2a1548]"
                      : past
                        ? "text-ink/20"
                        : d === todayIso
                          ? "text-coral ring-2 ring-coral/40 hover:bg-peach"
                          : "text-ink hover:bg-lilac"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-plum/10 pt-4">
            <p className="text-sm font-semibold text-ink">Créneau</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const active = p.from === from && p.to === to;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setFrom(p.from);
                      setTo(p.to);
                    }}
                    className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold ${
                      active ? "border-coral bg-coral text-paper" : "border-plum/15 text-ink hover:border-coral/50"
                    }`}
                  >
                    {p.name} <span className={active ? "text-paper/80" : "text-muted"}>{hh(p.from)}–{hh(p.to)}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-muted">De</span>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border-2 border-plum/15 bg-paper px-2 py-1.5 font-semibold text-ink outline-none focus:border-violet">
                {TIMES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <span className="text-muted">à</span>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border-2 border-plum/15 bg-paper px-2 py-1.5 font-semibold text-ink outline-none focus:border-violet">
                {TIMES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="button" onClick={confirm} className="mt-5 w-full rounded-full bg-plum py-3 font-semibold text-paper hover:bg-ink">
            {slotLabel(date, from, to)}
          </button>
        </div>
      )}
    </div>
  );
}
