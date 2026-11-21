"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Deux captures du téléphone : la carte au repos se transforme en carte glissée vers « oui » à mesure
 * qu'on fait défiler la page, et revient quand on remonte.
 */
export default function PhoneScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 quand le téléphone arrive aux 3/4 de l'écran, 1 quand il passe au tiers haut
        const v = (vh * 0.75 - (r.top + r.height / 2)) / (vh * 0.4);
        const t = Math.min(1, Math.max(0, v));
        setP(t * t * (3 - 2 * t)); // transition douce
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

  return (
    <div ref={ref} className="relative mx-auto aspect-[1/2] w-full max-w-[290px] select-none">
      <Image
        src="/phone-card.webp"
        alt="L'écran de swipe de Buddly : une carte de lieu avec photo, note et avis"
        fill
        sizes="290px"
        draggable={false}
        className="pointer-events-none object-contain drop-shadow-[0_30px_40px_rgba(67,32,122,0.25)]"
        style={{ opacity: 1 - p, transform: `scale(${1 - 0.03 * p}) rotate(${-2 * p}deg)` }}
      />
      <Image
        src="/phone-swipe.webp"
        alt="La carte glissée vers la droite : c'est un oui, Bud est aux anges"
        fill
        sizes="290px"
        draggable={false}
        className="pointer-events-none object-contain drop-shadow-[0_30px_40px_rgba(67,32,122,0.25)]"
        style={{ opacity: p, transform: `scale(${0.97 + 0.03 * p}) rotate(${2 * (1 - p)}deg)` }}
      />
    </div>
  );
}
