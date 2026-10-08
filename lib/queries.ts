import type { createClient } from "@/lib/supabase/server";
import type { ProfileLite } from "@/lib/utils";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export const POST_SELECT =
  "id, title, slug, content, image_path, created_at, user_id, profiles!posts_user_id_fkey(username, full_name, avatar_url), comments(count), likes(count)";

export type FeedPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_path: string | null;
  created_at: string;
  user_id: string;
  profiles: ProfileLite;
  comments: { count: number }[];
  likes: { count: number }[];
};


export async function getLikedPostIds(
  supabase: Supabase,
  userId: string | undefined,
  postIds: string[],
) {
  if (!userId || postIds.length === 0) return new Set<string>();
  const { data } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);
  return new Set((data ?? []).map((l) => l.post_id));
}
