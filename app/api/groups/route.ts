import { NextResponse } from "next/server";
import { addMember, hasPlus, isEmail, newId, normEmail, saveGroup, consumePassCredit } from "@/lib/group";
import { findPlaces, geocode } from "@/lib/places";
import { DIET_LABEL, type Budget, type Category, type Diet, type Group, type Member } from "@/lib/types";

export const maxDuration = 60;

const CATS: Category[] = ["resto", "bar", "cafe", "activite"];

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const name = String(b.name ?? "").trim().slice(0, 60) || "Notre sortie";
  const when = String(b.when ?? "").trim().slice(0, 40);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date ?? "") ? String(b.date) : undefined;
  const from = /^\d{2}:\d{2}$/.test(b.from ?? "") ? String(b.from) : undefined;
  const to = /^\d{2}:\d{2}$/.test(b.to ?? "") ? String(b.to) : undefined;
  const creatorName = String(b.creatorName ?? "").trim().slice(0, 24);
  const radius = Math.min(10000, Math.max(300, Number(b.radius) || 1500));
  const diets = (Array.isArray(b.diets) ? b.diets : []).filter((d: Diet) => d in DIET_LABEL) as Diet[];
  const categories = (Array.isArray(b.categories) ? b.categories : CATS).filter((c: Category) => CATS.includes(c));
  const budget = ([1, 2, 3].includes(Number(b.budget)) ? Number(b.budget) : 2) as Budget;
  const email = normEmail(b.email);
  if (!creatorName) return NextResponse.json({ error: "Indique ton prénom." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Indique un e-mail valide." }, { status: 400 });
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

  const plus = await hasPlus(email);
  const places = await findPlaces(lat, lon, radius, categories, { date, from, diets });
  if (places.length < 5)
    return NextResponse.json(
      { error: "Pas assez de lieux ouverts et bien notés ici. Augmente la distance, change l'horaire ou ajoute des envies." },
      { status: 422 },
    );

  // Pass acheté à l'avance : utilisé seulement une fois la sortie sûre d'être créée
  const pass = !plus && (await consumePassCredit(email));
  const creator: Member = { id: newId(12), name: creatorName, email, budget, likes: categories, joinedAt: Date.now() };
  const group: Group = {
    id: newId(8),
    name,
    when,
    slot: date ? { date, from, to, label: when } : undefined,
    diets,
    area,
    lat,
    lon,
    radius,
    categories,
    createdAt: Date.now(),
    creatorId: creator.id,
    premium: plus || pass,
    tier: plus ? "plus" : pass ? "pass" : "free",
    places,
  };
  await saveGroup(group);
  await addMember(group.id, creator);
  return NextResponse.json({ id: group.id, memberId: creator.id });
}
