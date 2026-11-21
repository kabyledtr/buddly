"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Deux captures du téléphone, exactement superposées : quand on descend jusqu'au téléphone, la carte au repos
 * laisse place (fondu complet) à la carte glissée vers « oui » ; en remontant, elle revient.
 * Le fondu est déclenché par un seuil, jamais « coupé » à mi-chemin, et sans zoom ni rotation (pas de flou).
 */
export default function PhoneScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [swiped, setSwiped] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const center = (r.top + r.height / 2) / window.innerHeight; // 1 = bas de l'écran, 0 = haut
        // marge entre les deux seuils : pas de clignotement si on s'arrête pile au milieu
        setSwiped((s) => (s ? center < 0.62 : center < 0.48));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const img = "pointer-events-none object-contain transition-opacity duration-700 ease-in-out [will-change:opacity]";
  return (
    <div ref={ref} className="relative mx-auto aspect-[1/2] w-full max-w-[290px] select-none">
      <Image
        src="/phone-card.webp"
        alt="L'écran de swipe de Buddly : une carte de lieu avec photo, note et avis"
        fill
        sizes="290px"
        draggable={false}
        className={img}
        style={{ opacity: swiped ? 0 : 1 }}
      />
      <Image
        src="/phone-swipe.webp"
        alt="La carte glissée vers la droite : c'est un oui, Bud est aux anges"
        fill
        sizes="290px"
        draggable={false}
        className={img}
        style={{ opacity: swiped ? 1 : 0 }}
      />
    </div>
  );
}
