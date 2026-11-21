import { NextResponse } from "next/server";
import { loadGroup, loadMembers } from "@/lib/group";
import { PRICES, tierOf, type PaidTier } from "@/lib/types";

const PRODUCT: Record<PaidTier, { name: string; description: (group: string) => string }> = {
  pass: {
    name: "Pass Sortie Buddly",
    description: (group) => `Débloque « ${group} » : 15 adresses, 3 ateliers du jour, jusqu'à 4 personnes, résultats complets.`,
  },
  plus: {
    name: "Buddly+ à vie",
    description: () => "Toutes tes sorties débloquées, à vie : 15 personnes, 40 adresses, résultats complets, plan B de Bud, relance des retardataires. Paiement unique.",
  },
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = process.env.STRIPE_SECRET_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!key) return NextResponse.json({ error: "Le paiement n'est pas encore activé." }, { status: 503 });

  const g = await loadGroup(id);
  if (!g) return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });

  const b = await req.json().catch(() => ({}));
  const tier: PaidTier = b.tier === "pass" ? "pass" : "plus";
  const cur = tierOf(g);
  if (cur === "plus" || (cur === "pass" && tier === "pass"))
    return NextResponse.json({ error: "Cette sortie est déjà débloquée." }, { status: 409 });

  const members = await loadMembers(id);
  const buyer = members.find((m) => m.id === b.memberId);
  if (!buyer)
    return NextResponse.json({ error: "Rejoins le groupe d'abord." }, { status: 403 });

  const origin = new URL(req.url).origin;
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(PRICES[tier]),
    // code de taxe Stripe : service fourni électroniquement (exigé quand Stripe Tax est activé)
    "line_items[0][price_data][product_data][tax_code]": "txcd_10000000",
    "line_items[0][price_data][product_data][name]": PRODUCT[tier].name,
    "line_items[0][price_data][product_data][description]": PRODUCT[tier].description(g.name),
    client_reference_id: id,
    "metadata[groupId]": id,
    "metadata[memberId]": b.memberId,
    "metadata[tier]": tier,
    locale: "fr",
    ...(buyer.email ? { customer_email: buyer.email } : {}),
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
