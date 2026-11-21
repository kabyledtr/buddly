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
};

export type Group = {
  id: string;
  name: string;
  when: string;
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

export const CATEGORY_LABEL: Record<Category, string> = {
  resto: "Restos",
  bar: "Bars",
  cafe: "Cafés",
  activite: "Activités",
};
