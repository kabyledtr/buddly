import { NextResponse } from "next/server";
import { hasGoogle, photoUri } from "@/lib/google";
import { getJSON, setCache } from "@/lib/store";

/**
 * Proxy des photos Google : la clé reste côté serveur. L'image elle-même est renvoyée et gardée
 * en cache par le CDN de Vercel (30 jours) : affichage immédiat et un seul appel Google par photo.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const name = u.searchParams.get("n") ?? "";
  const w = Math.min(4800, Math.max(200, Number(u.searchParams.get("w")) || 1080));
  if (!hasGoogle || !/^places\/[\w-]+\/photos\/[\w-]+$/.test(name)) return new NextResponse(null, { status: 404 });

  // l'adresse finale de la photo est gardée 12 h : une région du CDN qui n'a pas l'image ne rappelle pas Google
  const key = `ph1:${name}:${w}`;
  let uri = await getJSON<string>(key).catch(() => null);
  if (!uri) {
    uri = await photoUri(name, w);
    if (!uri) return new NextResponse(null, { status: 404 });
    await setCache(key, uri, 60 * 60 * 12).catch(() => {});
  }

  const img = await fetch(uri, { signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!img?.ok || !img.body) return NextResponse.redirect(uri, 302);
  return new NextResponse(img.body, {
    headers: {
      "Content-Type": img.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400, immutable",
    },
  });
}
