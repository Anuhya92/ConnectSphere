import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import { createPost } from "@/app/actions/posts";
import { getViewer } from "@/lib/viewer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Create Post" };

export default async function NewPostPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/posts/new");
  const supabase = await createClient();
  const { data: categories, error } = await supabase.from("categories").select("id, name").order("name");
  if (error) throw new Error(`Could not load categories: ${error.message}`);

  return (
    <div className="mx-auto max-w-2xl">
      <PostForm action={createPost} title="Create Post" submitLabel="Publish" categories={categories ?? []} />
    </div>
  );
}
