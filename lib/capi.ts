import { createHash } from "node:crypto";

/**
 * API Conversions de Meta : le serveur prévient Meta d'une conversion (sortie créée, achat confirmé par Stripe).
 * Plus fiable que le pixel seul (iPhone, bloqueurs). Envoyé seulement si la personne a accepté le bandeau.
 * Même event_id que le pixel : Meta dédoublonne et ne compte qu'une fois.
 * Variables Vercel : META_CAPI_TOKEN (obligatoire), META_TEST_EVENT_CODE (facultatif, pour l'onglet « Évènements de test »).
 */
const PIXEL_ID = "1689785686073466";

export type CapiContext = { consent?: boolean; fbp?: string; fbc?: string; ip?: string; ua?: string; url?: string };

const sha = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export async function sendCapi(
  event: "Lead" | "Purchase",
  eventId: string,
  ctx: CapiContext,
  data: { email?: string; value?: number; currency?: string } = {},
) {
  const token = process.env.META_CAPI_TOKEN?.trim();
  if (!token || !ctx.consent) return;
  const user_data: Record<string, unknown> = {};
  if (data.email) user_data.em = [sha(data.email)];
  if (ctx.ip) user_data.client_ip_address = ctx.ip;
  if (ctx.ua) user_data.client_user_agent = ctx.ua;
  if (ctx.fbp) user_data.fbp = ctx.fbp;
  if (ctx.fbc) user_data.fbc = ctx.fbc;
  const body = {
    data: [
      {
        event_name: event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: ctx.url ?? "https://buddly.io",
        user_data,
        ...(data.value != null ? { custom_data: { value: data.value, currency: data.currency ?? "EUR" } } : {}),
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE.trim() } : {}),
  };
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) console.error("capi", r.status, (await r.text()).slice(0, 300));
  } catch (e) {
    console.error("capi", e);
  }
}

/** Contexte Meta lu dans la requête du navigateur : consentement, cookies du pixel, IP, navigateur. */
export function capiContext(req: Request): CapiContext {
  const cookies = Object.fromEntries(
    (req.headers.get("cookie") ?? "").split(/;\s*/).filter(Boolean).map((c) => {
      const i = c.indexOf("=");
      return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
    }),
  );
  return {
    consent: cookies.buddly_consent === "yes",
    fbp: cookies._fbp,
    fbc: cookies._fbc,
    ip: (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || undefined,
    ua: req.headers.get("user-agent") ?? undefined,
    url: req.headers.get("referer") ?? undefined,
  };
}
