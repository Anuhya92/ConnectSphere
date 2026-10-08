"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { safeNext, type ActionState } from "@/lib/utils";

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const fullName = text(formData, "full_name");
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");
  const fields = { full_name: fullName, email };

  if (fullName.length < 2 || fullName.length > 50) {
    return { error: "Please enter your full name (2-50 characters).", fields };
  }
  if (!email) return { error: "Please enter your email address.", fields };
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters.", fields };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { error: error.message, fields };

  if (data.user && data.user.identities?.length === 0) {
    return { error: "An account with this email already exists. Try logging in.", fields };
  }

  if (!data.session) {
    return {
      success: "Account created! Check your inbox and confirm your email, then log in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  const fields = { email };

  if (!email || !password) {
    return { error: "Please enter your email and password.", fields };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message, fields };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
