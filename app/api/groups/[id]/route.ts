import { NextResponse } from "next/server";
import { deckFor, loadGroup, loadMembers, loadVotes, maxMembers, rank } from "@/lib/group";
import { PRICE_CENTS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = new URL(req.url).searchParams.get("m") ?? "";
  const g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });

  const members = await loadMembers(id);
  const votes = await loadVotes(id, members);
  const deck = deckFor(g);
  const ranking = rank(g, members, votes);
  const isMember = members.some((m) => m.id === me);

  return NextResponse.json({
    group: {
      id: g.id,
      name: g.name,
      when: g.when,
      area: g.area,
      radius: g.radius,
      premium: g.premium,
      isCreator: g.creatorId === me,
      totalPlaces: g.places.length,
    },
    deck,
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      done: deck.filter((p) => votes[m.id]?.[p.id] !== undefined).length,
    })),
    me: isMember ? me : null,
    myVotes: isMember ? votes[me] ?? {} : {},
    // Gratuit : le meilleur lieu seulement. Pass Sortie : tout le classement.
    ranking: g.premium ? ranking : ranking.slice(0, 1),
    rankedCount: ranking.length,
    unanimousCount: ranking.filter((r) => r.unanimous).length,
    maxMembers: maxMembers(g),
    lockedPlaces: g.places.length - deck.length,
    priceCents: PRICE_CENTS,
  });
}
