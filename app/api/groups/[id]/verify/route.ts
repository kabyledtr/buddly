import { NextResponse } from "next/server";
import { fetchSession, fulfill } from "@/lib/fulfill";

/** Retour de Stripe après un achat depuis une sortie. Le webhook fait la même activation si l'onglet est fermé avant. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  const back = (q: string) => NextResponse.redirect(new URL(`/g/${id}?${q}`, url.origin));
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return back("paiement=erreur");

  const s = await fetchSession(sessionId);
  if (!s || s.metadata?.groupId !== id) return back("paiement=erreur");
  const tier = await fulfill(s);
  if (!tier) return back("paiement=erreur");
  return back(`${tier === "plus" ? "paiement=plus" : "paiement=ok"}&sid=${encodeURIComponent(s.id)}`);
}
