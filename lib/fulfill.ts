import { isEmail, loadGroup, loadMembers, normEmail, passKey, plusKey, upgrade } from "./group";
import { sendCapi } from "./capi";
import { claim, getJSON, setPermanent } from "./store";
import { PRICES } from "./types";

/** Session Stripe Checkout (champs utilisés). */
export type CheckoutSession = {
  id: string;
  payment_status?: string;
  metadata?: { tier?: string; groupId?: string; memberId?: string; source?: string; mc?: string; fbp?: string; fbc?: string; ip?: string; ua?: string };
  customer_details?: { email?: string | null } | null;
};

export async function fetchSession(id: string): Promise<CheckoutSession | null> {
  const key = process.env.STRIPE_SECRET_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!key) return null;
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  return r.ok ? ((await r.json()) as CheckoutSession) : null;
}

/**
 * Active ce qui a été payé. Appelée par le retour de Stripe ET par le webhook :
 * la première arrivée fait le travail, l'autre ne refait rien (un Pass n'est jamais compté deux fois).
 */
export async function fulfill(s: CheckoutSession): Promise<"plus" | "pass" | null> {
  if (s.payment_status !== "paid") return null;
  const tier = s.metadata?.tier === "plus" ? "plus" : "pass";
  if (!(await claim(`checkout:done:${s.id}`))) return tier; // déjà traité

  const groupId = s.metadata?.groupId;
  const emails = new Set<string>([normEmail(s.customer_details?.email)].filter(isEmail));

  if (groupId) {
    // achat depuis une sortie : on débloque la sortie (et, pour Buddly+, toutes les sorties de l'acheteur)
    const g = await loadGroup(groupId);
    if (tier === "plus") {
      const buyer = (await loadMembers(groupId)).find((m) => m.id === s.metadata?.memberId);
      const e = normEmail(buyer?.email);
      if (isEmail(e)) emails.add(e);
    }
    if (g) await upgrade(g, tier);
  } else if (tier === "pass") {
    // achat depuis la page Tarifs : un Pass à utiliser sur la prochaine sortie créée avec cet e-mail
    for (const e of emails) {
      const n = (await getJSON<number>(passKey(e))) ?? 0;
      await setPermanent(passKey(e), n + 1);
      break; // un seul Pass par paiement
    }
  }

  if (tier === "plus") for (const e of emails) await setPermanent(plusKey(e), { session: s.id, groupId: groupId ?? null, createdAt: Date.now() });

  // Meta : achat confirmé par Stripe (même identifiant que le pixel côté navigateur, donc compté une seule fois)
  const m = s.metadata ?? {};
  await sendCapi(
    "Purchase",
    s.id,
    { consent: m.mc === "1", fbp: m.fbp, fbc: m.fbc, ip: m.ip, ua: m.ua, url: "https://buddly.io" },
    { email: [...emails][0], value: PRICES[tier] / 100, currency: "EUR" },
  );
  return tier;
}
