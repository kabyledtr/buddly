import { venueLookup } from "./google";
import type { Group, Place } from "./types";

/** Sites où sont publiés les ateliers et activités à date fixe. */
const DOMAINS = [
  "wecandoo.fr",
  "funbooker.com",
  "eventbrite.fr",
  "feverup.com",
  "billetreduc.com",
  "sortiraparis.com",
  "allevents.in",
  "airbnb.fr",
  "lafourchette.com",
  "meetup.com",
  "offi.fr",
  "quefaire.paris.fr",
];

type Raw = { title?: string; kind?: string; venue?: string; address?: string; time?: string; price?: string; url?: string };
type Hit = { title: string; url: string; content: string; raw_content?: string };

const UA = "Buddly/1.0 (https://buddly.io)";

async function cityOf(g: Group): Promise<string> {
  const area = g.area && g.area !== "Autour de moi" ? g.area : "";
  if (area) return area;
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${g.lat}&lon=${g.lon}&format=json&zoom=10&accept-language=fr`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(5000) },
    );
    const a = (await r.json()).address ?? {};
    return a.city ?? a.town ?? a.village ?? a.municipality ?? "";
  } catch {
    return "";
  }
}

async function tavily(key: string, query: string, domains?: string[]): Promise<Hit[]> {
  try {
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        query,
        search_depth: "advanced",
        max_results: 6,
        include_raw_content: true,
        topic: "general",
        ...(domains ? { include_domains: domains } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
    return (await r.json()).results ?? [];
  } catch {
    return [];
  }
}

/**
 * Ateliers et activités datés publiés sur le web (poterie, cuisine, dégustation…) pour le jour de la sortie.
 * Tavily cherche, Claude extrait, puis Google Places retrouve le vrai lieu (photos, note, distance).
 * On ne garde que ce qui a un lieu réel retrouvé : rien n'est inventé.
 */
export async function findEvents(g: Group, max = 8): Promise<Place[]> {
  const tk = process.env.TAVILY_API_KEY, ck = process.env.ANTHROPIC_API_KEY;
  const date = g.slot?.date;
  if (!tk || !ck || !date || !g.categories.includes("activite")) return [];

  const city = await cityOf(g);
  if (!city) return [];
  const day = new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const slot = g.slot?.from ? ` entre ${g.slot.from} et ${g.slot.to ?? "23:59"}` : "";

  const [a, b] = await Promise.all([
    tavily(tk, `ateliers activités à faire à ${city} le ${day}`, DOMAINS),
    tavily(tk, `atelier poterie cuisine dégustation cours ${city} ${day} réserver`),
  ]);
  const seenUrl = new Set<string>();
  const hits = [...a, ...b].filter((h) => h.url && !seenUrl.has(h.url) && seenUrl.add(h.url)).slice(0, 9);
  if (!hits.length) return [];

  const sources = hits.map((x, i) => `[${i + 1}] ${x.title} (${x.url})\n${(x.raw_content || x.content).slice(0, 4000)}`).join("\n\n");
  let raw: Raw[] = [];
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ck, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `Voici des pages web sur des ateliers et activités à ${city}.
Liste les ateliers, cours et activités de groupe (poterie, céramique, cuisine, pâtisserie, dégustation, peinture, bougies, parfum, cocktails, danse, impro, etc.) qu'on peut faire à ${city} le ${day}${slot}.
Règles :
- N'invente rien. Chaque activité doit venir explicitement des sources, avec le lien de la page où la réserver.
- Garde seulement ce qui a lieu ou se réserve ce jour-là (séance datée, ou atelier proposé ce jour de la semaine). Ignore les concerts, salons, expositions et activités en ligne.
- Il faut le nom du lieu (atelier, boutique, restaurant…) et si possible son adresse, pour qu'on le retrouve sur une carte.
- ${max} activités maximum, variées. Titres courts et en français.
Réponds uniquement avec un objet JSON, sans texte autour :
{"events": [{"title": "Atelier tournage poterie", "kind": "Atelier poterie", "venue": "Nom du lieu", "address": "12 rue X, ${city}", "time": "15:00" ou "", "price": "45 €" ou "", "url": "https://..."}]}

${sources}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(35000),
    });
    const j = await r.json();
    const txt: string = j.content?.find((c: { type: string }) => c.type === "text")?.text ?? "{}";
    if (!j.content) console.error("events anthropic", r.status, j.error?.message);
    const parsed = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
    raw = Array.isArray(parsed.events) ? parsed.events : [];
  } catch (e) {
    console.error("events", e);
    return [];
  }

  const valid = raw
    .filter((e) => typeof e.title === "string" && typeof e.venue === "string" && /^https?:\/\//.test(e.url ?? ""))
    .slice(0, max);
  const found = await Promise.all(
    valid.map(async (e) => {
      const venue = await venueLookup(`${e.venue} ${e.address ?? city}`, g.lat, g.lon, g.radius).catch(() => null);
      if (!venue || venue.distance > Math.max(g.radius * 2.5, 4000)) return null;
      const time = /^\d{1,2}:\d{2}$/.test(e.time ?? "") ? e.time : undefined;
      const host = new URL(e.url!).hostname.replace(/^www\./, "");
      const p: Place = {
        ...venue,
        id: "E" + venue.id + ":" + (time ?? "") + ":" + e.title!.slice(0, 20),
        name: e.title!.slice(0, 60),
        kind: `${(e.kind || "Atelier").slice(0, 30)} · ${venue.name}`.slice(0, 70),
        openLabel: time ? `Le ${new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long" })} à ${time.replace(":", "h")}` : undefined,
        priceRange: typeof e.price === "string" && e.price ? e.price.slice(0, 20) : venue.priceRange,
        event: { title: e.title!.slice(0, 80), time, price: e.price?.slice(0, 20) || undefined, url: e.url!, source: host },
      };
      return p;
    }),
  );
  const seen = new Set<string>();
  return found.filter((p): p is Place => Boolean(p) && !seen.has(p!.id) && Boolean(seen.add(p!.id)));
}
