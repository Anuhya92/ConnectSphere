"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText = "Saving…",
  className = "btn",
  ariaLabel,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} aria-label={ariaLabel}>
      {pending ? pendingText : children}
    </button>
  );
}
