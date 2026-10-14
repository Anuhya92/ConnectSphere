"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, UploadCloudIcon } from "@/components/Icons";

type Props = {
  name: string;
  currentUrl?: string | null;
  currentUrls?: string[];
  multiple?: boolean;
  round?: boolean;
};

export default function ImageDropzone({ name, currentUrl, currentUrls, multiple, round }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    const form = inputRef.current?.form;
    const clear = () => setPreviews([]);
    form?.addEventListener("reset", clear);
    return () => form?.removeEventListener("reset", clear);
  }, []);

  useEffect(() => () => { previews.forEach(URL.revokeObjectURL); }, [previews]);

  function pick(files: FileList | null) {
    setPreviews(Array.from(files ?? []).map((file) => URL.createObjectURL(file)));
  }

  const shown = previews.length ? previews : (currentUrls ?? (currentUrl ? [currentUrl] : []));
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
        const droppedFiles = Array.from(e.dataTransfer.files);
        const files = multiple ? droppedFiles : droppedFiles.slice(0, 1);
        if (files.length && inputRef.current) {
          const dt = new DataTransfer();
          Array.from(files).forEach((file) => dt.items.add(file));
          inputRef.current.files = dt.files;
          pick(dt.files);
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
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => pick(e.target.files)}
      />

      {shown.length ? (
        <span className="flex flex-wrap items-center gap-4 p-4">
          {shown.map((url, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${url}-${index}`} src={url} alt={`Selected ${index + 1}`} className={`${shape} object-cover`} />
          ))}
          <span className="btn-secondary btn-sm pointer-events-none">
            <ImageIcon size={16} /> {multiple ? "Add or change images" : "Change image"}
          </span>
        </span>
      ) : (
        <span className="flex flex-col items-center gap-1 px-4 py-8 text-center">
          <UploadCloudIcon size={30} className="text-primary" />
          <span className="text-sm text-primary">Click to upload or drag and drop</span>
          <span className="text-xs text-muted">PNG, JPG, JPEG, WebP or GIF (max 5 MB each)</span>
        </span>
      )}
    </label>
  );
}
