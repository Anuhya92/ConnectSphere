"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";
import ImageDropzone from "@/components/ImageDropzone";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  title: string;
  submitLabel: string;
  post?: { title: string; content: string; imageUrl: string | null };
  cancelHref?: string;
};

export default function PostForm({ action, title, submitLabel, post, cancelHref }: Props) {
  const [state, formAction] = useActionState(action, {} as ActionState);

  return (
    <form action={formAction} className="card flex flex-col gap-5 p-5 sm:p-6">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={120}
          placeholder="Enter post title"
          defaultValue={state.fields?.title ?? post?.title}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="content" className="label">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={7}
          maxLength={10000}
          placeholder="Write something…"
          defaultValue={state.fields?.content ?? post?.content}
          className="input resize-y"
        />
      </div>

      <div>
        <span className="label">{post?.imageUrl ? "Current image" : "Add image"}</span>
        <ImageDropzone name="image" currentUrl={post?.imageUrl} />
        {post?.imageUrl && (
          <label className="mt-2 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="removeImage" />
            Remove the current image
          </label>
        )}
      </div>

      <FormMessage state={state} />

      <div className={cancelHref ? "flex justify-end gap-3" : ""}>
        {cancelHref && (
          <Link href={cancelHref} className="btn-secondary">
            Cancel
          </Link>
        )}
        <SubmitButton className={cancelHref ? "btn" : "btn w-full"}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
