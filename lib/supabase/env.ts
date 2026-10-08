const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();

export const SUPABASE_URL = rawUrl ? new URL(rawUrl).origin : "";
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
