import { NextResponse } from "next/server";
import { deckFor, hasPlus, loadGroup, loadMembers, loadVotes, maxMembers, rank, upgrade } from "@/lib/group";
import { PRICES, PLUS_SPLIT, TIERS, tierOf } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = new URL(req.url).searchParams.get("m") ?? "";
  let g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });

  const members = await loadMembers(id);
  // Buddly+ acheté après la création de la sortie (ex. depuis la page Tarifs) : la sortie se débloque toute seule
  if (tierOf(g) !== "plus") {
    const plus = await Promise.all(members.map((m) => (m.email ? hasPlus(m.email) : false)));
    if (plus.some(Boolean)) g = await upgrade(g, "plus");
  }
  const votes = await loadVotes(id, members);
  const deck = deckFor(g);
  const ranking = rank(g, members, votes);
  const isMember = members.some((m) => m.id === me);
  const tier = tierOf(g);

  return NextResponse.json({
    group: {
      id: g.id,
      name: g.name,
      when: g.when,
      slot: g.slot,
      area: g.area,
      radius: g.radius,
      premium: tier !== "free",
      tier,
      size: g.size ?? null,
      categories: g.categories,
      isCreator: g.creatorId === me,
      totalPlaces: g.places.length,
      eventsStatus: g.eventsStatus ?? null,
      wantsEvents: Boolean(g.slot?.date && g.categories.includes("activite")),
    },
    deck,
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      done: deck.filter((p) => votes[m.id]?.[p.id] !== undefined).length,
    })),
    me: isMember ? me : null,
    myVotes: isMember ? votes[me] ?? {} : {},
    // Gratuit : le meilleur lieu seulement. Pass Sortie et Buddly+ : tout le classement.
    ranking: TIERS[tier].fullRanking ? ranking : ranking.slice(0, 1),
    rankedCount: ranking.length,
    unanimousCount: ranking.filter((r) => r.unanimous).length,
    maxMembers: maxMembers(g),
    lockedPlaces: g.places.length - deck.length,
    prices: PRICES,
    tiers: TIERS,
    plusSplit: PLUS_SPLIT,
  });
}
