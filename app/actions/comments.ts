"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/utils";

export async function addComment(
  postId: string,
  slug: string,
  parentId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "Write something before posting your comment." };
  if (content.length > 1000) {
    return { error: "Comments can be at most 1,000 characters.", fields: { content } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be logged in to comment or reply." };

  if (parentId) {
    const { data: parent } = await supabase
      .from("comments")
      .select("id")
      .eq("id", parentId)
      .eq("post_id", postId)
      .maybeSingle();
    if (!parent) {
      return {
        error: "The comment you are replying to no longer exists.",
        fields: { content },
      };
    }
  }

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, content, parent_id: parentId });
  if (error) {
    return {
      error: `Could not add your ${parentId ? "reply" : "comment"}: ${error.message}`,
      fields: { content },
    };
  }

  revalidatePath(`/posts/${slug}`);
  return { success: parentId ? "Reply added." : "Comment added." };
}

export async function deleteComment(
  commentId: string,
  slug: string,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be logged in to delete a comment." };

  // RLS only allows this for the comment's writer or the post's author.
  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select("id");
  if (error) return { error: `Could not delete the comment: ${error.message}` };
  if (!data?.length) return { error: "You aren't allowed to delete this comment." };

  revalidatePath(`/posts/${slug}`);
  return { success: "Comment deleted." };
}
