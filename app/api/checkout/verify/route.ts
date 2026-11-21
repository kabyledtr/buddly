import { NextResponse } from "next/server";
import { isEmail, normEmail, passKey, plusKey } from "@/lib/group";
import { getJSON, setPermanent } from "@/lib/store";

/** Retour de Stripe après un achat depuis la page Tarifs : on rattache l'achat à l'e-mail du client. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const back = (q: string) => NextResponse.redirect(new URL(`/app?${q}`, url.origin), 303);
  const key = process.env.STRIPE_SECRET_KEY;
  const id = url.searchParams.get("session_id");
  if (!key || !id) return back("paiement=erreur");

  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const s = await r.json();
  const email = normEmail(s.customer_details?.email);
  if (!r.ok || s.payment_status !== "paid" || !isEmail(email)) return back("paiement=erreur");

  // une seule prise en compte par paiement, même si la page est rechargée
  const done = `checkout:done:${s.id}`;
  if (!(await getJSON(done))) {
    if (s.metadata?.tier === "plus") await setPermanent(plusKey(email), { session: s.id, createdAt: Date.now() });
    else {
      const credits = (await getJSON<number>(passKey(email))) ?? 0;
      await setPermanent(passKey(email), credits + 1);
    }
    await setPermanent(done, true);
  }
  return back(`paiement=${s.metadata?.tier === "plus" ? "plus" : "pass"}`);
}
