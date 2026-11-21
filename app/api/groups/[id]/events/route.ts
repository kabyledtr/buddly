import { NextResponse } from "next/server";
import { findEvents } from "@/lib/events";
import { kEvents, loadGroup, type EventsState } from "@/lib/group";
import { getJSON, setJSON } from "@/lib/store";

export const maxDuration = 60;

/**
 * Cherche les ateliers datés du jour de la sortie et les ajoute au deck.
 * Appelé par la page de la sortie juste après sa création : ça ne ralentit pas la création elle-même.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });

  const cur = await getJSON<EventsState>(kEvents(id));
  if (cur && (cur.status === "done" || Date.now() - cur.at < 90_000))
    return NextResponse.json({ status: cur.status, count: cur.places.length });

  await setJSON(kEvents(id), { status: "pending", at: Date.now(), places: [] } satisfies EventsState);
  const places = await findEvents(g).catch((e) => {
    console.error("events", e);
    return [];
  });
  await setJSON(kEvents(id), { status: "done", at: Date.now(), places } satisfies EventsState);
  return NextResponse.json({ status: "done", count: places.length });
}
