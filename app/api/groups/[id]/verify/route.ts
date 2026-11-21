import { NextResponse } from "next/server";
import { loadGroup, saveGroup } from "@/lib/group";

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
  if (!g.premium) await saveGroup({ ...g, premium: true });
  return back("paiement=ok");
}
