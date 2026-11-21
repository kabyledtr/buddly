import { getJSON, hgetall, hset, setJSON, setPermanent } from "./store";
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

export const kEvents = (id: string) => `g:${id}:events`;
export type EventsState = { status: "pending" | "done"; at: number; places: Place[] };

export async function loadGroup(id: string): Promise<Group | null> {
  const [g, ev] = await Promise.all([getJSON<Group>(kGroup(id)), getJSON<EventsState>(kEvents(id))]);
  if (!g) return null;
  return { ...g, events: ev?.places ?? [], eventsStatus: ev?.status };
}

export const saveGroup = (g: Group) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { events, eventsStatus, ...rest } = g;
  return setJSON(kGroup(g.id), rest);
};

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

export const deckFor = (g: Group) => {
  const t = TIERS[tierOf(g)];
  return [...g.places.slice(0, t.places), ...(g.events ?? []).slice(0, t.events)];
};
export const maxMembers = (g: Group) => TIERS[tierOf(g)].members;

/* ---------- E-mail et Buddly+ à vie (rattaché à l'e-mail) ---------- */

export const normEmail = (e: unknown) => String(e ?? "").trim().toLowerCase().slice(0, 120);
export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const plusKey = (email: string) => `plus:email:${email}`;
export const passKey = (email: string) => `pass:email:${email}`; // Pass achetés depuis la page Tarifs, pas encore utilisés

/** Utilise un Pass acheté à l'avance (depuis la page Tarifs) pour une nouvelle sortie. */
export async function consumePassCredit(email: string): Promise<boolean> {
  const n = (await getJSON<number>(passKey(email))) ?? 0;
  if (n <= 0) return false;
  await setPermanent(passKey(email), n - 1);
  return true;
}

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

/**
 * Matching : chaque personne compte autant, avec ses votes, ses envies et son budget.
 * - les « oui » du groupe d'abord (un « non » pèse lourd, un lieu aimé par tous gagne un bonus) ;
 * - envies : part du groupe qui a envie de ce type de sortie ;
 * - budget : on pénalise selon l'écart avec le budget de chacun, bonus si ça rentre dans le budget de tout le monde ;
 * - puis la qualité (note Google) et la distance pour départager.
 */
export function rank(g: Group, members: Member[], votes: Votes): Ranked[] {
  const n = Math.max(1, members.length);
  return deckFor(g)
    .map((place) => {
      const likedBy = members.filter((m) => votes[m.id]?.[place.id] === 1).map((m) => m.name);
      const nopes = members.filter((m) => votes[m.id]?.[place.id] === 0).length;
      const likes = likedBy.length;
      const unanimous = members.length >= 2 && likes === members.length;
      const wants = members.filter((m) => m.likes.includes(place.category)).length / n;
      const over = members.reduce((s, m) => s + Math.max(0, place.price - m.budget), 0) / n;
      const fitsAll = members.every((m) => place.price <= m.budget);
      const quality = place.rating ? (place.rating - 4.2) * 12 : 0;
      const score =
        (likes / n) * 100 - nopes * 18 + (unanimous ? 25 : 0) + wants * 14 - over * 14 + (fitsAll ? 6 : 0) + quality - place.distance / 250;
      return { place, likes, nopes, likedBy, unanimous, score };
    })
    .filter((r) => r.likes > 0)
    .sort((a, b) => b.score - a.score);
}
