import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import { updatePost } from "@/app/actions/posts";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { getImageUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit Post" };

export default async function EditPostPage({ params }: PageProps<"/posts/[slug]/edit">) {
  const { slug } = await params;

  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(`/posts/${slug}/edit`)}`);

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id, title, content, image_path, user_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!post) notFound();

  if (post.user_id !== viewer.user.id) redirect(`/posts/${slug}`);

  return (
    <div className="mx-auto max-w-2xl">
      <PostForm
        action={updatePost.bind(null, post.id)}
        title="Edit Post"
        submitLabel="Update Post"
        cancelHref={`/posts/${slug}`}
        post={{
          title: post.title,
          content: post.content,
          imageUrl: getImageUrl(post.image_path),
        }}
      />
    </div>
  );
}
