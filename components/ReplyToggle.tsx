"use client";

import { useState } from "react";
import type { ActionState } from "@/lib/utils";
import CommentForm from "@/components/CommentForm";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  replyingTo: string;
};

export default function ReplyToggle({ action, replyingTo }: Props) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer py-2 pr-4 text-xs font-semibold text-primary hover:underline"
      >
        Reply
      </button>
    );
  }

  return (
    <div className="mt-2 w-full">
      <CommentForm
        action={action}
        label={`Reply to ${replyingTo}`}
        placeholder={`Reply to ${replyingTo}…`}
        submitLabel="Reply"
        onSuccess={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
