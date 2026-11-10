import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
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
      className="hero-grid relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(123,189,232,0.25),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(73,118,159,0.12),transparent_28%)]" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to Home
        </Link>

        <section
          aria-labelledby="login-title"
          className="rounded-[30px] border border-brand-100/70 bg-white/95 p-7 shadow-[0_28px_80px_-38px_rgba(10,65,116,0.38)] backdrop-blur sm:p-9"
        >
          <BrandLogo />

          <div className="mt-9">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-100/45 text-primary">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <h1 id="login-title" className="mt-6 text-3xl font-bold tracking-[-0.04em] text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 leading-7 text-muted-foreground">
              Sign in with your authorized staff account to continue.
            </p>
          </div>

          <form className="mt-8 space-y-5" aria-describedby="auth-status">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" spellCheck={false} placeholder="staff@meditap.ph" className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password…" className="pl-10" />
              </div>
            </div>

            <Button type="button" size="lg" className="w-full" aria-disabled="true" aria-describedby="auth-status">
              Sign In
            </Button>
          </form>

          <p id="auth-status" role="status" className="mt-5 rounded-xl bg-brand-100/25 px-4 py-3 text-center text-xs leading-5 text-brand-600">
            Firebase Authentication will be connected in the next implementation phase.
          </p>
        </section>
      </div>
    </main>
  );
}
