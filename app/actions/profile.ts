"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  IMAGE_BUCKET,
  fileExtension,
  validateImage,
  type ActionState,
} from "@/lib/utils";

export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const avatar = formData.get("avatar");
  const file = avatar instanceof File && avatar.size > 0 ? avatar : null;
  const fields = { full_name: fullName };

  if (fullName.length < 2 || fullName.length > 50) {
    return { error: "Your name must be 2-50 characters.", fields };
  }
  if (file) {
    const problem = validateImage(file);
    if (problem) return { error: problem, fields };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be logged in.", fields };

  const { data: current } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  if (!current) return { error: "Your profile could not be found.", fields };

  let avatarPath = current.avatar_url;
  let newPath: string | null = null;
  if (file) {
    newPath = `${user.id}/avatar-${crypto.randomUUID()}.${fileExtension(file)}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(newPath, file, { contentType: file.type, cacheControl: "3600" });
    if (uploadError) {
      return { error: `Photo upload failed: ${uploadError.message}`, fields };
    }
    avatarPath = newPath;
  } else if (formData.get("removeAvatar") === "on") {
    avatarPath = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, avatar_url: avatarPath })
    .eq("id", user.id);
  if (error) {
    if (newPath) await supabase.storage.from(IMAGE_BUCKET).remove([newPath]);
    return { error: `Could not save your profile: ${error.message}`, fields };
  }

  if (current.avatar_url && current.avatar_url !== avatarPath) {
    await supabase.storage.from(IMAGE_BUCKET).remove([current.avatar_url]);
  }

  revalidatePath("/", "layout");
  redirect(`/profile/${current.username}`);
}
