"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** Lien « Support » du pied de page : une petite fenêtre centrée avec l'adresse de contact, rien de plus. */
export default function SupportButton({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hover:text-ink">
        Support
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/40 p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Contacter le support"
            className="relative w-full max-w-sm rounded-[2rem] bg-paper p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted hover:bg-lilac"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
            <Image src="/pet-wave.png" alt="" width={700} height={665} sizes="80px" className="mx-auto h-16 w-auto" />
            <p className="mt-3 font-display text-2xl font-bold text-plum">Une question ?</p>
            <p className="mt-1 text-sm text-muted">Écris-nous, on te répond vite.</p>
            <p className="mt-4 select-all rounded-full bg-lilac/60 px-4 py-2.5 font-semibold text-plum">{email}</p>
            <button type="button" onClick={copy} className="mt-4 w-full rounded-full bg-plum py-2.5 text-sm font-semibold text-paper">
              {copied ? "Adresse copiée !" : "Copier l'adresse"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
