import NavLink from "@/components/NavLink";
import { logOut } from "@/app/actions/auth";
import { CompassIcon, HomeIcon, LogoutIcon, PlusIcon, UserIcon } from "@/components/Icons";

const item = "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium";

export default function MobileNav({ username }: { username?: string }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white lg:hidden"
    >
      <NavLink href="/" exact className={item} activeClassName="text-primary" idleClassName="text-muted">
        <HomeIcon size={22} /> Home
      </NavLink>
      <NavLink href="/explore" className={item} activeClassName="text-primary" idleClassName="text-muted">
        <CompassIcon size={22} /> Explore
      </NavLink>
      <NavLink href="/posts/new" className={item} activeClassName="text-primary" idleClassName="text-primary">
        <PlusIcon size={22} /> Post
      </NavLink>
      <NavLink
        href={username ? `/profile/${username}` : "/settings/profile"}
        className={item}
        activeClassName="text-primary"
        idleClassName="text-muted"
      >
        <UserIcon size={22} /> Profile
      </NavLink>
      <form action={logOut} className="flex flex-1">
        <button type="submit" className={`${item} w-full cursor-pointer text-muted`}>
          <LogoutIcon size={22} /> Logout
        </button>
      </form>
    </nav>
  );
}
