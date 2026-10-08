import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-start justify-center gap-4 p-6">
      <Logo />
      <h1 className="heading mt-4">This page doesn&apos;t exist</h1>
      <p className="text-muted">The link may be old, or the post may have been deleted.</p>
      <Link href="/" className="btn">
        Back to home
      </Link>
    </div>
  );
}
