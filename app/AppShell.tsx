import Image from "next/image";
import Link from "next/link";

export const memberKey = (groupId: string) => `buddly:m:${groupId}`;

export function AppHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-4">
      <Link href="/" aria-label="Buddly, accueil">
        <Image src="/logo.png" alt="Buddly" width={940} height={420} className="h-9 w-auto" />
      </Link>
      {right}
    </header>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition ${
        active ? "border-plum bg-plum text-paper" : "border-plum/15 bg-paper text-ink hover:border-plum/40"
      }`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="pl-1 font-display text-base font-semibold text-ink">{label}</p>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full rounded-full border-2 border-plum/15 bg-paper px-5 py-3 text-base text-ink outline-none placeholder:text-muted/60 focus:border-violet";

export function Spinner({ className = "" }: { className?: string }) {
  return <span className={`inline-block size-5 animate-spin rounded-full border-[3px] border-current border-t-transparent ${className}`} />;
}

export function BudgetPicker({ value, onChange }: { value: 1 | 2 | 3; onChange: (b: 1 | 2 | 3) => void }) {
  const opts = [
    { v: 1, title: "Petit prix", hint: "< 15 € / pers" },
    { v: 2, title: "Raisonnable", hint: "15 – 30 €" },
    { v: 3, title: "Plaisir", hint: "> 30 € / pers" },
  ] as const;
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.v)}
            className={`flex flex-col items-center rounded-[1.75rem] border-2 px-2 py-2.5 text-center transition ${
              active ? "border-plum bg-plum text-paper" : "border-plum/15 bg-paper text-ink hover:border-plum/40"
            }`}
          >
            <span className={`text-xs font-bold tracking-widest ${active ? "text-coral" : "text-[#c4543f]"}`}>{"€".repeat(o.v)}</span>
            <span className="mt-0.5 text-sm font-semibold leading-tight">{o.title}</span>
            <span className={`text-[11px] ${active ? "text-lilac" : "text-muted"}`}>{o.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
