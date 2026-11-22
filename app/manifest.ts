import type { MetadataRoute } from "next";

/** Ajout à l'écran d'accueil (Android, et nom de l'app sur iPhone) : Buddly s'ouvre comme une app, avec l'icône de Bud. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Buddly",
    short_name: "Buddly",
    description: "Swipez, matchez, sortez : Buddly trouve la sortie qui plaît à tout le groupe.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf7fb",
    theme_color: "#43207a",
    lang: "fr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
