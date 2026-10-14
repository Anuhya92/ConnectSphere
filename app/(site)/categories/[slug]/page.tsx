import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { POST_SELECT, type FeedPost } from "@/lib/queries";
import PostRow from "@/components/PostRow";

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("name").eq("slug", slug).maybeSingle();
  return { title: data ? `${data.name} Posts` : "Category" };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category, error: categoryError } = await supabase.from("categories").select("id, name, slug").eq("slug", slug).maybeSingle();
  if (categoryError) throw new Error(`Could not load category: ${categoryError.message}`);
  if (!category) notFound();

  const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("category_id", category.id).order("created_at", { ascending: false });
  const posts = (data ?? []) as FeedPost[];
  return <div className="mx-auto flex max-w-3xl flex-col gap-5">
    <Link href="/explore" className="link text-sm">← Explore all posts</Link>
    <h1 className="text-2xl font-bold">{category.name} posts</h1>
    {error ? <p role="alert" className="alert-error">Could not load posts: {error.message}</p> : posts.length ? <div className="flex flex-col gap-3">{posts.map((post) => <PostRow key={post.id} post={post} />)}</div> : <div className="card px-6 py-12 text-center text-muted">No posts in this category yet.</div>}
  </div>;
}
