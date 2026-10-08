"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/Icons";

export default function BackLink() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:underline"
    >
      <ArrowLeftIcon size={16} /> Back
    </button>
  );
}
