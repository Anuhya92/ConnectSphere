"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-4 py-12">
      <h1 className="heading">Something went wrong</h1>
      <p role="alert" className="alert-error w-full">
        {error.message || "An unexpected error occurred."}
      </p>
      <button onClick={reset} className="btn">
        Try again
      </button>
    </div>
  );
}
