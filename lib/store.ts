import { Redis } from "@upstash/redis";

// Stockage : Upstash Redis en prod (variables posées par l'intégration Vercel),
// mémoire locale en dev si rien n'est configuré.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

type Mem = { kv: Map<string, unknown>; h: Map<string, Map<string, unknown>> };
const g = globalThis as unknown as { __buddlyMem?: Mem };
const mem: Mem = (g.__buddlyMem ??= { kv: new Map(), h: new Map() });

const TTL = 60 * 60 * 24 * 30; // 30 jours

export const hasRealStore = Boolean(redis);

export async function getJSON<T>(key: string): Promise<T | null> {
  if (redis) return (await redis.get<T>(key)) ?? null;
  return (mem.kv.get(key) as T) ?? null;
}

export async function setJSON(key: string, value: unknown) {
  if (redis) return void (await redis.set(key, value, { ex: TTL }));
  mem.kv.set(key, value);
}

/** Avec une durée de vie précise, en secondes (caches). */
export async function setCache(key: string, value: unknown, seconds: number) {
  if (redis) return void (await redis.set(key, value, { ex: seconds }));
  mem.kv.set(key, value);
}

/** Pose la clé seulement si elle n'existe pas encore ; renvoie true pour le premier appelant (évite les doubles traitements). */
export async function claim(key: string): Promise<boolean> {
  if (redis) return (await redis.set(key, Date.now(), { nx: true })) === "OK";
  if (mem.kv.has(key)) return false;
  mem.kv.set(key, Date.now());
  return true;
}

/** Sans expiration (achats à vie). */
export async function setPermanent(key: string, value: unknown) {
  if (redis) return void (await redis.set(key, value));
  mem.kv.set(key, value);
}

export async function hset(key: string, field: string, value: unknown) {
  if (redis) {
    await redis.hset(key, { [field]: value });
    await redis.expire(key, TTL);
    return;
  }
  if (!mem.h.has(key)) mem.h.set(key, new Map());
  mem.h.get(key)!.set(field, value);
}

export async function hgetall<T>(key: string): Promise<Record<string, T>> {
  if (redis) return ((await redis.hgetall<Record<string, T>>(key)) ?? {}) as Record<string, T>;
  return Object.fromEntries(mem.h.get(key) ?? []) as Record<string, T>;
}
