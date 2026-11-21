import type { Budget, Category, Diet, Place } from "./types";
import { googlePlaces, hasGoogle } from "./google";

const UA = "Buddly/1.0 (https://buddly.io)";
const GEOAPIFY = process.env.GEOAPIFY_KEY;

/* ---------- géocodage ---------- */

export async function geocode(text: string): Promise<{ lat: number; lon: number; label: string } | null> {
  try {
    if (GEOAPIFY) {
      const u = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&lang=fr&limit=1&format=json&apiKey=${GEOAPIFY}`;
      const r = await fetch(u, { signal: AbortSignal.timeout(8000) });
      const j = await r.json();
      const f = j.results?.[0];
      if (f) return { lat: f.lat, lon: f.lon, label: f.formatted };
    }
    const u = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=1&accept-language=fr`;
    const r = await fetch(u, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8000) });
    const j = await r.json();
    if (j[0]) return { lat: +j[0].lat, lon: +j[0].lon, label: j[0].display_name };
  } catch {}
  return null;
}

/* ---------- libellés ---------- */

const CUISINE: Record<string, string> = {
  pizza: "Pizzeria", italian: "Italien", burger: "Burgers", japanese: "Japonais", sushi: "Sushi",
  french: "Français", indian: "Indien", chinese: "Chinois", vietnamese: "Vietnamien", thai: "Thaï",
  lebanese: "Libanais", mexican: "Mexicain", kebab: "Kebab", korean: "Coréen", crepe: "Crêperie",
  african: "Africain", greek: "Grec", spanish: "Espagnol", turkish: "Turc", asian: "Asiatique",
  ramen: "Ramen", seafood: "Fruits de mer", steak_house: "Grillades", vegan: "Vegan",
  vegetarian: "Végétarien", sandwich: "Sandwichs", moroccan: "Marocain", peruvian: "Péruvien",
  brunch: "Brunch", tapas: "Tapas", bagel: "Bagels", coffee_shop: "Coffee shop",
};

const ACTIVITY: Record<string, string> = {
  cinema: "Cinéma", theatre: "Théâtre", bowling_alley: "Bowling", escape_game: "Escape game",
  museum: "Musée", gallery: "Galerie", miniature_golf: "Mini-golf", amusement_arcade: "Salle d'arcade",
  karaoke: "Karaoké", culture: "Lieu culturel", nightclub: "Club",
};

function cuisineLabel(raw?: string) {
  if (!raw) return null;
  const first = raw.split(/[;,]/)[0].trim().toLowerCase();
  return CUISINE[first] ?? null;
}

function priceFor(category: Category, kind: string): Budget {
  if (/Kebab|Sandwichs|Bagels|Burgers/.test(kind)) return 1;
  if (category === "cafe") return 1;
  if (/Fruits de mer|Grillades|Japonais|Théâtre|Escape game/.test(kind)) return 3;
  return 2;
}

/* ---------- normalisation ---------- */

function distance(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}

function fromTags(id: string, tags: Record<string, string>, lat: number, lon: number, oLat: number, oLon: number): Place | null {
  const name = tags.name;
  if (!name) return null;
  const a = tags.amenity, l = tags.leisure, t = tags.tourism;
  let category: Category;
  let kind: string;
  if (a === "restaurant" || a === "fast_food") {
    category = "resto";
    kind = cuisineLabel(tags.cuisine) ?? (a === "fast_food" ? "Street food" : "Restaurant");
  } else if (a === "bar" || a === "pub" || a === "biergarten") {
    category = "bar";
    kind = a === "pub" ? "Pub" : tags.cocktails === "yes" ? "Bar à cocktails" : "Bar";
  } else if (a === "cafe") {
    category = "cafe";
    kind = cuisineLabel(tags.cuisine) === "Brunch" ? "Brunch" : "Café";
  } else {
    const key = a || l || t || "";
    if (!ACTIVITY[key]) return null;
    category = "activite";
    kind = ACTIVITY[key];
  }
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  return {
    id,
    name,
    category,
    kind,
    price: priceFor(category, kind),
    lat,
    lon,
    distance: distance(oLat, oLon, lat, lon),
    address: street || undefined,
    website: tags.website || tags["contact:website"] || undefined,
  };
}

/* ---------- sources ---------- */

const GEO_CATS: Record<Category, string[]> = {
  resto: ["catering.restaurant", "catering.fast_food"],
  bar: ["catering.bar", "catering.pub", "catering.biergarten"],
  cafe: ["catering.cafe"],
  activite: [
    "entertainment.cinema", "entertainment.escape_game", "entertainment.bowling_alley",
    "entertainment.museum", "entertainment.culture", "entertainment.miniature_golf",
    "entertainment.amusement_arcade",
  ],
};

