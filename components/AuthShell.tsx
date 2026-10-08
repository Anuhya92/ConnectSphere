import type { ReactNode } from "react";
import MountainArt from "@/components/MountainArt";

export default function AuthShell({
  script,
  children,
}: {
  script: string[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-tint/50 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden flex-col justify-between gap-6 p-8 lg:flex">
          <p className="font-script -rotate-6 text-5xl leading-[1.05] text-secondary">
            {script.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-line">
            <MountainArt className="aspect-'4/3' w-full" />
          </div>
          <span aria-hidden className="h-4 w-20 rounded-full bg-primary/70" />
        </div>
        <div className="p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
