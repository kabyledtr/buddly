import { NextResponse } from "next/server";
import { loadGroup, loadMembers, loadVotes, rank } from "@/lib/group";
import { getJSON, setJSON } from "@/lib/store";
import { CATEGORY_LABEL } from "@/lib/types";

export const maxDuration = 30;

const EUROS = ["", "petit budget", "budget moyen", "budget large"];

/** « Le mot de Buddly » : l'IA explique quel lieu choisir et pourquoi, à partir des votes et préférences. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });

  const members = await loadMembers(id);
  const votes = await loadVotes(id, members);
  const top = rank(g, members, votes).slice(0, 5);
  if (!top.length) return NextResponse.json({ text: null });

  const signature = JSON.stringify(top.map((r) => [r.place.id, r.likes, r.nopes])) + members.length;
  const cacheKey = `g:${id}:ai`;
  const cached = await getJSON<{ sig: string; text: string }>(cacheKey);
  if (cached?.sig === signature) return NextResponse.json({ text: cached.text });

  const best = top[0];
  const fallback = best.unanimous
    ? `Tout le monde a dit oui à ${best.place.name} : c'est le choix évident pour ${g.when ? g.when.charAt(0).toLowerCase() + g.when.slice(1) : "votre sortie"} !`
    : `${best.place.name} plaît à ${best.likes} personne${best.likes > 1 ? "s" : ""} sur ${members.length} : c'est le meilleur compromis pour l'instant.`;

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ text: fallback });

  const prompt = `Tu es Buddly, la mascotte enjouée de l'app du même nom qui aide un groupe d'amis à choisir où sortir.
Sortie : « ${g.name} »${g.when ? `, ${g.when}` : ""}, quartier : ${g.area}.
Membres et préférences :
${members.map((m) => `- ${m.name} : ${EUROS[m.budget]}, aime ${m.likes.map((c) => CATEGORY_LABEL[c]).join(", ")}`).join("\n")}
Lieux les mieux classés après les votes (oui / non sur ${members.length} membres) :
${top.map((r, i) => `${i + 1}. ${r.place.name} (${r.place.kind}, ${"€".repeat(r.place.price)}, ${r.place.distance} m) : ${r.likes} oui (${r.likedBy.join(", ") || "personne"}), ${r.nopes} non`).join("\n")}

Recommande UN lieu en 2 phrases maximum, en français, en tutoyant le groupe. Explique pourquoi en citant les envies ou le budget de membres précis. Ton chaleureux, pas d'emoji, pas de markdown.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(25000),
    });
    const j = await r.json();
    const text: string | undefined = j.content?.find((c: { type: string }) => c.type === "text")?.text?.trim();
    if (!text) {
      console.error("anthropic", r.status, j.error?.message);
      return NextResponse.json({ text: fallback, ai: false, reason: j.error?.type ?? `${r.status} ${j.stop_reason} ${(j.content ?? []).map((c: { type: string }) => c.type).join(",")}` });
    }
    await setJSON(cacheKey, { sig: signature, text });
    return NextResponse.json({ text, ai: true });
  } catch {
    return NextResponse.json({ text: fallback });
  }
}
