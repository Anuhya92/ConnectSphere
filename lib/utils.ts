import { SUPABASE_URL } from "@/lib/supabase/env";

export const IMAGE_BUCKET = "post-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type ActionState = {
  error?: string;
  success?: string;
  fields?: Record<string, string>;
};

/** "Hello World! 2024" -> "hello-world-2024" */
export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function randomSuffix(length = 6) {
  return crypto.randomUUID().replace(/-/g, "").slice(0, length);
}

export function getImageUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/";
}


export function validateImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Image must be a JPG, PNG, WebP or GIF file.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image is too large (max 5 MB).";
  }
  return null;
}

export function fileExtension(file: File) {
  const fromType = file.type.split("/")[1];
  return fromType === "jpeg" ? "jpg" : fromType;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.ceil(words / 200)) };
}


export function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export type ProfileLite = {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
} | null;


export function displayName(profile: ProfileLite) {
  return profile?.full_name || profile?.username || "Unknown";
}
