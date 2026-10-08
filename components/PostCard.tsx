import Image from "next/image";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import LikeButton from "@/components/LikeButton";
import { CommentIcon } from "@/components/Icons";
import { toggleLike } from "@/app/actions/likes";
import type { FeedPost } from "@/lib/queries";
import { displayName, getImageUrl, timeAgo } from "@/lib/utils";

export default function PostCard({
  post,
  liked,
  loggedIn,
}: {
  post: FeedPost;
  liked: boolean;
  loggedIn: boolean;
}) {
  const name = displayName(post.profiles);
  const imageUrl = getImageUrl(post.image_path);
  const comments = post.comments[0]?.count ?? 0;
  const likes = post.likes[0]?.count ?? 0;

  return (
    <article className="card flex flex-col p-4">
      <div className="flex items-center gap-3">
        <Link href={post.profiles ? `/profile/${post.profiles.username}` : "#"}>
          <Avatar name={name} path={post.profiles?.avatar_url} size={40} />
        </Link>
        <div className="leading-tight">
          <Link
            href={post.profiles ? `/profile/${post.profiles.username}` : "#"}
            className="text-sm font-semibold hover:text-primary"
          >
            {name}
          </Link>
          <p className="text-xs text-muted">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      <Link href={`/posts/${post.slug}`} className="group mt-3 block">
        <h2 className="text-base font-semibold group-hover:text-primary">{post.title}</h2>
        <p className="mt-1 line-clamp-3 text-sm text-muted">{post.content}</p>
        {imageUrl && (
          <div className="relative mt-3 aspect-'16/9' overflow-hidden rounded-lg bg-tint">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
            />
          </div>
        )}
      </Link>

      <div className="mt-3 flex items-center gap-5 border-t border-line pt-3">
        <LikeButton
          action={toggleLike.bind(null, post.id, post.slug)}
          count={likes}
          liked={liked}
          loggedIn={loggedIn}
        />
        <Link
          href={`/posts/${post.slug}#comments`}
          className="flex items-center gap-1.5 py-1 text-sm text-muted hover:text-primary"
          aria-label={`${comments} comments`}
        >
          <CommentIcon /> {comments}
        </Link>
      </div>
    </article>
  );
}
