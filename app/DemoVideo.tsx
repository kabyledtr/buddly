"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Vidéo de démo sans lecteur :
 * - chargée seulement quand on approche de la section (économise la bande passante) ;
 * - apparaît en fondu quand elle entre à l'écran ;
 * - démarre quand 70 % de la vidéo est visible, tourne en boucle ;
 * - se met en pause dès qu'elle sort de l'écran, et reprend là où elle s'était arrêtée.
 * Ni commandes, ni clic, ni clic droit, ni glisser-déposer, ni image dans l'image.
 */
export default function DemoVideo({ src, webm, poster, width, height }: { src: string; webm?: string; poster: string; width: number; height: number }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false); // les sources ne sont posées qu'à l'approche
  const [shown, setShown] = useState(false); // effet d'apparition, une seule fois

  useEffect(() => {
    const el = box.current;
    const v = video.current;
    if (!el || !v) return;

    // 1) charger un peu avant d'arriver dessus
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          near.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(el);

    // 2) apparition, lecture à 70 % visible, pause quand elle n'est plus à l'écran
    const play = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio > 0.15) setShown(true);
        if (e.intersectionRatio >= 0.7) v.play().catch(() => {});
        else if (!e.isIntersecting) v.pause();
      },
      { threshold: [0, 0.15, 0.7, 1] },
    );
    play.observe(el);

    // l'onglet passe en arrière-plan : pause (reprend au retour si elle est toujours visible)
    const vis = () => {
      if (document.hidden) v.pause();
      else {
        const r = el.getBoundingClientRect();
        const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height;
        if (visible >= 0.7) v.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      near.disconnect();
      play.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  // les sources viennent d'être posées : on recharge, et on lance tout de suite si elle est déjà bien visible
  useEffect(() => {
    const el = box.current;
    const v = video.current;
    if (!load || !el || !v) return;
    v.load();
    const r = el.getBoundingClientRect();
    const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height;
    if (visible >= 0.7) v.play().catch(() => {});
  }, [load]);

  const block = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div
      ref={box}
      onContextMenu={block}
      onDragStart={block}
      className={`relative mx-auto w-full select-none overflow-hidden rounded-[2.25rem] transition-[opacity,transform] duration-[900ms] ease-out [-webkit-touch-callout:none] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <video
        ref={video}
        muted
        loop
        playsInline
        preload={load ? "auto" : "none"}
        poster={poster}
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
        draggable={false}
        aria-label="Démo de Buddly : on crée une sortie, on swipe des lieux réels, et le groupe trouve son match"
        className="pointer-events-none absolute inset-0 size-full object-cover"
      >
        {load && webm && <source src={webm} type="video/webm" />}
        {load && <source src={src} type="video/mp4" />}
      </video>
      {/* calque transparent au-dessus : la vidéo elle-même ne reçoit ni clic, ni appui long, ni glisser */}
      <div aria-hidden className="absolute inset-0" />
    </div>
  );
}
