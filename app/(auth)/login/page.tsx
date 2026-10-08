import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { logIn } from "@/app/actions/auth";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Login" };

export default async function LogInPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const nextPath = safeNext(Array.isArray(next) ? next[0] : next);

  return (
    <AuthShell script={["Share", "Explore", "Connect"]}>
      <AuthForm mode="login" action={logIn} next={nextPath} />
    </AuthShell>
  );
}
