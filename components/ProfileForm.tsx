"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";
import ImageDropzone from "@/components/ImageDropzone";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  fullName: string;
  avatarUrl: string | null;
  cancelHref: string;
};

export default function ProfileForm({ action, fullName, avatarUrl, cancelHref }: Props) {
  const [state, formAction] = useActionState(action, {} as ActionState);

  return (
    <form action={formAction} className="card flex flex-col gap-5 p-5 sm:p-6">
      <h1 className="text-xl font-semibold">Edit profile</h1>

      <div>
        <label htmlFor="full_name" className="label">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          minLength={2}
          maxLength={50}
          defaultValue={state.fields?.full_name ?? fullName}
          className="input"
        />
      </div>

      <div>
        <span className="label">Profile photo</span>
        <ImageDropzone name="avatar" currentUrl={avatarUrl} round />
        {avatarUrl && (
          <label className="mt-2 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="removeAvatar" />
            Remove my photo
          </label>
        )}
      </div>

      <FormMessage state={state} />

      <div className="flex justify-end gap-3">
        <Link href={cancelHref} className="btn-secondary">
          Cancel
        </Link>
        <SubmitButton>Save changes</SubmitButton>
      </div>
    </form>
  );
}
