import { DIET_LABEL, type Budget, type Category, type Diet, type Place } from "./types";

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

const text = (q: string, lat: number, lon: number, radius: number, count = 10) =>
  call("places:searchText", {
    textQuery: q,
    maxResultCount: count,
    languageCode: "fr",
    regionCode: "FR",
    locationBias: circle(lat, lon, radius),
  }).catch(() => [] as GPlace[]);

// Activités originales cherchées en plus des catégories classiques
// Regroupées par thème : chaque recherche Google est facturée, une recherche large en ramène 20.
const SPECIAL_QUERIES: [string, string][] = [
  ["escape game laser game réalité virtuelle", "Escape game"],
  ["karaoké bar à jeux de société blind test", "Karaoké"],
  ["atelier poterie céramique peinture bougie DIY", "Atelier"],
  ["cours de cuisine pâtisserie dégustation de vin", "Cours de cuisine"],
  ["bowling billard mini-golf salle d'arcade", "Jeux"],
  ["escalade karting accrobranche paintball lancer de hache", "Sensations"],
  ["comedy club stand-up théâtre d'impro", "Stand-up"],
];
const SPECIAL_KIND: [RegExp, string][] = [
  [/escape/i, "Escape game"],
  [/karaok/i, "Karaoké"],
  [/laser/i, "Laser game"],
  [/r[ée]alit[ée] virtuelle|\bvr\b|virtual/i, "Réalité virtuelle"],
  [/blind ?test|quiz/i, "Blind test"],
  [/bowling/i, "Bowling"],
  [/poterie|c[ée]ramique|pottery/i, "Atelier poterie"],
  [/cours de cuisine|atelier (de )?(cuisine|p[âa]tisserie)|cooking class/i, "Cours de cuisine"],
  [/d[ée]gustation|oenolog|œnolog|wine tasting/i, "Dégustation"],
  [/escalade|climbing/i, "Escalade"],
  [/mini.?golf/i, "Mini-golf"],
  [/\bbillards?\b|billiard/i, "Billard"],
  [/fl[ée]chettes|\bdarts\b/i, "Fléchettes"],
  [/karting/i, "Karting"],
  [/paintball/i, "Paintball"],
  [/accrobranche/i, "Accrobranche"],
  [/lancer de hache|axe throwing/i, "Lancer de hache"],
  [/stand.?up|comedy club|\bimpro\b/i, "Stand-up"],
  [/\barcade\b/i, "Arcade"],
  [/jeux|board ?game|ludique/i, "Bar à jeux"],
  [/atelier|workshop|cours de/i, "Atelier"],
];
const EXCLUDED = ["shopping_mall", "department_store", "lodging", "hotel", "hostel", "motel", "bed_and_breakfast", "campground", "gas_station", "supermarket"];

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
        return { open: true, closeLabel: ch === 0 && !cm ? "Ouvert jusqu'à minuit" : `Ouvert jusqu'à ${ch}h${cm ? String(cm).padStart(2, "0") : ""}` };
      }
    }
  }
  return { open: false };
}

/* ---------- normalisation ---------- */

const CINEMA = ["movie_theater"];
const ACTIVITY_TYPES = [
  "movie_theater", "bowling_alley", "museum", "art_gallery", "amusement_center", "night_club",
  "amusement_park", "aquarium", "zoo", "performing_arts_theater",
];

