"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PIXEL_ID = "1689785686073466";
const KEY = "buddly:consent";

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[]; push: unknown; loaded: boolean; version: string };

/** Charge le pixel Meta (code officiel), uniquement après accord. */
function loadPixel() {
  const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq };
  if (w.fbq) return;
  const n = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  } as Fbq;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  w.fbq = n;
  w._fbq = n;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  n("init", PIXEL_ID);
}

/** Bandeau de consentement (CNIL) + pixel Meta + PageView à chaque page. */
export default function MetaPixel() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"yes" | "no" | null | undefined>(undefined);
  const last = useRef<string | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      setConsent(v === "yes" || v === "no" ? v : null);
    } catch {
      setConsent(null);
    }
  }, []);

  useEffect(() => {
    if (consent !== "yes" || last.current === pathname) return;
    loadPixel();
    last.current = pathname;
    (window as unknown as { fbq: Fbq }).fbq("track", "PageView");
  }, [consent, pathname]);

  function choose(v: "yes" | "no") {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    setConsent(v);
  }

  if (consent !== null) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-[1.75rem] border border-plum/10 bg-paper p-4 shadow-[0_18px_40px_-16px_rgba(67,32,122,0.45)] sm:inset-x-auto sm:right-5 sm:bottom-5">
      <p className="text-sm text-ink">
        Bud utilise un cookie Meta pour mesurer ses publicités. Rien n&apos;est déposé sans ton accord.{" "}
        <a href="/mentions-legales" className="text-violet underline">En savoir plus</a>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => choose("no")} className="flex-1 rounded-full border border-plum/20 py-2 text-sm font-semibold text-plum">
          Refuser
        </button>
        <button type="button" onClick={() => choose("yes")} className="flex-1 rounded-full bg-plum py-2 text-sm font-semibold text-paper">
          Accepter
        </button>
      </div>
    </div>
  );
}
