import { NextResponse } from "next/server";
import { addMember, newId, saveGroup } from "@/lib/group";
import { findPlaces, geocode } from "@/lib/places";
import type { Budget, Category, Group, Member } from "@/lib/types";

export const maxDuration = 60;

const CATS: Category[] = ["resto", "bar", "cafe", "activite"];

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const name = String(b.name ?? "").trim().slice(0, 60) || "Notre sortie";
  const when = String(b.when ?? "").trim().slice(0, 40);
  const creatorName = String(b.creatorName ?? "").trim().slice(0, 24);
  const radius = Math.min(5000, Math.max(300, Number(b.radius) || 1500));
  const categories = (Array.isArray(b.categories) ? b.categories : CATS).filter((c: Category) => CATS.includes(c));
  const budget = ([1, 2, 3].includes(Number(b.budget)) ? Number(b.budget) : 2) as Budget;
  if (!creatorName) return NextResponse.json({ error: "Indique ton prénom." }, { status: 400 });
  if (!categories.length) return NextResponse.json({ error: "Choisis au moins un type de sortie." }, { status: 400 });

  let lat = Number(b.lat), lon = Number(b.lon);
  let area = String(b.area ?? "").trim().slice(0, 80);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    if (!area) return NextResponse.json({ error: "Indique un quartier ou une ville." }, { status: 400 });
    const geo = await geocode(area);
    if (!geo) return NextResponse.json({ error: "Adresse introuvable. Essaie « quartier, ville »." }, { status: 404 });
    lat = geo.lat;
    lon = geo.lon;
  } else if (!area) {
    area = "Autour de moi";
  }

  const places = await findPlaces(lat, lon, radius, categories);
  if (places.length < 5)
    return NextResponse.json(
      { error: "Pas assez de lieux trouvés ici. Augmente la distance ou ajoute des types de sortie." },
      { status: 422 },
    );

  const creator: Member = { id: newId(12), name: creatorName, budget, likes: categories, joinedAt: Date.now() };
  const group: Group = {
    id: newId(8),
    name,
    when,
    area,
    lat,
    lon,
    radius,
    categories,
    createdAt: Date.now(),
    creatorId: creator.id,
    premium: false,
    places,
  };
  await saveGroup(group);
  await addMember(group.id, creator);
  return NextResponse.json({ id: group.id, memberId: creator.id });
}
