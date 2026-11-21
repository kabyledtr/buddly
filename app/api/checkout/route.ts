import { NextResponse } from "next/server";
import { PRICES, type PaidTier } from "@/lib/types";

const PRODUCT: Record<PaidTier, { name: string; description: string }> = {
  pass: {
    name: "Pass Sortie Buddly",
    description: "Ta prochaine sortie débloquée : 15 adresses, 3 ateliers du jour, jusqu'à 4 personnes, résultats complets.",
  },
  plus: {
    name: "Buddly+ à vie",
    description: "Toutes tes sorties débloquées, à vie : 15 personnes, 40 adresses, tous les ateliers du jour, plan B de Bud, relance des retardataires.",
  },
};

/**
 * Achat depuis la page Tarifs (sans sortie en cours) : Stripe Checkout, puis l'achat est rattaché
 * à l'e-mail saisi chez Stripe. Buddly+ : toutes les sorties ; Pass : la prochaine sortie créée avec cet e-mail.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tier: PaidTier = url.searchParams.get("offre") === "pass" ? "pass" : "plus";
  const key = process.env.STRIPE_SECRET_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!key) return NextResponse.redirect(new URL(`/app?paiement=bientot&offre=${tier}`, url.origin), 303);

  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(PRICES[tier]),
    "line_items[0][price_data][product_data][name]": PRODUCT[tier].name,
    "line_items[0][price_data][product_data][description]": PRODUCT[tier].description,
    "metadata[tier]": tier,
    "metadata[source]": "tarifs",
    locale: "fr",
    success_url: `${url.origin}/api/checkout/verify?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url.origin}/#tarifs`,
  });
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const s = await r.json();
  if (!r.ok || !s.url) {
    console.error("stripe", s.error?.message);
    // raison sans aucune partie de la clé : aide à corriger la configuration
    const raison = key.startsWith("pk_") ? "cle-publique" : r.status === 401 ? "cle-refusee" : `${r.status}-${s.error?.code ?? ""}-${String(s.error?.message ?? "").replace(/(sk|rk|pk)_\w+/g, "***").slice(0, 120)}`;
    return NextResponse.redirect(new URL(`/app?paiement=erreur&raison=${encodeURIComponent(raison)}`, url.origin), 303);
  }
  return NextResponse.redirect(s.url, 303);
}
