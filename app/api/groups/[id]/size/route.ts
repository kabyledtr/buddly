import { NextResponse } from "next/server";
import { loadGroup, maxMembers, saveGroup } from "@/lib/group";

/** L'organisateur indique combien ils seront (dans la limite de l'offre de la sortie). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  if (b.memberId !== g.creatorId) return NextResponse.json({ error: "Seul l'organisateur peut changer ça." }, { status: 403 });
  const size = Math.round(Number(b.size));
  if (!(size >= 2)) return NextResponse.json({ error: "Nombre invalide." }, { status: 400 });
  if (size > maxMembers(g)) return NextResponse.json({ error: "Il faut une offre supérieure pour autant de monde." }, { status: 402 });
  await saveGroup({ ...g, size });
  return NextResponse.json({ ok: true, size });
}
