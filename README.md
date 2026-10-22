# ConnectSphere

A social blogging web app built with **Next.js** and **Supabase**. Users register, write posts with several pictures, choose a category, comment and reply in threads, and like posts.

## Features

- Register, log in and log out (Supabase Auth)
- Create, edit and delete your own posts (everybody can read posts)
- Up to 5 images per post, with a gallery on the post page
- Categories, with a page for each category: `/categories/[slug]`
- Search posts by title
- Nested comments (replies shown as a chain). Comment owners and post authors can delete comments
- Likes and public profiles
- Protected pages for visitors, responsive design, clear error messages

## Environment keys

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yhadxwmuxyeityzgcewz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Pnl5DCVa69KIWENa13mrKQ_Ov6yDzKv
```

- The URL is the base address of the Supabase project .
- The key is the **publishable (anon) key**. It is meant to be public, because Row Level Security in the database decides what each user may do.

## What is in Supabase

**Auth:** email and password accounts.

**Tables:**

| Table | What it stores |
|---|---|
| `profiles` | One row per user: username, full name, profile photo |
| `categories` | Post categories: name and slug |
| `posts` | Posts: title, slug, content, author, category |
| `post_images` | Pictures of a post and their order |
| `comments` | Comments and replies (`parent_id` links a reply to its comment) |
| `likes` | Which user liked which post (once per post) |

**Relations:** one user has many posts, comments and likes. One category has many posts. One post has many pictures, comments and likes. One comment has many replies.

**Security:** Row Level Security is on for every table. Everybody can read. Only the owner can create, edit or delete their own posts, pictures and likes. A comment can be deleted by its writer or by the author of the post.

## File storage (photos)

All pictures are in one **public** bucket named `post-images`.

- Allowed: JPG, PNG, WebP, GIF, up to 5 MB each
- Stored as `post-images/<user-id>/<random-name>.jpg`, so every user has their own folder
- Used for post pictures (up to 5 per post) and profile photos
- Users can only upload to and delete from their own folder
- The file path is saved in `post_images.path` (posts) or `profiles.avatar_url` (profile photo)
- Pictures are uploaded straight from the browser, and files are deleted from the bucket when a picture or post is removed

## Run the project

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use `npm run build` to make a production build.

## Deploy

Push to GitHub, import the project in Vercel and add the two environment keys above under Environment Variables.