import Link from "next/link";
import Logo from "@/components/Logo";
import Avatar from "@/components/Avatar";
import SearchBar from "@/components/SearchBar";
import NavLink from "@/components/NavLink";
import { displayName, type ProfileLite } from "@/lib/utils";

type Props = { viewer: { profile: ProfileLite } | null };

export default function Header({ viewer }: Props) {
  const profile = viewer?.profile ?? null;
  const name = displayName(profile);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-3 sm:gap-6 sm:px-4">
        <Logo />

        {!viewer && (
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            <NavLink href="/" exact className="rounded-lg px-3 py-2 text-sm font-medium">
              Home
            </NavLink>
            <NavLink href="/explore" className="rounded-lg px-3 py-2 text-sm font-medium">
              Explore
            </NavLink>
          </nav>
        )}

        <SearchBar className="ml-auto hidden max-w-md flex-1 sm:block" />

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {viewer ? (
            <Link
              href={profile ? `/profile/${profile.username}` : "/settings/profile"}
              title={name}
              aria-label="Your profile"
            >
              <Avatar name={name} path={profile?.avatar_url} size={36} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary btn-sm whitespace-nowrap">
                Login
              </Link>
              <Link href="/signup" className="btn btn-sm whitespace-nowrap">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="px-3 pb-3 sm:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
