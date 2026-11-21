import { NextResponse } from "next/server";
import { addMember, hasPlus, isEmail, loadGroup, loadMembers, maxMembers, newId, normEmail, upgrade } from "@/lib/group";
import { tierOf } from "@/lib/types";
import type { Budget, Category, Member } from "@/lib/types";

const CATS: Category[] = ["resto", "bar", "cafe", "activite"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });

  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim().slice(0, 24);
  if (!name) return NextResponse.json({ error: "Indique ton prénom." }, { status: 400 });
  const email = normEmail(b.email);
  if (!isEmail(email)) return NextResponse.json({ error: "Indique un e-mail valide." }, { status: 400 });

  // Un membre Buddly+ débloque la sortie qu'il rejoint.
  if (await hasPlus(email)) g = await upgrade(g, "plus");

  const members = await loadMembers(id);
  if (members.length >= maxMembers(g))
    return NextResponse.json(
      {
        error:
          tierOf(g) === "plus"
            ? "Le groupe est complet."
            : `Le groupe est limité à ${maxMembers(g)} personnes. Demande à l'organisateur de débloquer plus de places.`,
      },
      { status: 403 },
    );

  const likes = (Array.isArray(b.likes) ? b.likes : []).filter((c: Category) => CATS.includes(c));
  const m: Member = {
    id: newId(12),
    name,
    email,
    budget: ([1, 2, 3].includes(Number(b.budget)) ? Number(b.budget) : 2) as Budget,
    likes: likes.length ? likes : g.categories,
    joinedAt: Date.now(),
  };
  await addMember(id, m);
  return NextResponse.json({ memberId: m.id });
}
