import { NextResponse } from "next/server";
import { loadGroup, loadMembers } from "@/lib/group";
import { PRICE_CENTS } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Le paiement n'est pas encore activé." }, { status: 503 });

  const g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });
  if (g.premium) return NextResponse.json({ error: "Le Pass Sortie est déjà actif." }, { status: 409 });

  const b = await req.json().catch(() => ({}));
  const members = await loadMembers(id);
  if (!members.some((m) => m.id === b.memberId))
    return NextResponse.json({ error: "Rejoins le groupe d'abord." }, { status: 403 });

  const origin = new URL(req.url).origin;
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(PRICE_CENTS),
    "line_items[0][price_data][product_data][name]": "Pass Sortie Buddly",
    "line_items[0][price_data][product_data][description]": `Débloque « ${g.name} » : classement complet, plus de lieux, jusqu'à 15 amis.`,
    client_reference_id: id,
    "metadata[groupId]": id,
    "metadata[memberId]": b.memberId,
    locale: "fr",
    success_url: `${origin}/api/groups/${id}/verify?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/g/${id}?paiement=annule`,
  });

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const s = await r.json();
  if (!r.ok) return NextResponse.json({ error: "Stripe : " + (s.error?.message ?? "erreur") }, { status: 502 });
  return NextResponse.json({ url: s.url });
}
