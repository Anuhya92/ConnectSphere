"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/utils";

export async function toggleLike(
  postId: string,
  slug: string,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in to like posts." };

  const { data: existing } = await supabase
    .from("likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id)
    : await supabase.from("likes").insert({ post_id: postId, user_id: user.id });

  if (error) return { error: `Could not update your like: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/posts/${slug}`);
  return {};
}
