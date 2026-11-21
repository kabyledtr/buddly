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
  premium: boolean;
  places: Place[];
};

export type Member = {
  id: string;
  name: string;
  budget: Budget;
  likes: Category[];
  joinedAt: number;
};

export type Votes = Record<string, Record<string, 0 | 1>>; // memberId -> placeId -> vote

export const FREE_PLACES = 15;
export const FREE_MEMBERS = 4;
export const PREMIUM_MEMBERS = 15;
export const PRICE_CENTS = 99;

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
