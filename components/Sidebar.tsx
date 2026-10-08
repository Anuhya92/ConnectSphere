import Link from "next/link";
import NavLink from "@/components/NavLink";
import { logOut } from "@/app/actions/auth";
import {
  CompassIcon,
  HomeIcon,
  LogoutIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
} from "@/components/Icons";

const item = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";

export default function Sidebar({ username }: { username?: string }) {
  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-56 shrink-0 flex-col lg:flex">
      <nav aria-label="Main" className="flex flex-col gap-1">
        <NavLink href="/" exact className={item}>
          <HomeIcon /> Home
        </NavLink>
        <NavLink href="/explore" className={item}>
          <CompassIcon /> Explore
        </NavLink>
        <Link href="/posts/new" className="btn mt-3 justify-start gap-3 px-3 py-2.5">
          <PlusIcon /> Create Post
        </Link>
      </nav>

      <nav aria-label="Account" className="mt-auto flex flex-col gap-1">
        {username && (
          <NavLink href={`/profile/${username}`} className={item}>
            <UserIcon /> Profile
          </NavLink>
        )}
        <NavLink href="/settings/profile" className={item}>
          <SettingsIcon /> Settings
        </NavLink>
        <form action={logOut}>
          <button type="submit" className={`${item} w-full cursor-pointer text-ink/80 hover:bg-tint/70`}>
            <LogoutIcon /> Logout
          </button>
        </form>
      </nav>
    </aside>
  );
}
