import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Diagnostic de l'API Conversions : envoie un évènement de TEST (visible uniquement dans « Évènements de test »)
 * et renvoie la réponse de Meta. Le jeton n'est jamais affiché. Accepte seulement un code de test Meta (TEST + chiffres).
 */
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  if (!/^TEST\d{3,8}$/.test(code)) return NextResponse.json({ error: "code de test invalide (ex. TEST12345)" }, { status: 400 });
  const token = process.env.META_CAPI_TOKEN?.trim();
  if (!token) return NextResponse.json({ ok: false, raison: "META_CAPI_TOKEN absent (variable manquante ou pas de redéploiement)" });

  const r = await fetch(`https://graph.facebook.com/v21.0/1689785686073466/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [
        {
          event_name: "PageView",
          event_time: Math.floor(Date.now() / 1000),
          event_id: `check_${Date.now()}`,
          action_source: "website",
          event_source_url: "https://buddly.io",
          user_data: { client_user_agent: "buddly-check", client_ip_address: "0.0.0.0" },
        },
      ],
      test_event_code: code,
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!r) return NextResponse.json({ ok: false, raison: "Meta injoignable" });
  const j = await r.json().catch(() => ({}));
  return NextResponse.json({
    ok: r.ok,
    jeton_present: true,
    test_code_vercel: process.env.META_TEST_EVENT_CODE?.trim() ?? null,
    meta: r.ok ? { events_received: j.events_received } : { erreur: j.error?.message, type: j.error?.type, code: j.error?.code },
  });
}
