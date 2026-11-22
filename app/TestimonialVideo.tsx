"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Vidéo avec son et lecteur : l'image de départ avec un gros bouton lecture ; au clic, la vidéo démarre avec le son
 * et les commandes apparaissent. Elle apparaît en fondu (comme les autres vidéos) et se met en pause si on la quitte.
 */
export default function TestimonialVideo({ src, poster }: { src: string; poster: string }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = box.current;
    const v = video.current;
    if (!el || !v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio > 0.15) setShown(true);
        if (!e.isIntersecting && !v.paused) v.pause(); // on la quitte : pause
      },
      { threshold: [0, 0.15] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function play() {
    const v = video.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {});
    setStarted(true);
  }

  const block = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div
      ref={box}
      onContextMenu={block}
      className={`relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-[2.25rem] bg-plum shadow-[0_30px_60px_-24px_rgba(67,32,122,0.55)] ring-4 ring-paper transition-[opacity,transform] duration-[900ms] ease-out sm:max-w-[340px] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <video
        ref={video}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        controls={started}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        draggable={false}
        onDragStart={block}
        onEnded={() => setStarted(false)}
        aria-label="Vidéo : présentation de Buddly"
        className="absolute inset-0 size-full bg-black object-cover [&:-webkit-full-screen]:object-contain [&:fullscreen]:object-contain"
      />
      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label="Lire la vidéo avec le son"
          className="group absolute inset-0 grid place-items-center bg-gradient-to-t from-black/45 via-black/10 to-transparent"
        >
          <span className="grid size-20 place-items-center rounded-full bg-coral text-paper shadow-[0_10px_30px_-6px_rgba(247,128,106,0.8)] transition group-hover:scale-110 group-active:scale-95">
            <svg viewBox="0 0 24 24" className="ml-1 size-9" aria-hidden>
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="absolute bottom-6 left-0 right-0 text-center text-sm font-semibold text-paper">Lancer avec le son</span>
        </button>
      )}
    </div>
  );
}
