"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/utils";
import { HeartIcon } from "@/components/Icons";

type Props = {
  action: () => Promise<ActionState>;
  count: number;
  liked: boolean;
  loggedIn: boolean;
};

function Heart({ liked, count }: { liked: boolean; count: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this post" : "Like this post"}
      className={`flex cursor-pointer items-center gap-1.5 rounded-md py-1 text-sm transition-colors disabled:opacity-60 ${
        liked ? "text-danger" : "text-muted hover:text-danger"
      }`}
    >
      <HeartIcon filled={liked} />
      {count}
    </button>
  );
}

export default function LikeButton({ action, count, liked, loggedIn }: Props) {
  const [state, formAction] = useActionState(action, {} as ActionState);

  if (!loggedIn) {
    return (
      <Link
        href="/login"
        title="Log in to like posts"
        className="flex items-center gap-1.5 py-1 text-sm text-muted hover:text-danger"
      >
        <HeartIcon /> {count}
      </Link>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Heart liked={liked} count={count} />
      {state.error && (
        <span role="alert" className="text-xs text-danger">
          {state.error}
        </span>
      )}
    </form>
  );
}
