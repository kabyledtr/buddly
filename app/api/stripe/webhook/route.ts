import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { fulfill, type CheckoutSession } from "@/lib/fulfill";

export const runtime = "nodejs";

/** Vérifie l'en-tête Stripe-Signature (t=…,v1=…) : HMAC-SHA256 de « t.corps » avec le secret du webhook. */
function verify(body: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false; // rejoue d'un vieil événement refusé
  const expected = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  const sigs = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  return sigs.some((sig) => sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected)));
}

/**
 * Stripe prévient Buddly à chaque paiement réussi, même si l'acheteur ferme l'onglet avant de revenir.
 * Événements à cocher dans Stripe : checkout.session.completed et checkout.session.async_payment_succeeded.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "webhook non configuré" }, { status: 503 });

  const body = await req.text();
  if (!verify(body, req.headers.get("stripe-signature"), secret))
    return NextResponse.json({ error: "signature invalide" }, { status: 400 });

  const event = JSON.parse(body) as { type: string; data: { object: CheckoutSession } };
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await fulfill(event.data.object);
  }
  return NextResponse.json({ received: true });
}
