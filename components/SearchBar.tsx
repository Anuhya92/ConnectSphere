import { SearchIcon } from "@/components/Icons";

export default function SearchBar({
  query = "",
  className = "",
}: {
  query?: string;
  className?: string;
}) {
  return (
    <form action="/explore" method="get" role="search" className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary">
        <SearchIcon size={16} />
      </span>
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search posts by title…"
        aria-label="Search posts by title"
        className="w-full rounded-full border border-line bg-tint/60 py-2.5 pl-10 pr-4 text-base outline-none placeholder:text-muted/70 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/15 sm:text-sm"
      />
    </form>
    
  );
}
