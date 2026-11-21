import { NextResponse } from "next/server";
import { fetchSession, fulfill } from "@/lib/fulfill";

/** Retour de Stripe après un achat depuis la page Tarifs : l'achat est rattaché à l'e-mail saisi chez Stripe. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const back = (q: string) => NextResponse.redirect(new URL(`/app?${q}`, url.origin), 303);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return back("paiement=erreur");

  const s = await fetchSession(sessionId);
  if (!s || s.metadata?.groupId) return back("paiement=erreur");
  const tier = await fulfill(s);
  if (!tier) return back("paiement=erreur");
  const res = back(`paiement=${tier}`);
  // l'e-mail du paiement est repris (et verrouillé) dans le formulaire : l'achat suit la bonne adresse
  const email = s.customer_details?.email?.trim().toLowerCase();
  if (email) res.cookies.set("buddly_buyer", email, { path: "/", maxAge: 60 * 60 * 24, sameSite: "lax", secure: true });
  return res;
}
