import { NextResponse } from "next/server";
import { deckFor, loadGroup, loadMembers, loadVotes } from "@/lib/group";
import { groupPath, SITE_URL } from "@/lib/slug";
import { getJSON, setJSON } from "@/lib/store";
import { tierOf } from "@/lib/types";

const COOLDOWN = 30 * 60 * 1000; // une relance par ami toutes les 30 minutes

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Buddly+ : Bud relance par e-mail les amis qui n'ont pas fini de swiper. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });
  if (tierOf(g) !== "plus") return NextResponse.json({ error: "La relance fait partie de Buddly+." }, { status: 402 });

  const b = await req.json().catch(() => ({}));
  const members = await loadMembers(id);
  const me = members.find((m) => m.id === b.memberId);
  if (!me) return NextResponse.json({ error: "Rejoins le groupe d'abord." }, { status: 403 });

  const votes = await loadVotes(id, members);
  const deck = deckFor(g);
  const late = members.filter((m) => m.id !== me.id && deck.some((p) => votes[m.id]?.[p.id] === undefined));
  if (!late.length) return NextResponse.json({ sent: [], skipped: [], message: "Tout le monde a fini de swiper." });

  const key = process.env.RESEND_API_KEY;
  const url = SITE_URL + groupPath(g.id, g.name);
  const sent: string[] = [];
  const skipped: string[] = [];

  for (const m of late) {
    const stamp = `g:${id}:remind:${m.id}`;
    const last = await getJSON<number>(stamp);
    if (!key || !m.email || (last && Date.now() - last < COOLDOWN)) {
      skipped.push(m.name);
      continue;
    }
    const left = deck.filter((p) => votes[m.id]?.[p.id] === undefined).length;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Bud de Buddly <bud@buddly.io>",
        to: [m.email],
        subject: `${m.name}, il ne manque plus que toi pour « ${g.name} »`,
        text: `Salut ${m.name} !\n\n${me.name} et la bande attendent ton avis pour « ${g.name} »${g.when ? ` (${g.when})` : ""}. Il te reste ${left} adresse${left > 1 ? "s" : ""} à swiper, ça prend 1 minute :\n${url}\n\nBud, de Buddly`,
        html: `<div style="font-family:Arial,sans-serif;font-size:16px;color:#2a1650;line-height:1.5">
<p>Salut ${esc(m.name)} !</p>
<p>${esc(me.name)} et la bande attendent ton avis pour <b>« ${esc(g.name)} »</b>${g.when ? ` (${esc(g.when)})` : ""}. Il te reste ${left} adresse${left > 1 ? "s" : ""} à swiper, ça prend 1 minute.</p>
<p><a href="${url}" style="display:inline-block;background:#f7806a;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Je swipe</a></p>
<p style="color:#7a6a96;font-size:13px">Bud, de Buddly. Tu reçois ce message parce que tu as rejoint cette sortie sur buddly.io.</p>
</div>`,
      }),
    }).catch(() => null);
    if (r?.ok) {
      sent.push(m.name);
      await setJSON(stamp, Date.now());
    } else {
      console.error("resend", r?.status, await r?.text().catch(() => ""));
      skipped.push(m.name);
    }
  }

  return NextResponse.json({ sent, skipped });
}
