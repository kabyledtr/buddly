import { NextResponse } from "next/server";
import { getJSON, setJSON } from "@/lib/store";

export const maxDuration = 60;

type Film = { title: string; times: string[]; version?: string; genre?: string };

/**
 * Films à l'affiche dans un cinéma précis à une date donnée.
 * Recherche web en direct (Tavily), puis extraction structurée par Claude.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const name = (u.searchParams.get("name") ?? "").slice(0, 80);
  const address = (u.searchParams.get("address") ?? "").slice(0, 120);
  const date = u.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ films: [] });

  const tavily = process.env.TAVILY_API_KEY;
  if (!tavily) return NextResponse.json({ films: [], unavailable: true });

  const cacheKey = `cine2:${name}:${date}`.toLowerCase();
  const cached = await getJSON<{ films: Film[]; note?: string }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const day = new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const city = address.split(",").pop()?.trim() ?? "";

  let results: { title: string; url: string; content: string; raw_content?: string }[] = [];
  try {
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tavily}` },
      body: JSON.stringify({
        query: `${name} ${city} séances programme films ${day}`,
        search_depth: "advanced",
        max_results: 5,
        include_answer: false,
        include_raw_content: true,
        topic: "general",
      }),
      signal: AbortSignal.timeout(20000),
    });
    const j = await r.json();
    results = j.results ?? [];
  } catch {
    return NextResponse.json({ films: [] });
  }

  let films: Film[] = [];
  let note: string | undefined;
  const claude = process.env.ANTHROPIC_API_KEY;
  if (claude && results.length) {
    const sources = results
      .map((x, i) => `[${i + 1}] ${x.title} (${x.url})\n${(x.raw_content || x.content).slice(0, 6000)}`)
      .join("\n\n");
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": claude, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `Voici des résultats de recherche web sur le cinéma « ${name} »${address ? ` (${address})` : ""}.
Liste les films projetés dans CE cinéma précis le ${day}, avec leurs horaires si présents.
N'invente rien : n'inclus que des films explicitement liés à ce cinéma dans les sources. 8 films maximum, triés par heure de la première séance.
Tout doit être en français (titres français si les sources les donnent).
Réponds uniquement avec un objet JSON, sans texte autour :
{"films": [{"title": "Titre", "times": ["14:00", "20:15"], "version": "VF" ou "VOST" ou "", "genre": "Comédie" ou ""}],
 "note": "une phrase courte et sympa en français pour résumer (ex. « 3 films ce soir, dont une avant-première »), ou, s'il n'y a rien de fiable, « Le programme de ce jour n'est pas encore publié. »"}

${sources}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(20000),
      });
      const j = await r.json();
      const txt: string = j.content?.find((c: { type: string }) => c.type === "text")?.text ?? "{}";
      const parsed = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
      note = typeof parsed.note === "string" ? parsed.note.slice(0, 160) : undefined;
      if (Array.isArray(parsed.films))
        films = parsed.films
          .filter((f: Film) => f && typeof f.title === "string")
          .slice(0, 8)
          .map((f: Film) => ({
            title: f.title.slice(0, 80),
            times: Array.isArray(f.times) ? f.times.slice(0, 6).map(String) : [],
            version: typeof f.version === "string" ? f.version.slice(0, 8) : "",
            genre: typeof f.genre === "string" ? f.genre.slice(0, 24) : "",
          }));
    } catch {}
  }

  const out = { films, note: note ?? (films.length ? undefined : "Le programme de ce jour n'est pas encore publié.") };
  if (films.length) await setJSON(cacheKey, out); // on ne garde pas en cache un programme vide
  return NextResponse.json(out);
}
