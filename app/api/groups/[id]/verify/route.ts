import { NextResponse } from "next/server";
import { isEmail, loadGroup, loadMembers, normEmail, plusKey, upgrade } from "@/lib/group";
import { setPermanent } from "@/lib/store";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const back = (q: string) => NextResponse.redirect(new URL(`/g/${id}?${q}`, url.origin));

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !sessionId) return back("paiement=erreur");

  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const s = await r.json();
  if (!r.ok || s.payment_status !== "paid" || s.metadata?.groupId !== id) return back("paiement=erreur");

  const g = await loadGroup(id);
  if (!g) return back("paiement=erreur");

  if (s.metadata?.tier !== "plus") {
    await upgrade(g, "pass");
    return back("paiement=ok");
  }

  // Buddly+ à vie : rattaché à l'e-mail du membre (et à celui saisi chez Stripe s'il diffère).
  const members = await loadMembers(id);
  const buyer = members.find((m) => m.id === s.metadata?.memberId);
  const emails = new Set([normEmail(buyer?.email), normEmail(s.customer_details?.email)].filter(isEmail));
  for (const e of emails) await setPermanent(plusKey(e), { session: s.id, groupId: id, createdAt: Date.now() });
  await upgrade(g, "plus");
  return back("paiement=plus");
}
