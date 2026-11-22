import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/** Robots : tout le site est indexable, sauf l'API. Les sorties privées (/g/…) portent une balise noindex : les aperçus de partage restent possibles. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
