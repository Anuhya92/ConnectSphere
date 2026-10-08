export default function Loading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4" aria-busy="true" aria-live="polite">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-line" />
            <div className="h-4 w-32 animate-pulse rounded bg-line" />
          </div>
          <div className="h-5 w-2/3 animate-pulse rounded bg-line" />
          <div className="aspect-'16/9' animate-pulse rounded-lg bg-line/70" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
