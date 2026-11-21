export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://buddly.io";

/** « Dîner entre potes ! » → « diner-entre-potes » */
export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Les identifiants de groupe n'ont jamais de tiret : tout ce qui suit le premier tiret est le nom lisible. */
export const groupIdFrom = (param: string) => decodeURIComponent(param).split("-")[0];

export const groupPath = (id: string, name: string) => {
  const s = slugify(name);
  return `/g/${id}${s ? `-${s}` : ""}`;
};