function categoryOf(g: GPlace, source: Category): Category | null {
  const p = g.primaryType ?? "";
  if (/restaurant|meal_|food_court|diner|steak_house|pizzeria|brasserie/.test(p)) return "resto";
  if (/^(bar|pub|wine_bar|cocktail_bar|beer_hall|night_club|lounge_bar|sports_bar|irish_pub|bar_and_grill)$/.test(p)) return "bar";
  if (/cafe|coffee|tea_house|bakery|patisserie|dessert|ice_cream/.test(p)) return "cafe";
  if (!p) return source;
  return source === "activite" ? "activite" : null;
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

function toPlace(g: GPlace, lat: number, lon: number, closeLabel: string | undefined, special: boolean, source: Category): Place | null {
  const name = g.displayName?.text;
  if (!name || !g.location) return null;
  if ((g.types ?? []).some((t) => EXCLUDED.includes(t))) return null;
  const typeLabel = g.primaryTypeDisplayName?.text ?? "";
  const specialKind = SPECIAL_KIND.find(([re]) => re.test(name) || re.test(typeLabel))?.[1];
  const isBar = (g.types ?? []).some((t) => t === "bar" || t === "pub");
  // bar à jeux / karaoké restent des activités originales même s'ils sont aussi des bars
  special = special || (Boolean(specialKind) && (!isBar || /Karaoké|Bar à jeux|Blind test/.test(specialKind!)));
  const category = special ? "activite" : categoryOf(g, source);
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
    kind: (special && specialKind) || typeLabel || { resto: "Restaurant", bar: "Bar", cafe: "Café", activite: "Activité" }[category],
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

/** Retrouve le lieu réel d'un événement (photos, note, position) à partir de son nom et de son adresse. */
export async function venueLookup(query: string, lat: number, lon: number, radius: number): Promise<Place | null> {
  if (!KEY) return null;
  const list = await text(query, lat, lon, Math.max(radius, 5000));
  const g = list.find((x) => x.businessStatus !== "CLOSED_PERMANENTLY" && x.location);
  if (!g) return null;
  const p = toPlace(g, lat, lon, undefined, true, "activite");
  if (!p) return null;
  return { ...p, category: "activite", special: true };
}

/** Alterne les types de lieux en gardant l'ordre de qualité dans chaque type. */
function diversify(list: Place[]): Place[] {
  const buckets = new Map<string, Place[]>();
  for (const p of list) {
    const kind = p.kind.split(" · ")[0];
    const k = /mus[ée]e|museum|galerie|gallery/i.test(kind) ? "musée" : /cin[ée]ma|movie/i.test(kind) ? "cinéma" : kind;
    buckets.set(k, [...(buckets.get(k) ?? []), p]);
  }
  const out: Place[] = [];
  while (out.length < list.length) for (const b of buckets.values()) if (b.length) out.push(b.shift()!);
  return out;
}

/* ---------- recherche ---------- */

export async function googlePlaces(
  lat: number,
  lon: number,
  radius: number,
  cats: Category[],
  slot?: { date?: string; from?: string; diets?: Diet[] },
  max = 40,
): Promise<Place[]> {
  const jobs: Promise<{ list: GPlace[]; special: boolean; source: Category; diet?: string }>[] = [];
  const add = (source: Category, p: Promise<GPlace[]>, special = false, diet?: string) =>
    jobs.push(p.then((list) => ({ list, special, source, diet })));
  const diets = slot?.diets ?? [];
  if (cats.includes("resto")) {
    // régime alimentaire du groupe : on ne propose que des restos compatibles
    if (diets.length) for (const d of diets) add("resto", text(`restaurant ${DIET_LABEL[d].toLowerCase()}`, lat, lon, radius), false, DIET_LABEL[d]);
    else add("resto", nearby(["restaurant"], lat, lon, radius));
  }
  if (cats.includes("bar")) {
    add("bar", nearby(["bar", "night_club"], lat, lon, radius));
    add("bar", text("bar à cocktails", lat, lon, radius));
  }
  if (cats.includes("cafe")) {
    add("cafe", nearby(["cafe", "coffee_shop"], lat, lon, radius));
    add("cafe", text("coffee shop brunch", lat, lon, radius));
  }
  if (cats.includes("activite")) {
    add("activite", nearby(ACTIVITY_TYPES, lat, lon, radius));
    for (const [q, label] of SPECIAL_QUERIES) add("activite", text(q, lat, lon, radius, 20), true, label);
  }
  const results = await Promise.all(jobs);

  const seen = new Set<string>();
  const byCat = new Map<Category, Place[]>();
  for (const { list, special, source, diet } of results) {
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
      const p = toPlace(g, lat, lon, closeLabel, special, source);
      if (p && diet) {
        if (special) p.kind = SPECIAL_KIND.find(([re]) => re.test(p.name))?.[1] ?? diet;
        else p.diet = diet;
      }
      // régime demandé : seuls les restos trouvés pour ce régime sont gardés
      if (p && diets.length && p.category === "resto" && !p.diet) continue;
      if (!p || p.distance > radius * 1.6) continue;
      seen.add(g.id);
      byCat.set(p.category, [...(byCat.get(p.category) ?? []), p]);
    }
  }

  // tri par qualité (note × nombre d'avis) puis proximité
  const score = (p: Place) => (p.rating ?? 4) * Math.log10((p.ratingCount ?? 10) + 10) - p.distance / 2000 + (p.special ? 0.6 : 0);
  for (const [cat, l] of byCat) {
    l.sort((a, b) => score(b) - score(a));
    // activités : on alterne les types (poterie, escape game, musée…) pour ne pas avoir 5 musées d'affilée
    if (cat === "activite") byCat.set(cat, diversify(l));
  }

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
      includedRegionCodes: ["fr"],
      regionCode: "fr",
      ...(lat && lon ? { locationBias: circle(lat, lon, 30000), origin: { latitude: lat, longitude: lon } } : {}),
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
