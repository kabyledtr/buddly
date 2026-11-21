import { NextResponse } from "next/server";
import { getJSON, setJSON } from "@/lib/store";

export const maxDuration = 30;

type Film = { title: string; times: string[] };

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

  const cacheKey = `cine:${name}:${date}`.toLowerCase();
  const cached = await getJSON<{ films: Film[] }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const day = new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const city = address.split(",").pop()?.trim() ?? "";

  let results: { title: string; url: string; content: string }[] = [];
  let answer = "";
  try {
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tavily}` },
      body: JSON.stringify({
        query: `séances films à l'affiche cinéma ${name} ${city} ${day}`,
        search_depth: "advanced",
        max_results: 6,
        include_answer: true,
        topic: "general",
      }),
      signal: AbortSignal.timeout(15000),
    });
    const j = await r.json();
    results = j.results ?? [];
    answer = j.answer ?? "";
  } catch {
    return NextResponse.json({ films: [] });
  }

  let films: Film[] = [];
  const claude = process.env.ANTHROPIC_API_KEY;
  if (claude && results.length) {
    const sources = results
      .map((x, i) => `[${i + 1}] ${x.title} (${x.url})\n${x.content.slice(0, 1500)}`)
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
N'invente rien : n'inclus que des films explicitement liés à ce cinéma dans les sources. 8 films maximum.
Réponds uniquement en JSON : [{"title": "...", "times": ["20:15"]}]. Tableau vide si les sources ne le disent pas.

${sources}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(20000),
      });
      const j = await r.json();
      const txt: string = j.content?.find((c: { type: string }) => c.type === "text")?.text ?? "[]";
      const parsed = JSON.parse(txt.slice(txt.indexOf("["), txt.lastIndexOf("]") + 1));
      if (Array.isArray(parsed))
        films = parsed
          .filter((f) => f && typeof f.title === "string")
          .slice(0, 8)
          .map((f) => ({ title: f.title.slice(0, 80), times: Array.isArray(f.times) ? f.times.slice(0, 6).map(String) : [] }));
    } catch {}
  }

  const out = { films, answer: films.length ? undefined : answer.slice(0, 400) || undefined };
  await setJSON(cacheKey, out);
  return NextResponse.json(out);
}
