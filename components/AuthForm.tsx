"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ActionState } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";
import { EyeIcon, EyeOffIcon } from "@/components/Icons";
import { LogoMark } from "@/components/Logo";

type Props = {
  mode: "login" | "signup";
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  next?: string;
};

export default function AuthForm({ mode, action, next }: Props) {
  const [state, formAction] = useActionState(action, {} as ActionState);
  const [show, setShow] = useState(false);
  const isSignup = mode === "signup";

  return (
    <div className="card mx-auto w-full max-w-md p-6 sm:p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Link href="/" className="flex flex-col items-center gap-1" aria-label="ConnectSphere home">
          <LogoMark size={44} />
          <span className="text-lg font-bold tracking-tight">ConnectSphere</span>
        </Link>
        <h1 className="mt-3 text-xl font-semibold">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted">
          {isSignup
            ? "Join our community and start sharing what matters to you."
            : "Login to your account to continue."}
        </p>
      </div>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}

        {isSignup && (
          <div>
            <label htmlFor="full_name" className="label">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              minLength={2}
              maxLength={50}
              autoComplete="name"
              placeholder="Enter your full name"
              defaultValue={state.fields?.full_name}
              className="input"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Enter your email"
            defaultValue={state.fields?.email}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              required
              minLength={6}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "Create a password" : "Enter your password"}
              className="input pr-11"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted hover:text-ink"
            >
              {show ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
        </div>

        <FormMessage state={state} />

        <SubmitButton
          className="btn w-full py-3"
          pendingText={isSignup ? "Creating account…" : "Logging in…"}
        >
          {isSignup ? "Register" : "Login"}
        </SubmitButton>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="link">
              Login
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="link">
              Register
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
