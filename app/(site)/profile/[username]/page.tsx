import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { POST_SELECT, getLikedPostIds, type FeedPost } from "@/lib/queries";
import { displayName, timeAgo } from "@/lib/utils";
import Avatar from "@/components/Avatar";
import MountainArt from "@/components/MountainArt";
import PostCard from "@/components/PostCard";

export async function generateMetadata({
  params,
}: PageProps<"/profile/[username]">): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({
  params,
  searchParams,
}: PageProps<"/profile/[username]">) {
  const { username } = await params;
  const { tab } = await searchParams;
  const showComments = (Array.isArray(tab) ? tab[0] : tab) === "comments";

  const supabase = await createClient();
  const [{ data: profile }, viewer] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, created_at")
      .ilike("username", username)
      .maybeSingle(),
    getViewer(),
  ]);
  if (!profile) notFound();

  const [{ data: postsData }, { count: commentCount }, { data: commentsData }] = await Promise.all([
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    showComments
      ? supabase
          .from("comments")
          .select("id, content, created_at, post:posts(title, slug)")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);

  const posts = (postsData ?? []) as FeedPost[];
  const likesReceived = posts.reduce((sum, p) => sum + (p.likes[0]?.count ?? 0), 0);
  const liked = await getLikedPostIds(supabase, viewer?.user.id, posts.map((p) => p.id));

  const name = displayName(profile);
  const isMe = viewer?.user.id === profile.id;
  const joined = new Date(profile.created_at).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  const stats = [
    { label: "Posts", value: posts.length },
    { label: "Comments", value: commentCount ?? 0 },
    { label: "Likes", value: likesReceived },
  ];
  const tabClass = (active: boolean) =>
    `flex-1 border-b-2 py-3 text-center text-sm font-semibold transition-colors ${
      active ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
    }`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <section className="card overflow-hidden">
        <MountainArt className="h-36 w-full sm:h-48" />
        <div className="px-4 pb-0 sm:px-6">
          <div className="-mt-12 flex items-end justify-between gap-3">
            <span className="rounded-full ring-4 ring-white">
              <Avatar name={name} path={profile.avatar_url} size={96} />
            </span>
            {isMe && (
              <Link href="/settings/profile" className="btn-secondary btn-sm mb-1">
                Edit Profile
              </Link>
            )}
          </div>
          <h1 className="mt-3 text-xl font-bold">{name}</h1>
          <p className="text-sm text-muted">
            @{profile.username}, joined {joined}
          </p>

          <dl className="mt-4 grid grid-cols-3 border-y border-line py-3 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="text-lg font-bold">{s.value}</dd>
                <dt className="text-xs text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>

          <nav className="flex" aria-label="Profile sections">
            <Link href={`/profile/${profile.username}`} className={tabClass(!showComments)}>
              Posts
            </Link>
            <Link
              href={`/profile/${profile.username}?tab=comments`}
              className={tabClass(showComments)}
            >
              Comments
            </Link>
          </nav>
        </div>
      </section>

      {showComments ? (
        !commentsData || commentsData.length === 0 ? (
          <p className="card px-6 py-12 text-center text-sm text-muted">No comments yet.</p>
        ) : (
          <ul className="card divide-y divide-line">
            {commentsData.map((c) => (
              <li key={c.id} className="p-4">
                <p className="text-xs text-muted">
                  On{" "}
                  {c.post ? (
                    <Link href={`/posts/${c.post.slug}#comments`} className="link">
                      {c.post.title}
                    </Link>
                  ) : (
                    "a deleted post"
                  )}
                  , {timeAgo(c.created_at)}
                </p>
                <p className="mt-1 whitespace-pre-wrap wrap-break-words text-sm">{c.content}</p>
              </li>
            ))}
          </ul>
        )
      ) : posts.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="font-semibold">No posts yet</p>
          {isMe && (
            <Link href="/posts/new" className="btn mt-4">
              Write your first post
            </Link>
          )}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} liked={liked.has(post.id)} loggedIn={!!viewer} />
        ))
      )}
    </div>
  );
}
