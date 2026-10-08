import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { getViewer } from "@/lib/viewer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  const username = viewer?.profile?.username;

  return (
    <>
      <Header viewer={viewer} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
        {viewer && <Sidebar username={username} />}
        <main className={`min-w-0 flex-1 ${viewer ? "pb-20 lg:pb-0" : ""}`}>{children}</main>
      </div>
      {viewer && <MobileNav username={username} />}
    </>
  );
}
