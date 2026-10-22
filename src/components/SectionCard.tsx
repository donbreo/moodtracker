import type { ReactNode } from "react";

interface SectionCardProps {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function SectionCard({ number, title, description, children }: SectionCardProps) {
  return (
    <section className="card scroll-mt-24">
      <header className="mb-6 flex gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sm font-semibold text-sage-700">
          {number}
        </span>
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
