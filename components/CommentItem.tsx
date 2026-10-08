import Link from "next/link";
import Avatar from "@/components/Avatar";
import { displayName, timeAgo, type ProfileLite } from "@/lib/utils";
import { addComment, deleteComment } from "@/app/actions/comments";
import DeleteForm from "@/components/DeleteForm";
import ReplyToggle from "@/components/ReplyToggle";

export type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: ProfileLite;
};

type Props = {
  comment: CommentRow;
  repliesByParent: Map<string, CommentRow[]>;
  depth?: number;
  postId: string;
  slug: string;
  /** id of the post's author, used for the "Author" badge */
  postAuthorId: string;
  /** id of the logged-in user, if any */
  userId?: string;
  /** is the logged-in user the author of the post? */
  isPostAuthor: boolean;
};

/** One comment plus (recursively) all replies under it. */
export default function CommentItem({
  comment,
  repliesByParent,
  depth = 0,
  postId,
  slug,
  postAuthorId,
  userId,
  isPostAuthor,
}: Props) {
  const replies = (repliesByParent.get(comment.id) ?? []).slice();
  const canDelete = !!userId && (userId === comment.user_id || isPostAuthor);
  const name = displayName(comment.profiles);

  return (
    <li className={`flex flex-col gap-4 ${depth === 0 ? "p-4" : ""}`}>
      <div className="flex gap-3">
        <Avatar name={name} path={comment.profiles?.avatar_url} size={depth === 0 ? 40 : 32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="leading-tight">
              <div className="flex flex-wrap items-center gap-2">
                {comment.profiles ? (
                  <Link
                    href={`/profile/${comment.profiles.username}`}
                    className="text-sm font-semibold hover:text-primary"
                  >
                    {name}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold">{name}</span>
                )}
                {comment.user_id === postAuthorId && (
                  <span className="rounded-full bg-tint px-2 py-0.5 text-xs font-semibold text-primary">
                    Author
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">{timeAgo(comment.created_at)}</p>
            </div>
            {canDelete && (
              <DeleteForm
                variant="icon"
                label="Delete comment"
                action={deleteComment.bind(null, comment.id, slug)}
                confirmMessage={
                  replies.length
                    ? "Delete this comment and all replies under it?"
                    : "Delete this comment?"
                }
              />
            )}
          </div>

          <p className="mt-1.5 whitespace-pre-wrap wrap-break-word-words text-sm">{comment.content}</p>

          {userId && (
            <div className="mt-1.5">
              <ReplyToggle
                action={addComment.bind(null, postId, slug, comment.id)}
                replyingTo={name}
              />
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        // The line runs under the avatar. Indenting stops after 3 levels so phones stay readable.
        <ul
          className={`flex flex-col gap-4 ${
            depth < 3 ? "ml-5 border-l-2 border-line pl-4 sm:ml-6 sm:pl-5" : ""
          }`}
        >
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              repliesByParent={repliesByParent}
              depth={depth + 1}
              postId={postId}
              slug={slug}
              postAuthorId={postAuthorId}
              userId={userId}
              isPostAuthor={isPostAuthor}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
