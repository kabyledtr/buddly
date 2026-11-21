import type { Budget, Category, Place } from "./types";

/** Google Places API (New) : photos, notes, avis, horaires. Clé : GOOGLE_MAPS_API_KEY. */
const KEY = process.env.GOOGLE_MAPS_API_KEY;
export const hasGoogle = Boolean(KEY);

const FIELDS = [
  "id", "displayName", "formattedAddress", "shortFormattedAddress", "location", "types", "primaryType",
  "primaryTypeDisplayName", "rating", "userRatingCount", "priceLevel", "priceRange", "businessStatus",
  "regularOpeningHours", "photos", "googleMapsUri", "websiteUri", "reviews", "editorialSummary",
].map((f) => "places." + f).join(",");

type GPlace = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  priceRange?: { startPrice?: { units?: string }; endPrice?: { units?: string } };
  businessStatus?: string;
  regularOpeningHours?: { periods?: Period[] };
  photos?: { name: string }[];
  googleMapsUri?: string;
  websiteUri?: string;
  reviews?: { rating?: number; text?: { text: string }; authorAttribution?: { displayName?: string } }[];
  editorialSummary?: { text: string };
};
type Period = { open: { day: number; hour: number; minute: number }; close?: { day: number; hour: number; minute: number } };

async function call(path: string, body: unknown): Promise<GPlace[]> {
  const r = await fetch(`https://places.googleapis.com/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY!, "X-Goog-FieldMask": FIELDS },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`google ${r.status} ${await r.text()}`);
  return (await r.json()).places ?? [];
}

const circle = (lat: number, lon: number, radius: number) => ({
  circle: { center: { latitude: lat, longitude: lon }, radius },
});

const nearby = (types: string[], lat: number, lon: number, radius: number) =>
  call("places:searchNearby", {
    includedTypes: types,
    maxResultCount: 20,
    rankPreference: "POPULARITY",
    languageCode: "fr",
    regionCode: "FR",
    locationRestriction: circle(lat, lon, radius),
  }).catch(() => [] as GPlace[]);

const text = (q: string, lat: number, lon: number, radius: number) =>
  call("places:searchText", {
    textQuery: q,
    maxResultCount: 10,
    languageCode: "fr",
    regionCode: "FR",
    locationBias: circle(lat, lon, radius),
  }).catch(() => [] as GPlace[]);

// Activités originales cherchées en plus des catégories classiques
const SPECIAL_QUERIES = ["escape game", "karaoké", "laser game", "bar à jeux de société", "réalité virtuelle", "atelier créatif"];

/* ---------- horaires ---------- */

const WEEK = 7 * 1440;

/** Le lieu est-il ouvert pendant au moins 1 h à partir de l'heure choisie ? Renvoie l'heure de fermeture. */
function openAt(periods: Period[] | undefined, date: string, from: string): { open: boolean; closeLabel?: string } {
  if (!periods?.length) return { open: true };
  const d = new Date(`${date}T12:00:00`);
  const [h, m] = from.split(":").map(Number);
  const t = d.getDay() * 1440 + h * 60 + m;
  for (const p of periods) {
    if (!p.close) return { open: true, closeLabel: "Ouvert 24h/24" };
    const o = p.open.day * 1440 + p.open.hour * 60 + p.open.minute;
    let c = p.close.day * 1440 + p.close.hour * 60 + p.close.minute;
    if (c <= o) c += WEEK;
    for (const tt of [t, t + WEEK]) {
      if (tt >= o && tt + 60 <= c) {
        const ch = p.close.hour, cm = p.close.minute;
        return { open: true, closeLabel: `Ouvert jusqu'à ${ch}h${cm ? String(cm).padStart(2, "0") : ""}` };
      }
    }
  }
  return { open: false };
}

/* ---------- normalisation ---------- */

const CINEMA = ["movie_theater"];
const ACTIVITY_TYPES = ["movie_theater", "bowling_alley", "museum", "art_gallery", "amusement_center", "night_club"];

function categoryOf(g: GPlace): Category | null {
  const t = g.types ?? [];
  if (t.includes("cafe") || t.includes("coffee_shop") || t.includes("bakery")) return "cafe";
  if (t.includes("bar") || t.includes("pub") || t.includes("wine_bar")) return "bar";
  if (t.includes("restaurant") || t.some((x) => x.endsWith("_restaurant")) || t.includes("meal_takeaway")) return "resto";
  return "activite";
}

const PRICE: Record<string, Budget> = {
  PRICE_LEVEL_FREE: 1,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 3,
};

