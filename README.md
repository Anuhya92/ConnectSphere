# ConnectSphere

A social blogging app: register, write posts with pictures, like, comment and reply.
Built with **Next.js 16 (App Router)**, **Supabase** (Auth, PostgreSQL, Storage) and **Tailwind CSS 4**.

## Features (assignment checklist)

| Requirement | Where it is |
|---|---|
| Register, login, logout with **Supabase Auth** | `app/actions/auth.ts`, `/signup`, `/login` |
| Create-post page blocked for visitors | `proxy.ts` + check inside `app/(site)/posts/new/page.tsx` |
| Fetch + revalidate data, show errors to the user | Server Components, `revalidatePath` in `app/actions/*`, inline error messages |
| Tables: users (Supabase Auth + `profiles`), `posts`, `comments`, `likes` | `supabase/schema.sql` |
| Post has title, content, slug and belongs to its author (1-to-many) | `posts.user_id -> profiles.id` |
| Images in a storage bucket (attach and change) | bucket `post-images`, `components/ImageDropzone.tsx` |
| Everyone reads posts; owners create / update / delete | Row Level Security policies + server actions |
| Only the author opens the edit page | `app/(site)/posts/[slug]/edit/page.tsx` |
| Search by title | `/explore?q=...` |
| Comments (add, delete own, post author deletes any) + replies | `app/actions/comments.ts`, `components/CommentItem.tsx` |
| Responsive, modern CSS | Tailwind CSS 4, sidebar on desktop, bottom tabs on phones |

## Setup from zero

### 1. Create the Supabase project
1. Go to <https://supabase.com/dashboard> and click **New project**. Pick a name and a database password, then wait until it is ready.
2. Open **SQL Editor -> New query**, paste the whole file `supabase/schema.sql` and press **Run**.
   You should see "Success. No rows returned". (It is safe to run more than once.)
3. **Authentication -> Providers -> Email**: switch **off** "Confirm email" while developing.
   (If it stays on, new users must click the link in their inbox before they can log in.)
4. **Project Settings -> API**: copy the **Project URL** and the **anon / publishable key**.

### 2. Run the website
```bash
npm install
cp .env.example .env.local      # on Windows: copy .env.example .env.local
# open .env.local and paste your URL and key (URL has no /rest/v1/ at the end)
npm run dev
```
Open <http://localhost:3000>.

### 3. Try it
1. Click **Sign Up** and create an account (Full Name, Email, Password).
2. **Create Post** with a title, text and a picture. Open it, like it, comment, reply.
3. Log in as a second user and comment on the first user's post.
4. As the post's author, delete that comment. Try **Edit post** and change the image.
5. Use the search bar to find a post by title.

## Project structure

```
app/
  (auth)/login, signup        full-page forms
  (site)/                     header + sidebar layout
    page.tsx                  landing page (visitors) / feed (logged in)
    explore/                  all posts + search results
    posts/new, [slug], [slug]/edit
    profile/[username]        public profile, Posts / Comments tabs
    settings/profile          change name and photo
  actions/                    server actions: auth, posts, comments, likes, profile
components/                   UI pieces (cards, forms, sidebar, ...)
lib/supabase/                 browser, server and proxy Supabase clients
lib/                          helpers, shared queries
proxy.ts                      refreshes the session, protects pages
supabase/schema.sql           the complete database setup
```

## Security in one paragraph
Rules are enforced in the database with **Row Level Security**, not only in the UI.
Even if someone calls the API directly, they cannot edit another person's post,
delete someone else's comment or write to another user's storage folder.
