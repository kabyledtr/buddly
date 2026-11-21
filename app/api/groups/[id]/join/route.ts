import { NextResponse } from "next/server";
import { addMember, loadGroup, loadMembers, maxMembers, newId } from "@/lib/group";
import type { Budget, Category, Member } from "@/lib/types";

const CATS: Category[] = ["resto", "bar", "cafe", "activite"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });

  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim().slice(0, 24);
  if (!name) return NextResponse.json({ error: "Indique ton prénom." }, { status: 400 });

  const members = await loadMembers(id);
  if (members.length >= maxMembers(g))
    return NextResponse.json(
      {
        error: g.premium
          ? "Le groupe est complet."
          : `Le groupe gratuit est limité à ${maxMembers(g)} amis. Demande à l'organisateur de débloquer le Pass Sortie.`,
      },
      { status: 403 },
    );

  const likes = (Array.isArray(b.likes) ? b.likes : []).filter((c: Category) => CATS.includes(c));
  const m: Member = {
    id: newId(12),
    name,
    budget: ([1, 2, 3].includes(Number(b.budget)) ? Number(b.budget) : 2) as Budget,
    likes: likes.length ? likes : g.categories,
    joinedAt: Date.now(),
  };
  await addMember(id, m);
  return NextResponse.json({ memberId: m.id });
}
