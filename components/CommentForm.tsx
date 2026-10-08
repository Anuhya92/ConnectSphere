"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import type { ActionState } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  placeholder?: string;
  label?: string;
  submitLabel?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function CommentForm({
  action,
  placeholder = "Add a comment…",
  label = "Add a comment",
  submitLabel = "Send",
  onSuccess,
  onCancel,
}: Props) {
  const [state, formAction] = useActionState(action, {} as ActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state]); 

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex items-start gap-2">
        <textarea
          id={id}
          name="content"
          required
          rows={1}
          maxLength={1000}
          placeholder={placeholder}
          defaultValue={state.error ? state.fields?.content : undefined}
          className="input min-h-11 resize-y"
        />
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <SubmitButton pendingText="Sending…">{submitLabel}</SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
