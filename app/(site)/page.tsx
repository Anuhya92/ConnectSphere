import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { POST_SELECT, getLikedPostIds, type FeedPost } from "@/lib/queries";
import { displayName } from "@/lib/utils";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";
import MountainArt from "@/components/MountainArt";
import { ArrowRightIcon, ImageIcon, PlusIcon } from "@/components/Icons";

export default async function Home() {
  const viewer = await getViewer();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(50);
  const posts = (data ?? []) as FeedPost[];
  const liked = await getLikedPostIds(supabase, viewer?.user.id, posts.map((p) => p.id));

  if (error) {
    return (
      <p role="alert" className="alert-error">
        Could not load posts: {error.message}
      </p>
    );
  }

  /* ---------- Logged in: the feed ---------- */
  if (viewer) {
    const name = displayName(viewer.profile);
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="card flex items-center gap-3 p-4">
          <Avatar name={name} path={viewer.profile?.avatar_url} size={40} />
          <Link
            href="/posts/new"
            className="flex-1 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-muted hover:border-primary/40"
          >
            What&apos;s on your mind?
          </Link>
          <Link href="/posts/new" className="btn hidden sm:inline-flex">
            <PlusIcon size={16} /> Post
          </Link>
          <Link href="/posts/new" className="btn-secondary px-3 sm:hidden" aria-label="Add image post">
            <ImageIcon size={18} />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="card px-6 py-14 text-center">
            <p className="text-lg font-semibold">No posts yet</p>
            <p className="mt-1 text-sm text-muted">Be the first to share something.</p>
            <Link href="/posts/new" className="btn mt-5">
              Create a post
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} liked={liked.has(post.id)} loggedIn />
          ))
        )}
      </div>
    );
  }

  /* ---------- Visitor: landing page ---------- */
  // "Trending" = most likes and comments among the latest posts.
  const trending = [...posts]
    .sort(
      (a, b) =>
        (b.likes[0]?.count ?? 0) + (b.comments[0]?.count ?? 0) * 2 -
        ((a.likes[0]?.count ?? 0) + (a.comments[0]?.count ?? 0) * 2),
    )
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-10">
      <section className="card overflow-hidden">
        <div className="grid items-center gap-8 bg-linear-to-br from-tint to-white p-6 sm:p-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Connect with people, share your moments
            </h1>
            <p className="max-w-md text-muted">
              Join ConnectSphere to share your thoughts, explore amazing content and be part of a
              community that values you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="btn px-6 py-3">
                Get Started
              </Link>
              <Link href="#trending" className="btn-secondary px-6 py-3">
                Learn More
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-line">
              <MountainArt className="aspect-'4/3' w-full" />
            </div>
            <span className="absolute -right-2 -top-3 rounded-full ring-4 ring-white">
              <Avatar name="Alex Carter" size={44} />
            </span>
            <span className="absolute -bottom-3 left-6 rounded-full ring-4 ring-white">
              <Avatar name="Emma Wilson" size={44} />
            </span>
            <span
              aria-hidden
              className="absolute -bottom-3 -right-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-white"
            >
              <PlusIcon size={20} />
            </span>
          </div>
        </div>
      </section>

      <section id="trending" aria-labelledby="trending-heading" className="scroll-mt-24">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="trending-heading" className="text-xl font-semibold">
            Trending Posts
          </h2>
          <Link href="/explore" className="link flex items-center gap-1.5 text-sm">
            View all <ArrowRightIcon size={16} />
          </Link>
        </div>

        {trending.length === 0 ? (
          <div className="card px-6 py-12 text-center">
            <p className="font-semibold">No posts yet</p>
            <p className="mt-1 text-sm text-muted">Create an account and write the first one.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {trending.map((post) => (
              <PostCard key={post.id} post={post} liked={false} loggedIn={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
