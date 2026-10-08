import Image from "next/image";
import Link from "next/link";
import { CommentIcon, HeartIcon } from "@/components/Icons";
import type { FeedPost } from "@/lib/queries";
import { displayName, getImageUrl, timeAgo } from "@/lib/utils";

export default function PostRow({ post }: { post: FeedPost }) {
  const imageUrl = getImageUrl(post.image_path);
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="card group flex items-center gap-4 p-3 transition-colors hover:border-primary/40"
    >
      <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-tint sm:h-28 sm:w-36">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="144px"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-full items-center justify-center text-3xl font-bold text-primary/40"
          >
            {post.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold group-hover:text-primary">{post.title}</h2>
        <p className="mt-0.5 text-sm text-muted">
          by {displayName(post.profiles)}, {timeAgo(post.created_at)}
        </p>
        <div className="mt-2 flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <HeartIcon /> {post.likes[0]?.count ?? 0}
          </span>
          <span className="flex items-center gap-1.5">
            <CommentIcon /> {post.comments[0]?.count ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
