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
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-tint/50 shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex flex-col gap-4 p-4 sm:p-6 lg:justify-between lg:gap-6 lg:p-8">
          <p className="font-script text-3xl leading-none text-secondary sm:text-4xl lg:-rotate-6 lg:text-5xl lg:leading-[1.05]">
            {script.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-line lg:rounded-2xl">
            <MountainArt className="block aspect-[2/1] w-full sm:aspect-[2.4/1] lg:aspect-4/3" />
          </div>
          <span aria-hidden className="hidden h-4 w-20 rounded-full bg-primary/70 lg:block" />
        </div>
        <div className="p-4 sm:p-8 lg:self-center">{children}</div>
      </div>
    </div>
  );
}