function distance(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371000, r = Math.PI / 180;
  const x = Math.sin(((bLat - aLat) * r) / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(((bLon - aLon) * r) / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}

function toPlace(g: GPlace, lat: number, lon: number, closeLabel: string | undefined, special: boolean): Place | null {
  const name = g.displayName?.text;
  if (!name || !g.location) return null;
  const category = special ? "activite" : categoryOf(g);
  if (!category) return null;
  const s = g.priceRange?.startPrice?.units, e = g.priceRange?.endPrice?.units;
  const review = (g.reviews ?? [])
    .filter((r) => (r.rating ?? 0) >= 4 && r.text?.text && r.text.text.length >= 40)
    .map((r) => ({ text: r.text!.text.replace(/\s+/g, " ").trim(), author: r.authorAttribution?.displayName ?? "", rating: r.rating ?? 5 }))
    .sort((a, b) => Math.abs(a.text.length - 140) - Math.abs(b.text.length - 140))[0];
  return {
    id: "G" + g.id,
    name,
    category,
    kind: g.primaryTypeDisplayName?.text ?? (category === "activite" ? "Activité" : "Lieu"),
    price: g.priceLevel ? PRICE[g.priceLevel] ?? 2 : category === "cafe" ? 1 : 2,
    priceRange: s ? (e ? `${s}–${e} € / pers` : `dès ${s} € / pers`) : undefined,
    lat: g.location.latitude,
    lon: g.location.longitude,
    distance: distance(lat, lon, g.location.latitude, g.location.longitude),
    address: g.shortFormattedAddress ?? g.formattedAddress,
    website: g.websiteUri,
    photos: (g.photos ?? []).slice(0, 5).map((p) => p.name),
    rating: g.rating,
    ratingCount: g.userRatingCount,
    openLabel: closeLabel,
    review: review ? { ...review, text: review.text.length > 220 ? review.text.slice(0, 217) + "…" : review.text } : undefined,
    summary: g.editorialSummary?.text,
    mapsUri: g.googleMapsUri,
    cinema: (g.types ?? []).some((t) => CINEMA.includes(t)),
    special,
  };
}

/* ---------- recherche ---------- */

export async function googlePlaces(
  lat: number,
  lon: number,
  radius: number,
  cats: Category[],
  slot?: { date?: string; from?: string },
  max = 40,
): Promise<Place[]> {
  const jobs: Promise<{ list: GPlace[]; special: boolean }>[] = [];
  const add = (p: Promise<GPlace[]>, special = false) => jobs.push(p.then((list) => ({ list, special })));
  if (cats.includes("resto")) add(nearby(["restaurant"], lat, lon, radius));
  if (cats.includes("bar")) add(nearby(["bar", "night_club"], lat, lon, radius));
  if (cats.includes("cafe")) add(nearby(["cafe"], lat, lon, radius));
  if (cats.includes("activite")) {
    add(nearby(ACTIVITY_TYPES, lat, lon, radius));
    for (const q of SPECIAL_QUERIES) add(text(q, lat, lon, radius), true);
  }
  const results = await Promise.all(jobs);

  const seen = new Set<string>();
  const byCat = new Map<Category, Place[]>();
  for (const { list, special } of results) {
    for (const g of list) {
      if (seen.has(g.id) || g.businessStatus !== "OPERATIONAL") continue;
      // qualité : bien noté et assez d'avis
      if ((g.rating ?? 0) < 3.9 || (g.userRatingCount ?? 0) < 15) continue;
      let closeLabel: string | undefined;
      if (slot?.date && slot.from) {
        const o = openAt(g.regularOpeningHours?.periods, slot.date, slot.from);
        if (!o.open) continue;
        closeLabel = o.closeLabel;
      }
      const p = toPlace(g, lat, lon, closeLabel, special);
      if (!p || p.distance > radius * 1.6) continue;
      seen.add(g.id);
      byCat.set(p.category, [...(byCat.get(p.category) ?? []), p]);
    }
  }

  // tri par qualité (note × nombre d'avis) puis proximité
  const score = (p: Place) => (p.rating ?? 4) * Math.log10((p.ratingCount ?? 10) + 10) - p.distance / 2000 + (p.special ? 0.6 : 0);
  for (const l of byCat.values()) l.sort((a, b) => score(b) - score(a));

  const out: Place[] = [];
  while (out.length < max && [...byCat.values()].some((l) => l.length)) {
    for (const l of byCat.values()) {
      const p = l.shift();
      if (p && out.length < max) out.push(p);
    }
  }
  return out;
}

/* ---------- adresses ---------- */

export async function autocomplete(input: string, lat?: number, lon?: number) {
  const r = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY! },
    body: JSON.stringify({
      input,
      languageCode: "fr",
      includedRegionCodes: ["fr", "be", "ch", "lu", "mc"],
      ...(lat && lon ? { locationBias: circle(lat, lon, 20000) } : {}),
    }),
    signal: AbortSignal.timeout(6000),
  });
  const j = await r.json();
  return ((j.suggestions ?? []) as { placePrediction?: { placeId: string; text?: { text: string }; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } } } }[])
    .filter((s) => s.placePrediction)
    .slice(0, 5)
    .map((s) => ({
      id: s.placePrediction!.placeId,
      main: s.placePrediction!.structuredFormat?.mainText?.text ?? s.placePrediction!.text?.text ?? "",
      secondary: s.placePrediction!.structuredFormat?.secondaryText?.text ?? "",
    }));
}

export async function placeLocation(id: string) {
  const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
    headers: { "X-Goog-Api-Key": KEY!, "X-Goog-FieldMask": "location,formattedAddress,displayName" },
    signal: AbortSignal.timeout(6000),
  });
  const j = await r.json();
  if (!j.location) return null;
  return { lat: j.location.latitude as number, lon: j.location.longitude as number, label: (j.formattedAddress ?? j.displayName?.text) as string };
}

export async function photoUri(name: string, width: number) {
  const r = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${width}&skipHttpRedirect=true&key=${KEY}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!r.ok) return null;
  return ((await r.json()).photoUri as string) ?? null;
}