async function fromGeoapify(lat: number, lon: number, radius: number, cats: Category[]): Promise<Place[]> {
  const categories = cats.flatMap((c) => GEO_CATS[c]).join(",");
  const u = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=120&lang=fr&apiKey=${GEOAPIFY}`;
  const r = await fetch(u, { signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error("geoapify " + r.status);
  const j = await r.json();
  const out: Place[] = [];
  for (const f of j.features ?? []) {
    const p = f.properties ?? {};
    const raw = (p.datasource?.raw ?? {}) as Record<string, string>;
    const place = fromTags("g" + (raw.osm_id ?? p.place_id), { ...raw, name: p.name ?? raw.name }, p.lat, p.lon, lat, lon);
    if (place) {
      place.address = p.address_line2?.split(",")[0] ?? place.address;
      out.push(place);
    }
  }
  return out;
}

const NOMI_QUERIES: Record<Category, string[]> = {
  resto: ["restaurant"],
  bar: ["bar"],
  cafe: ["cafe"],
  activite: ["cinema", "museum", "bowling"],
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Recherche d'établissements par type dans une zone (Nominatim, max 1 requête/seconde). */
async function fromNominatim(lat: number, lon: number, radius: number, cats: Category[]): Promise<Place[]> {
  const dLat = radius / 111000;
  const dLon = radius / (111000 * Math.cos((lat * Math.PI) / 180));
  const box = [lon - dLon, lat + dLat, lon + dLon, lat - dLat].map((n) => n.toFixed(5)).join(",");
  const out: Place[] = [];
  const queries = cats.flatMap((c) => NOMI_QUERIES[c]);
  for (let i = 0; i < queries.length; i++) {
    if (i) await sleep(1050);
    try {
      const u = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queries[i])}&format=jsonv2&limit=40&bounded=1&viewbox=${box}&extratags=1&addressdetails=1&accept-language=fr`;
      const r = await fetch(u, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8000) });
      if (!r.ok) continue;
      for (const x of await r.json()) {
        const ex = (x.extratags ?? {}) as Record<string, string>;
        const ad = (x.address ?? {}) as Record<string, string>;
        const tags: Record<string, string> = {
          ...ex,
          name: x.name,
          [x.category]: x.type,
          "addr:street": ad.road ?? "",
          "addr:housenumber": ad.house_number ?? "",
        };
        const p = fromTags(`n${x.osm_type?.[0] ?? ""}${x.osm_id}`, tags, +x.lat, +x.lon, lat, lon);
        if (p && p.distance <= radius * 1.05) out.push(p);
      }
    } catch {}
  }
  return out;
}

const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

async function fromOverpass(lat: number, lon: number, radius: number, cats: Category[]): Promise<Place[]> {
  const around = `(around:${radius},${lat},${lon})`;
  const parts: string[] = [];
  if (cats.includes("resto")) parts.push(`nwr${around}[amenity~"^(restaurant|fast_food)$"][name];`);
  if (cats.includes("bar")) parts.push(`nwr${around}[amenity~"^(bar|pub|biergarten)$"][name];`);
  if (cats.includes("cafe")) parts.push(`nwr${around}[amenity=cafe][name];`);
  if (cats.includes("activite"))
    parts.push(
      `nwr${around}[amenity~"^(cinema|theatre|nightclub)$"][name];`,
      `nwr${around}[leisure~"^(bowling_alley|escape_game|miniature_golf|amusement_arcade)$"][name];`,
      `nwr${around}[tourism~"^(museum|gallery)$"][name];`,
    );
  const q = `[out:json][timeout:25];(${parts.join("")});out center tags 300;`;
  const ctrl = new AbortController();
  const tryOne = async (base: string) => {
    const r = await fetch(base, {
      method: "POST",
      headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(q),
      signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(28000)]),
    });
    if (!r.ok) throw new Error("overpass " + r.status);
    return r.json();
  };
  const j = await Promise.any(OVERPASS.map(tryOne));
  ctrl.abort();
  const out: Place[] = [];
  for (const e of j.elements ?? []) {
    const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon;
    if (la == null) continue;
    const p = fromTags(`o${e.type[0]}${e.id}`, e.tags ?? {}, la, lo, lat, lon);
    if (p) out.push(p);
  }
  return out;
}

/* ---------- sélection ---------- */

function pick(all: Place[], max: number): Place[] {
  const seen = new Set<string>();
  const unique = all
    .filter((p) => {
      const k = p.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => a.distance - b.distance);
  // alterne les catégories pour un deck varié
  const byCat = new Map<Category, Place[]>();
  for (const p of unique) byCat.set(p.category, [...(byCat.get(p.category) ?? []), p]);
  const out: Place[] = [];
  while (out.length < max && [...byCat.values()].some((l) => l.length)) {
    for (const l of byCat.values()) {
      const p = l.shift();
      if (p && out.length < max) out.push(p);
    }
  }
  return out;
}

export async function findPlaces(
  lat: number,
  lon: number,
  radius: number,
  cats: Category[],
  slot?: { date?: string; from?: string; diets?: Diet[] },
  max = 40,
) {
  if (hasGoogle) {
    try {
      const g = await googlePlaces(lat, lon, radius, cats, slot, max);
      if (g.length >= 8) return g;
    } catch (e) {
      console.error(e);
    }
  }
  let all: Place[] = [];
  if (GEOAPIFY) {
    try {
      all = await fromGeoapify(lat, lon, radius, cats);
    } catch {}
  }
  if (all.length < 8) all = [...all, ...(await fromNominatim(lat, lon, radius, cats))];
  if (all.length < 8) {
    try {
      all = [...all, ...(await fromOverpass(lat, lon, radius, cats))];
    } catch {}
  }
  return pick(all, max);
}
