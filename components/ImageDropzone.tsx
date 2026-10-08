"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, UploadCloudIcon } from "@/components/Icons";

type Props = {
  name: string;
  currentUrl?: string | null;
  round?: boolean;
};

export default function ImageDropzone({ name, currentUrl, round }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    const form = inputRef.current?.form;
    const clear = () => setPreview(null);
    form?.addEventListener("reset", clear);
    return () => form?.removeEventListener("reset", clear);
  }, []);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function pick(file: File | undefined) {
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  const shown = preview ?? currentUrl ?? null;
  const shape = round ? "h-28 w-28 rounded-full" : "aspect-video w-full max-w-md rounded-lg";

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const file = e.dataTransfer.files[0];
        if (file && inputRef.current) {
          const dt = new DataTransfer();
          dt.items.add(file);
          inputRef.current.files = dt.files;
          pick(file);
        }
      }}
      className={`block cursor-pointer rounded-lg border border-dashed transition-colors focus-within:ring-4 focus-within:ring-primary/15 ${
        drag ? "border-primary bg-tint" : "border-primary/50 bg-tint/40 hover:bg-tint"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {shown ? (
        <span className="flex flex-wrap items-center gap-4 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown} alt="Selected" className={`${shape} object-cover`} />
          <span className="btn-secondary btn-sm pointer-events-none">
            <ImageIcon size={16} /> Change image
          </span>
        </span>
      ) : (
        <span className="flex flex-col items-center gap-1 px-4 py-8 text-center">
          <UploadCloudIcon size={30} className="text-primary" />
          <span className="text-sm text-primary">Click to upload or drag and drop</span>
          <span className="text-xs text-muted">PNG, JPG, JPEG, WebP or GIF (max 5 MB)</span>
        </span>
      )}
    </label>
  );
}
