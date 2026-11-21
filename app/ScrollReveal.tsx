"use client";

import { useEffect } from "react";

/**
 * Observe tous les éléments [data-reveal] de la page et pose :
 *  - data-in="true" quand l'élément est dans la zone visible,
 *  - data-in="false" + data-from="above|below" quand il en sort,
 * pour que le CSS sache d'où il entre et par où il repart.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => (el.dataset.in = "true"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.dataset.in = "true";
          } else {
            el.dataset.in = "false";
            el.dataset.from = e.boundingClientRect.top < (e.rootBounds?.top ?? 0) ? "above" : "below";
          }
        }
      },
      // Zone "active" un peu plus petite que l'écran : les éléments repartent
      // juste avant de toucher le haut, et arrivent un peu après le bas.
      { rootMargin: "-6% 0px -10% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
