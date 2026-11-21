import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fichiers lus au moment de générer les images d'aperçu (partage WhatsApp, Discord, iMessage…) :
  // ils doivent être embarqués dans les fonctions serveur sur Vercel.
  outputFileTracingIncludes: {
    "/g/[id]/opengraph-image": ["./public/pet-love.png", "./app/fonts/fredoka-bold.ttf"],
    "/**": ["./public/pet-love.png", "./app/fonts/fredoka-bold.ttf"],
  },
};

export default nextConfig;
