import DemoVideo from "./DemoVideo";

/**
 * Trois vidéos en éventail : une au centre, devant ; une de chaque côté, derrière, inclinées vers l'extérieur.
 * Chaque carte n'apparaît qu'une fois sa vidéo prête (pas de cadre vide), tourne en boucle sans son ni lecteur,
 * et se met en pause hors de l'écran (voir DemoVideo). Plus large sur ordinateur, resserré sur mobile.
 */
const CARD = "shadow-[0_30px_60px_-24px_rgba(67,32,122,0.55)] ring-4 ring-paper";

export default function UgcVideos() {
  return (
    <div className="relative mx-auto flex h-[400px] max-w-3xl items-center justify-center sm:h-[620px] lg:h-[680px] lg:max-w-5xl">
      {/* gauche, derrière */}
      <div
        className="absolute left-1/2 top-1/2 z-10 w-[38%] max-w-[230px] sm:max-w-[260px] lg:max-w-[300px] [--x:-118%] lg:[--x:-132%]"
        style={{ transform: "translate(var(--x), -46%) rotate(-9deg)" }}
      >
        <DemoVideo src="/ugc1.mp4" poster="/ugc1-poster.webp" width={540} height={960} revealOnReady className={CARD} />
      </div>
      {/* droite, derrière */}
      <div
        className="absolute left-1/2 top-1/2 z-10 w-[38%] max-w-[230px] sm:max-w-[260px] lg:max-w-[300px] [--x:18%] lg:[--x:32%]"
        style={{ transform: "translate(var(--x), -46%) rotate(9deg)" }}
      >
        <DemoVideo src="/ugc3.mp4" poster="/ugc3-poster.webp" width={540} height={960} revealOnReady className={CARD} />
      </div>
      {/* centre, devant */}
      <div className="relative z-20 w-[46%] max-w-[270px] sm:max-w-[300px] lg:max-w-[340px]">
        <DemoVideo src="/ugc2.mp4" poster="/ugc2-poster.webp" width={540} height={960} revealOnReady className={CARD} />
      </div>
    </div>
  );
}
