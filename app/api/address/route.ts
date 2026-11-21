import { NextResponse } from "next/server";
import { autocomplete, hasGoogle, placeLocation } from "@/lib/google";

const UA = "Buddly/1.0 (https://buddly.io)";

/**
 * ?q=texte       → suggestions d'adresses
 * ?id=placeId    → coordonnées d'une suggestion Google
 * ?lat=&lon=     → adresse lisible d'une position GPS
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = u.searchParams.get("q")?.trim();
  const id = u.searchParams.get("id");
  const lat = Number(u.searchParams.get("lat")), lon = Number(u.searchParams.get("lon"));

  try {
    if (id && hasGoogle) return NextResponse.json(await placeLocation(id));

    if (q && q.length >= 3) {
      if (hasGoogle)
        return NextResponse.json({
          items: u.searchParams.has("lat") ? await autocomplete(q, lat, lon) : await autocomplete(q),
        });
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=8&addressdetails=1&countrycodes=fr,be,ch,lu&accept-language=fr`,
        { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(6000) },
      );
      const j = (await r.json()) as { name?: string; lat: string; lon: string; address?: Record<string, string> }[];
      const seen = new Set<string>();
      const items = [];
      for (const x of j) {
        const a = x.address ?? {};
        const street = [a.house_number, a.road].filter(Boolean).join(" ");
        const main = x.name && x.name !== a.road ? x.name : street || a.suburb || a.city || "";
        const secondary = [x.name && x.name !== a.road ? street : "", a.postcode, a.city || a.town || a.village].filter(Boolean).join(", ");
        const key = main + secondary;
        if (!main || seen.has(key)) continue;
        seen.add(key);
        items.push({ main, secondary, lat: +x.lat, lon: +x.lon });
      }
      return NextResponse.json({ items: items.slice(0, 5) });
    }

    if (Number.isFinite(lat) && Number.isFinite(lon) && u.searchParams.has("lat")) {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=18&accept-language=fr`,
        { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(6000) },
      );
      const j = await r.json();
      const a = j.address ?? {};
      const street = [a.house_number, a.road].filter(Boolean).join(" ");
      const city = a.city || a.town || a.village || a.suburb || "";
      return NextResponse.json({ label: [street || a.neighbourhood || a.suburb, city].filter(Boolean).join(", ") || "Ma position" });
    }
  } catch {}
  return NextResponse.json({ items: [] });
}
