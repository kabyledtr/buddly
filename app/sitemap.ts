import type { MetadataRoute } from "next";
import { CITIES, SITE, THEMES, cityPath, themePath } from "@/lib/seo";

/** Plan du site pour Google : accueil, création de sortie, guides, villes et pages légales. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/app`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/idees`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...THEMES.map((t) => ({ url: SITE + themePath(t), lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...CITIES.map((c) => ({ url: SITE + cityPath(c), lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${SITE}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
