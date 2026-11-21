import { NextResponse } from "next/server";
import { hasGoogle, photoUri } from "@/lib/google";

/** Proxy des photos Google : la clé reste côté serveur, la redirection est mise en cache par le CDN. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const name = u.searchParams.get("n") ?? "";
  const w = Math.min(4800, Math.max(200, Number(u.searchParams.get("w")) || 1600));
  if (!hasGoogle || !/^places\/[\w-]+\/photos\/[\w-]+$/.test(name)) return new NextResponse(null, { status: 404 });
  const uri = await photoUri(name, w);
  if (!uri) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(uri, {
    status: 302,
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
  });
}
