import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PasswordField } from "@/components/login/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Staff Login | MediTap",
  description: "Secure staff access to the MediTap patient record workspace.",
};

export default function LoginPage() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#001019] px-5 py-12 text-brand-100 sm:px-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(123,189,232,0.16),transparent_30%),radial-gradient(circle_at_15%_85%,rgba(73,118,159,0.16),transparent_32%)]" />

      <div className="relative w-full max-w-lg">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-brand-300/80 outline-none transition-colors hover:text-brand-100 focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to Home
        </Link>

        <section
          aria-labelledby="login-title"
          className="rounded-[24px] border border-brand-600/45 bg-brand-950/95 p-6 shadow-[0_30px_90px_-42px_rgba(0,0,0,0.8)] backdrop-blur sm:p-8"
        >
          <div>
            <h1 id="login-title" className="text-xl font-semibold tracking-[-0.025em] text-brand-100">
              MediTap
            </h1>
            <p className="mt-2 text-sm leading-6 text-brand-300/80">
              Sign in with your authorized Firebase account.
            </p>
          </div>

          <form className="mt-7 space-y-5" aria-describedby="auth-status">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-brand-100">
                Username or Email
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username or email…"
                className="border-brand-600/65 bg-white/[0.04] text-brand-100 placeholder:text-brand-300/55 focus:border-brand-300/80 focus:ring-brand-300/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-brand-100">
                Password
              </label>
              <PasswordField
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password…"
                className="border-brand-600/65 bg-white/[0.04] text-brand-100 placeholder:text-brand-300/55 focus:border-brand-300/80 focus:ring-brand-300/20"
              />
            </div>

            <Button type="button" size="lg" className="w-full bg-brand-100 text-brand-950 shadow-none hover:bg-white" aria-describedby="auth-status">
              Log In
            </Button>
          </form>

          <button
            type="button"
            className="mx-auto mt-6 block rounded-md px-2 py-1 text-sm text-brand-300/85 underline-offset-4 transition-colors hover:text-brand-100 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            title="Available after Firebase Authentication is connected"
          >
            Forgot Password?
          </button>

          <p id="auth-status" className="mt-5 text-center text-xs leading-5 text-brand-400/80">
            Firebase Authentication will be connected next.
          </p>
        </section>
      </div>
    </main>
  );
}
