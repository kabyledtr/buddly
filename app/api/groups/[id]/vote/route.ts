import { NextResponse } from "next/server";
import { deckFor, loadGroup, loadMembers, saveVote } from "@/lib/group";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  const g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });

  const members = await loadMembers(id);
  if (!members.some((m) => m.id === b.memberId))
    return NextResponse.json({ error: "Rejoins le groupe pour voter." }, { status: 403 });
  if (!deckFor(g).some((p) => p.id === b.placeId))
    return NextResponse.json({ error: "Lieu inconnu." }, { status: 400 });

  await saveVote(id, b.memberId, b.placeId, Boolean(b.like));
  return NextResponse.json({ ok: true });
}
