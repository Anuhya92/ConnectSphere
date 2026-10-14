"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  IMAGE_BUCKET,
  fileExtension,
  randomSuffix,
  MAX_POST_IMAGES,
  slugify,
  validateImage,
  type ActionState,
} from "@/lib/utils";

type Supabase = Awaited<ReturnType<typeof createClient>>;
function readPostForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const images = formData.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
  const fields = { title, content, category_id: categoryId };

  let error: string | null = null;
  if (!title) error = "Please give your post a title.";
  else if (title.length > 120)
    error = "The title can be at most 120 characters.";
  else if (!content) error = "Please write some content.";
  else if (content.length > 10000)
    error = "The content can be at most 10,000 characters.";
  else if (!categoryId) error = "Please choose a category.";
  else if (images.length > MAX_POST_IMAGES) error = `Choose up to ${MAX_POST_IMAGES} images.`;
  else {
    for (const file of images) {
      const issue = validateImage(file);
      if (issue) { error = issue; break; }
    }
  }

  return { title, content, categoryId, images, fields, error };
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
  ...paths: (string | null | undefined)[]
) {
  const existing = paths.filter((path): path is string => !!path);
  if (existing.length) await supabase.storage.from(IMAGE_BUCKET).remove(existing);
}

async function uploadImages(supabase: Supabase, userId: string, files: File[]) {
  const paths: string[] = [];
  for (const file of files) {
    const uploaded = await uploadImage(supabase, userId, file);
    if (uploaded.error) {
      await removeImage(supabase, ...paths);
      return { paths: null, error: uploaded.error };
    }
    if (uploaded.path) paths.push(uploaded.path);
  }
  return { paths, error: null };
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

  const { title, content, categoryId, images, fields, error } = readPostForm(formData);
  if (error) return { error, fields };

  const upload = await uploadImages(supabase, user.id, images);
  if (upload.error) return { error: `Image upload failed: ${upload.error}`, fields };
  const imagePaths = upload.paths ?? [];

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
        image_paths: imagePaths,
        category_id: categoryId,
        user_id: user.id,
      });
    insertError = err;
    if (!err || err.code !== "23505") break;
  }

  if (insertError) {
    await removeImage(supabase, ...imagePaths); // don't leave orphaned uploads
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

  const { title, content, categoryId, images, fields, error } = readPostForm(formData);
  if (error) return { error, fields };

  const { data: existing } = await supabase
    .from("posts")
    .select("id, slug, image_paths, user_id")
    .eq("id", postId)
    .maybeSingle();
  if (!existing) return { error: "This post no longer exists.", fields };
  if (existing.user_id !== user.id) {
    return { error: "You can only edit your own posts.", fields };
  }

  let imagePaths: string[] = existing.image_paths ?? [];
  let newUploadPaths: string[] = [];

  if (images.length) {
    const upload = await uploadImages(supabase, user.id, images);
    if (upload.error) return { error: `Image upload failed: ${upload.error}`, fields };
    newUploadPaths = upload.paths ?? [];
    imagePaths = newUploadPaths;
  } else if (formData.get("removeImages") === "on") {
    imagePaths = [];
  }

  const { data: updated, error: updateError } = await supabase
    .from("posts")
    .update({ title, content, image_paths: imagePaths, category_id: categoryId })
    .eq("id", postId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    await removeImage(supabase, ...newUploadPaths);
    return {
      error: `Could not save your changes: ${updateError?.message ?? "permission denied."}`,
      fields,
    };
  }

  // Old image is no longer referenced -> delete it from the bucket.
  const staleImages = (existing.image_paths ?? []).filter((path: string) => !imagePaths.includes(path));
  if (staleImages.length) {
    await removeImage(supabase, ...staleImages);
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
    .select("id, slug, image_paths")
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

  await removeImage(supabase, ...(post.image_paths ?? []));

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/posts/${post.slug}`);
  redirect("/");
}
