import { getJSON, hgetall, hset, setJSON } from "./store";
import {
  TIERS,
  tierOf,
  type Group,
  type Member,
  type Place,
  type Votes,
} from "./types";

export const newId = (n = 8) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join("");

const kGroup = (id: string) => `g:${id}`;
const kMembers = (id: string) => `g:${id}:members`;
const kVotes = (id: string, m: string) => `g:${id}:v:${m}`;

export const loadGroup = (id: string) => getJSON<Group>(kGroup(id));
export const saveGroup = (g: Group) => setJSON(kGroup(g.id), g);

export async function loadMembers(id: string): Promise<Member[]> {
  const raw = await hgetall<Member | string>(kMembers(id));
  return Object.values(raw)
    .map((m) => (typeof m === "string" ? (JSON.parse(m) as Member) : m))
    .sort((a, b) => a.joinedAt - b.joinedAt);
}

export const addMember = (groupId: string, m: Member) => hset(kMembers(groupId), m.id, m);

export async function loadVotes(id: string, members: Member[]): Promise<Votes> {
  const out: Votes = {};
  await Promise.all(
    members.map(async (m) => {
      const v = await hgetall<number | string>(kVotes(id, m.id));
      out[m.id] = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, Number(x) ? 1 : 0])) as Record<string, 0 | 1>;
    }),
  );
  return out;
}

export const saveVote = (groupId: string, memberId: string, placeId: string, like: boolean) =>
  hset(kVotes(groupId, memberId), placeId, like ? 1 : 0);

export const deckFor = (g: Group) => g.places.slice(0, TIERS[tierOf(g)].places);
export const maxMembers = (g: Group) => TIERS[tierOf(g)].members;

/* ---------- E-mail et Buddly+ à vie (rattaché à l'e-mail) ---------- */

export const normEmail = (e: unknown) => String(e ?? "").trim().toLowerCase().slice(0, 120);
export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const plusKey = (email: string) => `plus:email:${email}`;

export async function hasPlus(email: unknown): Promise<boolean> {
  const e = normEmail(email);
  if (!isEmail(e)) return false;
  return Boolean(await getJSON(plusKey(e)));
}

/** Passe un groupe en Pass Sortie ou Buddly+ (ne rétrograde jamais). */
export async function upgrade(g: Group, tier: "pass" | "plus") {
  const cur = tierOf(g);
  if (cur === "plus" || cur === tier) return g;
  const next = { ...g, tier, premium: true };
  await saveGroup(next);
  return next;
}

export type Ranked = {
  place: Place;
  likes: number;
  nopes: number;
  likedBy: string[];
  unanimous: boolean;
  score: number;
};

/** Matching : part de « oui » dans le groupe, pondérée par les préférences de chacun. */
export function rank(g: Group, members: Member[], votes: Votes): Ranked[] {
  const n = members.length;
  return deckFor(g)
    .map((place) => {
      const likedBy = members.filter((m) => votes[m.id]?.[place.id] === 1).map((m) => m.name);
      const nopes = members.filter((m) => votes[m.id]?.[place.id] === 0).length;
      const likes = likedBy.length;
      const pref =
        members.reduce(
          (s, m) => s + (m.likes.includes(place.category) ? 6 : 0) - (place.price > m.budget ? 8 : 0),
          0,
        ) / Math.max(1, n);
      const score = (likes / Math.max(1, n)) * 100 - nopes * 15 + pref - place.distance / 200;
      return { place, likes, nopes, likedBy, unanimous: n >= 2 && likes === n, score };
    })
    .filter((r) => r.likes > 0)
    .sort((a, b) => b.score - a.score);
}
