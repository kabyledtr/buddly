export type Category = "resto" | "bar" | "cafe" | "activite";
export type Budget = 1 | 2 | 3;

export type Place = {
  id: string;
  name: string;
  category: Category;
  kind: string; // libellé lisible : « Pizzeria », « Bar à cocktails »…
  price: Budget; // estimation
  lat: number;
  lon: number;
  distance: number; // mètres depuis le point de rendez-vous
  address?: string;
  website?: string;
  // enrichi par Google Places quand la clé est configurée
  photos?: string[]; // noms de photos Google, servis par /api/photo
  rating?: number;
  ratingCount?: number;
  priceRange?: string; // « 15–25 € / pers »
  openLabel?: string; // « Ouvert jusqu'à 23h »
  review?: { text: string; author: string; rating: number };
  summary?: string;
  mapsUri?: string;
  cinema?: boolean;
  special?: boolean; // activité originale (escape game, karaoké…)
  diet?: string; // « Halal », « Vegan »… quand le lieu a été trouvé pour un régime
  event?: { title: string; time?: string; price?: string; url: string; source?: string }; // atelier daté trouvé sur le web
};

export type Diet = "halal" | "casher" | "vegetarien" | "vegan" | "sansgluten";
export const DIET_LABEL: Record<Diet, string> = {
  halal: "Halal",
  casher: "Casher",
  vegetarien: "Végétarien",
  vegan: "Vegan",
  sansgluten: "Sans gluten",
};

export type When = { date?: string; from?: string; to?: string; label: string };

export type Group = {
  id: string;
  name: string;
  when: string;
  slot?: When;
  diets?: Diet[];
  area: string;
  lat: number;
  lon: number;
  radius: number;
  categories: Category[];
  createdAt: number;
  creatorId: string;
  premium: boolean; // ancien champ : true = Pass Sortie
  tier?: Tier;
  size?: number; // nombre de personnes prévu par l'organisateur (≤ limite de l'offre)
  places: Place[];
  // ateliers datés trouvés sur le web, stockés à part (clé g:<id>:events) et ajoutés au chargement
  events?: Place[];
  eventsStatus?: "pending" | "done";
};

export type Member = {
  id: string;
  name: string;
  budget: Budget;
  likes: Category[];
  joinedAt: number;
  email?: string; // jamais renvoyé au navigateur
};

export type Votes = Record<string, Record<string, 0 | 1>>; // memberId -> placeId -> vote

export type Tier = "free" | "pass" | "plus";
export type PaidTier = Exclude<Tier, "free">;

/** Gratuit : la sortie de base. Pass Sortie : cette sortie seulement. Buddly+ : toutes les sorties, à vie. */
export const TIERS: Record<Tier, { members: number; places: number; events: number; fullRanking: boolean; planB: boolean }> = {
  free: { members: 2, places: 10, events: 1, fullRanking: false, planB: false },
  pass: { members: 4, places: 15, events: 3, fullRanking: true, planB: false },
  plus: { members: 15, places: 40, events: 5, fullRanking: true, planB: true },
};
export const PRICES: Record<PaidTier, number> = { pass: 299, plus: 399 };
export const PLUS_SPLIT = 6; // taille de groupe « théorique » pour la phrase du prix partagé

export const tierOf = (g: Pick<Group, "tier" | "premium">): Tier => g.tier ?? (g.premium ? "pass" : "free");

export const BUDGET_LABEL: Record<Budget, { title: string; hint: string }> = {
  1: { title: "Petit budget", hint: "moins de 15 € / pers" },
  2: { title: "Raisonnable", hint: "15 à 30 € / pers" },
  3: { title: "On se fait plaisir", hint: "plus de 30 € / pers" },
};

export const CATEGORY_LABEL: Record<Category, string> = {
  resto: "Restos",
  bar: "Bars",
  cafe: "Cafés",
  activite: "Activités",
};
