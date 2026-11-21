"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
      ? "Aujourd'hui"
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
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [open]);

  const first = (cursor.getDay() + 6) % 7; // lundi = 0
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const todayIso = iso(now);
  const canPrev = cursor > new Date(now.getFullYear(), now.getMonth(), 1);

  function confirm() {
    onChange({ date, from, to, label: slotLabel(date, from, to) });
    setOpen(false);
  }

  const sheet = (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Choisir le jour et le créneau">
      <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="dp-backdrop absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
      <div className="dp-sheet relative w-full max-w-sm rounded-t-[2.25rem] bg-paper px-5 pb-6 pt-3 shadow-2xl sm:rounded-[2.25rem] sm:pt-5">
        <span className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-ink/10 sm:hidden" />

        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="grid size-9 place-items-center rounded-full text-lg text-plum hover:bg-lilac disabled:opacity-25"
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
            className="grid size-9 place-items-center rounded-full text-lg text-plum hover:bg-lilac"
            aria-label="Mois suivant"
          >
            ›
          </button>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
          {DAYS.map((d, i) => (
            <span key={i} className="text-[11px] font-semibold text-muted">
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
                className={`mx-auto grid size-9 place-items-center rounded-full text-sm font-semibold transition ${
                  sel ? "bg-plum text-paper" : past ? "text-ink/20" : d === todayIso ? "text-coral ring-2 ring-coral/40" : "text-ink hover:bg-lilac"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = !custom && p.from === from && p.to === to;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setCustom(false);
                  setFrom(p.from);
                  setTo(p.to);
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${active ? "bg-coral text-paper" : "bg-lilac/70 text-plum hover:bg-lilac"}`}
              >
                {p.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setCustom(true)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${custom ? "bg-coral text-paper" : "bg-lilac/70 text-plum hover:bg-lilac"}`}
          >
            Autre
          </button>
        </div>
        {custom && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-full border-2 border-plum/15 bg-paper px-3 py-1.5 font-semibold outline-none focus:border-violet">
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <span className="text-muted">→</span>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-full border-2 border-plum/15 bg-paper px-3 py-1.5 font-semibold outline-none focus:border-violet">
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        <button type="button" onClick={confirm} className="mt-5 w-full rounded-full bg-plum py-3.5 font-semibold text-paper hover:bg-ink">
          {slotLabel(date, from, to)}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-full border-2 border-plum/15 bg-paper px-5 py-3 text-left transition hover:border-plum/40"
      >
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-violet" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        <span className={value ? "font-semibold text-ink" : "text-muted/70"}>{value?.label ?? "Choisir le jour et l'heure"}</span>
      </button>
      {open && createPortal(sheet, document.body)}
    </>
  );
}
