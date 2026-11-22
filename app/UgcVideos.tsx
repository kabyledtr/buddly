import DemoVideo from "./DemoVideo";

/**
 * Trois vidéos en éventail : une au centre, devant ; une de chaque côté, derrière, inclinées vers l'extérieur.
 * Chaque vidéo tourne en boucle sans son ni lecteur, et se met en pause hors de l'écran (voir DemoVideo).
 */
const CARD = "rounded-[2.25rem] shadow-[0_30px_60px_-24px_rgba(67,32,122,0.55)] ring-4 ring-paper";

export default function UgcVideos() {
  return (
    <div className="relative mx-auto flex h-[400px] max-w-3xl items-center justify-center sm:h-[560px]">
      {/* gauche, derrière */}
      <div
        className={`absolute left-1/2 top-1/2 z-10 w-[38%] max-w-[230px] ${CARD}`}
        style={{ transform: "translate(-118%, -46%) rotate(-9deg)" }}
      >
        <DemoVideo src="/ugc1.mp4" poster="/ugc1-poster.webp" width={540} height={960} />
      </div>
      {/* droite, derrière */}
      <div
        className={`absolute left-1/2 top-1/2 z-10 w-[38%] max-w-[230px] ${CARD}`}
        style={{ transform: "translate(18%, -46%) rotate(9deg)" }}
      >
        <DemoVideo src="/ugc3.mp4" poster="/ugc3-poster.webp" width={540} height={960} />
      </div>
      {/* centre, devant */}
      <div className={`relative z-20 w-[46%] max-w-[270px] ${CARD}`}>
        <DemoVideo src="/ugc2.mp4" poster="/ugc2-poster.webp" width={540} height={960} />
      </div>
    </div>
  );
}
