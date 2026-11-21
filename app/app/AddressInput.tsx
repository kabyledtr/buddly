"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Spinner, inputCls } from "../AppShell";

type Item = { id?: string; main: string; secondary: string; lat?: number; lon?: number };
export type Spot = { lat: number; lon: number; label: string };

export default function AddressInput({ value, onChange }: { value: Spot | null; onChange: (s: Spot | null) => void }) {
  const [q, setQ] = useState(value?.label ?? "");
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState("");
  const skip = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; width: number; max: number } | null>(null);
  const bias = useRef<{ lat: number; lon: number } | null>(null);

  // si la position est déjà autorisée, on s'en sert pour classer les suggestions autour de l'utilisateur
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((st) => {
        if (st.state !== "granted") return;
        navigator.geolocation.getCurrentPosition(
          (p) => (bias.current = { lat: p.coords.latitude, lon: p.coords.longitude }),
          () => {},
          { maximumAge: 600000, timeout: 5000 },
        );
      })
      .catch(() => {});
  }, []);

  // la liste est rendue au premier plan (portail) et placée sous le champ, ou au-dessus s'il manque de place
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = field.current?.getBoundingClientRect();
      if (!r) return;
      const below = innerHeight - r.bottom - 12;
      const above = r.top - 12;
      if (below >= 200 || below >= above) setPos({ top: r.bottom + 6, left: r.left, width: r.width, max: Math.max(140, below) });
      else setPos({ bottom: innerHeight - r.top + 6, left: r.left, width: r.width, max: Math.max(140, above) });
    };
    place();
    addEventListener("resize", place);
    addEventListener("scroll", place, true);
    return () => {
      removeEventListener("resize", place);
      removeEventListener("scroll", place, true);
    };
  }, [open, items.length]);

  useEffect(() => {
    if (skip.current) return void (skip.current = false);
    if (q.trim().length < 3) return setItems([]);
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const b = bias.current;
        const r = await fetch(`/api/address?q=${encodeURIComponent(q)}${b ? `&lat=${b.lat}&lon=${b.lon}` : ""}`);
        const j = await r.json();
        setItems(j.items ?? []);
        setOpen(true);
      } catch {}
      setBusy(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) =>
      !box.current?.contains(e.target as Node) && !list.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function pick(it: Item) {
    setOpen(false);
    skip.current = true;
    const label = [it.main, it.secondary].filter(Boolean).join(", ");
    setQ(label);
    if (it.lat != null && it.lon != null) return onChange({ lat: it.lat, lon: it.lon, label });
    const r = await fetch(`/api/address?id=${encodeURIComponent(it.id!)}`);
    const j = await r.json();
    if (j?.lat) onChange({ lat: j.lat, lon: j.lon, label });
    else setErr("Adresse introuvable, essaie une autre suggestion.");
  }

  function locate() {
    if (!navigator.geolocation) return setErr("La géolocalisation n'est pas disponible.");
    setLocating(true);
    setErr("");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const { latitude: lat, longitude: lon } = p.coords;
        bias.current = { lat, lon };
        let label = "Ma position";
        try {
          const r = await fetch(`/api/address?lat=${lat}&lon=${lon}`);
          label = (await r.json()).label ?? label;
        } catch {}
        skip.current = true;
        setQ(label);
        onChange({ lat, lon, label });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setErr("Position refusée : tape plutôt une adresse.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div ref={box} className="relative">
      <div className="flex gap-2">
        <div ref={field} className="relative flex-1">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              onChange(null);
              setErr("");
            }}
            onFocus={() => items.length && setOpen(true)}
            placeholder="Adresse, gare, quartier…"
            className={`${inputCls} pr-10`}
            autoComplete="off"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {busy ? (
              <Spinner className="size-4 text-violet" />
            ) : value ? (
              <span className="grid size-6 place-items-center rounded-full bg-[#3fb950] text-xs font-bold text-paper" title="Adresse localisée">✓</span>
            ) : null}
          </span>
        </div>
        <button
          type="button"
          onClick={locate}
          className="flex shrink-0 items-center gap-2 rounded-full bg-lilac px-4 text-sm font-semibold text-plum transition hover:bg-[#e2d3fc]"
          aria-label="Utiliser ma position"
        >
          {locating ? (
            <Spinner className="size-4" />
          ) : (
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
              <path d="M20.6 3.4a1 1 0 0 0-1.06-.23l-16 6a1 1 0 0 0 .05 1.89l6.62 2.07 2.07 6.62a1 1 0 0 0 .93.7h.02a1 1 0 0 0 .93-.65l6-16a1 1 0 0 0-.23-1.06z" />
            </svg>
          )}
          <span className="hidden sm:inline">Ma position</span>
        </button>
      </div>

      {open &&
        items.length > 0 &&
        pos &&
        createPortal(
          <ul
            ref={list}
            style={{ top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width, maxHeight: pos.max }}
            className="fixed z-[90] overflow-y-auto rounded-[1.5rem] border border-plum/10 bg-paper py-1.5 shadow-[0_24px_60px_-18px_rgba(67,32,122,0.5)]"
          >
            {items.map((it, i) => (
              <li key={i}>
                <button type="button" onClick={() => pick(it)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-lilac/60">
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-coral" fill="currentColor" aria-hidden>
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[15px] font-semibold text-ink">{it.main}</span>
                    {it.secondary && <span className="block truncate text-xs text-muted">{it.secondary}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
      {err && <p className="mt-2 text-sm text-[#a2402f]">{err}</p>}
    </div>
  );
}
