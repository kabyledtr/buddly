import type { CSSProperties, ReactNode } from "react";

type Variant = "up" | "pop" | "left" | "right";

/** Délai de transition (ms) et inclinaison éventuelle, en variables CSS. */
export function rv(delay = 0, tilt?: number): CSSProperties {
  return { "--d": `${delay}ms`, ...(tilt !== undefined && { "--tilt": `${tilt}deg` }) } as CSSProperties;
}

/** Bloc qui entre / sort au scroll. Rendu côté serveur, piloté par <ScrollReveal />. */
export function Reveal({
  as: Tag = "div",
  variant = "up",
  delay = 0,
  tilt,
  className,
  children,
}: {
  as?: "div" | "p" | "li" | "span";
  variant?: Variant;
  delay?: number;
  tilt?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag data-reveal={variant} style={rv(delay, tilt)} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Titre qui monte mot par mot, chaque mot sortant d'une petite fenêtre.
 * `accent` est ajouté à la fin en corail, avec un trait dessiné sous le dernier mot.
 */
export function Words({ text, accent, delay = 0 }: { text: string; accent?: string; delay?: number }) {
  const base = text.split(" ").filter(Boolean);
  const extra = accent ? accent.split(" ").filter(Boolean) : [];
  const all = [...base, ...extra];

  return (
    <span data-reveal="words" style={rv(delay)}>
      <span className="sr-only">{all.join(" ")}</span>
      <span aria-hidden>
      {all.map((w, i) => {
        const isAccent = i >= base.length;
        const isLast = i === all.length - 1;
        const word = (
          <span className="rw">
            <span style={{ "--i": i } as CSSProperties} className={isAccent ? "text-coral" : undefined}>
              {w}
            </span>
          </span>
        );
        return (
          <span key={i}>
            {isAccent && isLast ? (
              <span className="relative inline-block">
                {word}
                <svg viewBox="0 0 120 14" preserveAspectRatio="none" className="rw-scribble" aria-hidden style={{ "--i": i } as CSSProperties}>
                  <path d="M3 9C22 4 40 3 60 6S98 12 117 5" pathLength={1} />
                </svg>
              </span>
            ) : (
              word
            )}
            {!isLast && " "}
          </span>
        );
      })}
      </span>
    </span>
  );
}
