"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  IMAGE_BUCKET,
  fileExtension,
  randomSuffix,
  slugify,
  validateImage,
  type ActionState,
} from "@/lib/utils";

type Supabase = Awaited<ReturnType<typeof createClient>>;
function readPostForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const image = formData.get("image");
  const file = image instanceof File && image.size > 0 ? image : null;
  const fields = { title, content };

  let error: string | null = null;
  if (!title) error = "Please give your post a title.";
  else if (title.length > 120)
    error = "The title can be at most 120 characters.";
  else if (!content) error = "Please write some content.";
  else if (content.length > 10000)
    error = "The content can be at most 10,000 characters.";
  else if (file) error = validateImage(file);

  return { title, content, file, fields, error };
}

async function uploadImage(supabase: Supabase, userId: string, file: File) {
  const path = `${userId}/${crypto.randomUUID()}.${fileExtension(file)}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "3600" });
  return { path: error ? null : path, error: error?.message ?? null };
}

async function removeImage(
  supabase: Supabase,
  path: string | null | undefined,
) {
  if (path) await supabase.storage.from(IMAGE_BUCKET).remove([path]);
}

export async function createPost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be logged in to create a post." };

  const { title, content, file, fields, error } = readPostForm(formData);
  if (error) return { error, fields };

  let imagePath: string | null = null;
  if (file) {
    const upload = await uploadImage(supabase, user.id, file);
    if (upload.error)
      return { error: `Image upload failed: ${upload.error}`, fields };
    imagePath = upload.path;
  }

  let slug = "";
  let insertError: { code?: string; message: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    slug = `${slugify(title) || "post"}-${randomSuffix()}`;
    const { error: err } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        slug,
        image_path: imagePath,
        user_id: user.id,
      });
    insertError = err;
    if (!err || err.code !== "23505") break;
  }

  if (insertError) {
    await removeImage(supabase, imagePath); // don't leave an orphaned upload
    return {
      error: `Could not create the post: ${insertError.message}`,
      fields,
    };
  }

  revalidatePath("/");
  revalidatePath("/explore");
  redirect(`/posts/${slug}`);
}

export async function updatePost(
  postId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be logged in to edit a post." };

  const { title, content, file, fields, error } = readPostForm(formData);
  if (error) return { error, fields };

  const { data: existing } = await supabase
    .from("posts")
    .select("id, slug, image_path, user_id")
    .eq("id", postId)
    .maybeSingle();
  if (!existing) return { error: "This post no longer exists.", fields };
  if (existing.user_id !== user.id) {
    return { error: "You can only edit your own posts.", fields };
  }

  let imagePath = existing.image_path;
  let newUploadPath: string | null = null;

  if (file) {
    const upload = await uploadImage(supabase, user.id, file);
    if (upload.error)
      return { error: `Image upload failed: ${upload.error}`, fields };
    newUploadPath = upload.path;
    imagePath = upload.path;
  } else if (formData.get("removeImage") === "on") {
    imagePath = null;
  }

  const { data: updated, error: updateError } = await supabase
    .from("posts")
    .update({ title, content, image_path: imagePath })
    .eq("id", postId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    await removeImage(supabase, newUploadPath);
    return {
      error: `Could not save your changes: ${updateError?.message ?? "permission denied."}`,
      fields,
    };
  }

  // Old image is no longer referenced -> delete it from the bucket.
  if (existing.image_path && existing.image_path !== imagePath) {
    await removeImage(supabase, existing.image_path);
  }

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/posts/${existing.slug}`);
  redirect(`/posts/${existing.slug}`);
}

export async function deletePost(postId: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be logged in to delete a post." };

  const { data: post } = await supabase
    .from("posts")
    .select("id, slug, image_path")
    .eq("id", postId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!post) return { error: "Post not found, or it isn't yours to delete." };

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);
  if (error) return { error: `Could not delete the post: ${error.message}` };

  await removeImage(supabase, post.image_path);

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/posts/${post.slug}`);
  redirect("/");
}
