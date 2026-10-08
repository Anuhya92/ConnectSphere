import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { signUp } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Register" };

export default function SignUpPage() {
  return (
    <AuthShell script={["Better", "Together"]}>
      <AuthForm mode="signup" action={signUp} />
    </AuthShell>
  );
}
