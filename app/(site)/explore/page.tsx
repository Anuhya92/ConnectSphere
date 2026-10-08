import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { POST_SELECT, type FeedPost } from "@/lib/queries";
import PostRow from "@/components/PostRow";
import SearchBar from "@/components/SearchBar";

export const metadata: Metadata = { title: "Explore" };

export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  const supabase = await createClient();
  let request = supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false });

  if (query) {
  
    request = request.ilike("title", `%${query.replace(/[\\%_]/g, "\\$&")}%`);
  }

  const { data, error } = await request;
  const posts = (data ?? []) as FeedPost[];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <SearchBar query={query} />

      <h1 className="text-xl font-semibold">
        {query ? `Search Results for “${query}”` : "Explore all posts"}
      </h1>

      {error ? (
        <p role="alert" className="alert-error">
          Could not load posts: {error.message}
        </p>
      ) : posts.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="font-semibold">
            {query ? "No posts have that title." : "No posts yet."}
          </p>
          <p className="mt-1 text-sm text-muted">
            {query ? "Try a different word." : "Log in and write the first one."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
