import type { ActionState } from "@/lib/utils";

export default function FormMessage({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="alert-error">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p role="status" className="alert-success">
        {state.success}
      </p>
    );
  }
  return null;
}
