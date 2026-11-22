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

const TIKTOK_ID = "DC145VBC77U6OQMIBQK0";

type Ttq = unknown[] & {
  methods: string[];
  setAndDefer: (t: Record<string, unknown>, e: string) => void;
  instance: (t: string) => unknown;
  load: (e: string, n?: { partner?: string }) => void;
  page: () => void;
  _i: Record<string, unknown[] & { _u?: string }>;
  _t: Record<string, number>;
  _o: Record<string, unknown>;
} & Record<string, unknown>;

/** Charge le pixel TikTok (code officiel, réécrit lisiblement), uniquement après accord. */
function loadTikTok() {
  const w = window as unknown as { ttq?: Ttq; TiktokAnalyticsObject?: string };
  if (w.ttq && (w.ttq as Ttq)._i) return;
  w.TiktokAnalyticsObject = "ttq";
  const ttq = (w.ttq = (w.ttq || []) as Ttq);
  ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
  ttq.setAndDefer = function (t, e) {
    t[e] = function (...args: unknown[]) {
      (t as unknown as unknown[]).push([e, ...args]);
    };
  };
  for (const m of ttq.methods) ttq.setAndDefer(ttq, m);
  ttq.instance = function (t: string) {
    const e = ttq._i[t] || [];
    for (const m of ttq.methods) ttq.setAndDefer(e as unknown as Record<string, unknown>, m);
    return e;
  };
  ttq.load = function (e: string, n?: { partner?: string }) {
    const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[e] = [] as unknown as Ttq["_i"][string];
    ttq._i[e]._u = r;
    ttq._t = ttq._t || {};
    ttq._t[e] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[e] = n || {};
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = `${r}?sdkid=${e}&lib=ttq`;
    document.head.appendChild(s);
  };
  ttq.load(TIKTOK_ID);
}

/** Bandeau de consentement (CNIL) + pixels Meta et TikTok + page vue à chaque page. */
export default function MetaPixel() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"yes" | "no" | null | undefined>(undefined);
  const last = useRef<string | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      setConsent(v === "yes" || v === "no" ? v : null);
      if (v === "yes" || v === "no") document.cookie = `buddly_consent=${v}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      setConsent(null);
    }
  }, []);

  useEffect(() => {
    if (consent !== "yes" || last.current === pathname) return;
    loadPixel();
    loadTikTok();
    last.current = pathname;
    (window as unknown as { fbq: Fbq }).fbq("track", "PageView");
    (window as unknown as { ttq: Ttq }).ttq.page();
  }, [consent, pathname]);

  function choose(v: "yes" | "no") {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    // le serveur doit aussi connaître le choix (API Conversions de Meta)
    document.cookie = `buddly_consent=${v}; path=/; max-age=31536000; samesite=lax`;
    setConsent(v);
  }

  if (consent !== null) return null;
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("capture")) return null; // capture de l'image d'aperçu
  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-[1.75rem] border border-plum/10 bg-paper p-4 shadow-[0_18px_40px_-16px_rgba(67,32,122,0.45)] sm:inset-x-auto sm:right-5 sm:bottom-5">
      <p className="text-sm text-ink">
        Bud utilise des cookies Meta et TikTok pour mesurer ses publicités. Rien n&apos;est déposé sans ton accord.{" "}
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
