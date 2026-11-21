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
      className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
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
      <p className="font-display text-lg font-semibold text-ink">{label}</p>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full rounded-2xl border-2 border-plum/15 bg-paper px-4 py-3 text-base text-ink outline-none placeholder:text-muted/60 focus:border-violet";

export function Spinner({ className = "" }: { className?: string }) {
  return <span className={`inline-block size-5 animate-spin rounded-full border-[3px] border-current border-t-transparent ${className}`} />;
}
