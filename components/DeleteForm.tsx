"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";
import { TrashIcon } from "@/components/Icons";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  confirmMessage: string;
  label?: string;
  variant?: "button" | "icon" | "menu";
};

export default function DeleteForm({
  action,
  confirmMessage,
  label = "Delete",
  variant = "button",
}: Props) {
  const [state, formAction] = useActionState(action, {} as ActionState);

  const styles = {
    button: "btn-danger",
    icon: "inline-flex cursor-pointer rounded-lg p-2 text-primary transition-colors hover:bg-red-50 hover:text-danger",
    menu: "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-danger hover:bg-red-50",
  }[variant];

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      className="flex flex-col items-start gap-1"
    >
      <SubmitButton pendingText="Deleting…" className={styles} ariaLabel={label}>
        {variant === "icon" ? <TrashIcon size={18} /> : label}
      </SubmitButton>
      {state.error && (
        <p role="alert" className="max-w-56 text-xs text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
