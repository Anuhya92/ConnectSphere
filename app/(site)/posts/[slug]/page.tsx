import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { displayName, formatDateTime, getImageUrl, readingTime, timeAgo } from "@/lib/utils";
import { getLikedPostIds } from "@/lib/queries";
import { deletePost } from "@/app/actions/posts";
import { addComment } from "@/app/actions/comments";
import { toggleLike } from "@/app/actions/likes";
import Avatar from "@/components/Avatar";
import BackLink from "@/components/BackLink";
import CommentForm from "@/components/CommentForm";
import CommentItem, { type CommentRow } from "@/components/CommentItem";
import DeleteForm from "@/components/DeleteForm";
import LikeButton from "@/components/LikeButton";
import { ArrowRightIcon, CommentIcon, DotsIcon } from "@/components/Icons";

export async function generateMetadata({ params }: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("title").eq("slug", slug).maybeSingle();
  return { title: data?.title ?? "Post" };
}

export default async function PostPage({
  params,
  searchParams,
}: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const oldestFirst = (Array.isArray(sort) ? sort[0] : sort) === "oldest";

  const supabase = await createClient();
  const [{ data: post, error }, viewer] = await Promise.all([
    supabase
      .from("posts")
      .select(
            "id, title, content, image_path, created_at, updated_at, user_id, profiles!posts_user_id_fkey(username, full_name, avatar_url), likes(count)",
      )
      .eq("slug", slug)
      .maybeSingle(),
    getViewer(),
  ]);

  if (error) throw new Error(`Could not load the post: ${error.message}`);
  if (!post) notFound();

  const user = viewer?.user;
  const isAuthor = user?.id === post.user_id;
  const imageUrl = getImageUrl(post.image_path);
  const authorName = displayName(post.profiles);

  const [{ data: comments, error: commentsError }, liked] = await Promise.all([
    supabase
      .from("comments")
      .select("id, content, created_at, user_id, parent_id, profiles!comments_user_id_fkey(username, full_name, avatar_url)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true }),
    getLikedPostIds(supabase, user?.id, [post.id]),
  ]);

  // Group by parent so replies render under their comment (replies stay oldest-first).
  const topLevel: CommentRow[] = [];
  const repliesByParent = new Map<string, CommentRow[]>();
  for (const c of comments ?? []) {
    if (c.parent_id) {
      repliesByParent.set(c.parent_id, [...(repliesByParent.get(c.parent_id) ?? []), c]);
    } else {
      topLevel.push(c);
    }
  }
  if (!oldestFirst) topLevel.reverse();

  const total = comments?.length ?? 0;
  const { words, minutes } = readingTime(post.content);

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink />

      <article className="card p-4 sm:p-6">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href={post.profiles ? `/profile/${post.profiles.username}` : "#"}>
              <Avatar name={authorName} path={post.profiles?.avatar_url} size={44} />
            </Link>
            <div className="leading-tight">
              <Link
                href={post.profiles ? `/profile/${post.profiles.username}` : "#"}
                className="font-semibold hover:text-primary"
              >
                {authorName}
              </Link>
              <p className="text-xs text-muted" title={formatDateTime(post.created_at)}>
                {timeAgo(post.created_at)}
                {post.updated_at !== post.created_at && ", edited"}
              </p>
            </div>
          </div>

          {isAuthor && (
            <details className="relative">
              <summary
                aria-label="Post options"
                className="flex cursor-pointer list-none items-center rounded-lg p-2 text-muted hover:bg-tint [&::-webkit-details-marker]:hidden"
              >
                <DotsIcon />
              </summary>
              <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-line bg-white p-1 shadow-lg">
                <Link
                  href={`/posts/${slug}/edit`}
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-tint"
                >
                  Edit post
                </Link>
                <DeleteForm
                  variant="menu"
                  action={deletePost.bind(null, post.id)}
                  confirmMessage="Delete this post and all of its comments? This cannot be undone."
                  label="Delete post"
                />
              </div>
            </details>
          )}
        </header>

        <h1 className="mt-4 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {post.title}
        </h1>
        <p className="mt-1 text-xs text-muted">
          {minutes} min read ({words} words)
        </p>
        <p className="mt-3 whitespace-pre-wrap wrap-break-words leading-relaxed text-ink/90">
          {post.content}
        </p>

        {imageUrl && (
          <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg bg-tint">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-5 border-t border-line pt-3">
          <LikeButton
            action={toggleLike.bind(null, post.id, slug)}
            count={post.likes[0]?.count ?? 0}
            liked={liked.has(post.id)}
            loggedIn={!!user}
          />
          <a href="#comments" className="flex items-center gap-1.5 py-1 text-sm text-muted hover:text-primary">
            <CommentIcon /> {total}
          </a>
        </div>

        <section id="comments" aria-labelledby="comments-heading" className="mt-6 scroll-mt-24">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="comments-heading" className="font-semibold">
              Comments ({total})
            </h2>
            {topLevel.length > 1 && (
              <Link
                href={oldestFirst ? `/posts/${slug}#comments` : `/posts/${slug}?sort=oldest#comments`}
                className="link flex items-center gap-1 text-sm"
              >
                {oldestFirst ? "Oldest" : "Newest"} <ArrowRightIcon size={14} />
              </Link>
            )}
          </div>

          {commentsError && (
            <p role="alert" className="alert-error mb-3">
              Could not load comments: {commentsError.message}
            </p>
          )}

          {topLevel.length === 0 ? (
            <p className="rounded-lg bg-tint px-4 py-6 text-center text-sm text-muted">
              No comments yet. Start the conversation.
            </p>
          ) : (
            <ul className="card divide-y divide-line">
              {topLevel.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  repliesByParent={repliesByParent}
                  postId={post.id}
                  slug={slug}
                  postAuthorId={post.user_id}
                  userId={user?.id}
                  isPostAuthor={isAuthor}
                />
              ))}
            </ul>
          )}

          <div className="mt-4">
            {user ? (
              <CommentForm action={addComment.bind(null, post.id, slug, null)} />
            ) : (
              <p className="rounded-lg bg-tint px-4 py-3 text-sm">
                <Link
                  href={`/login?next=${encodeURIComponent(`/posts/${slug}`)}`}
                  className="link"
                >
                  Log in
                </Link>{" "}
                to comment or reply.
              </p>
            )}
          </div>

          {user && (
            <p className="mt-4 rounded-lg bg-tint px-4 py-3 text-sm text-primary">
              You can delete your own comments, and comments on your posts if you are the author.
            </p>
          )}
        </section>
      </article>
    </div>
  );
}
