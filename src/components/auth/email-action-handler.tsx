"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

import { PasswordField } from "@/components/login/password-field";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";

type View = "loading" | "reset" | "success" | "error";

function getActionError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code === "auth/expired-action-code" || code === "auth/invalid-action-code") {
    return "This link has expired or has already been used. Request a new one from MediTap.";
  }
  if (code === "auth/weak-password") return "Choose a stronger password with at least 6 characters.";
  return "We could not complete this request. Please try again or request a new link.";
}

export function EmailActionHandler() {
  const [action] = React.useState(() => {
    if (typeof window === "undefined") return { mode: null, code: null };
    const params = new URLSearchParams(window.location.search);
    return { mode: params.get("mode"), code: params.get("oobCode") };
  });
  const invalidAction = !action.code || (action.mode !== "verifyEmail" && action.mode !== "resetPassword");
  const [view, setView] = React.useState<View>(() => invalidAction ? "error" : "loading");
  const [message, setMessage] = React.useState(() => invalidAction ? "This email action link is incomplete or unsupported." : "Checking your secure link…");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (invalidAction || !action.code) return;

    if (action.mode === "resetPassword") {
      void verifyPasswordResetCode(auth, action.code)
        .then((accountEmail) => {
          setEmail(accountEmail);
          setView("reset");
        })
        .catch((error) => {
          setView("error");
          setMessage(getActionError(error));
        });
      return;
    }

    void applyActionCode(auth, action.code)
      .then(() => {
        setView("success");
        setMessage("Your email is verified. You can now sign in to MediTap.");
      })
      .catch((error) => {
        setView("error");
        setMessage(getActionError(error));
      });
  }, [action.code, action.mode, invalidAction]);

  async function handlePasswordReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 6) {
      setMessage("Choose a stronger password with at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      await confirmPasswordReset(auth, action.code ?? "", password);
      setView("success");
      setMessage("Your password has been updated. You can now sign in to MediTap.");
    } catch (error) {
      setMessage(getActionError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#001019] px-5 py-12 text-brand-100 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(123,189,232,0.16),transparent_30%),radial-gradient(circle_at_15%_85%,rgba(73,118,159,0.16),transparent_32%)]" />
      <section className="relative w-full max-w-md rounded-[24px] border border-brand-600/45 bg-brand-950/95 p-6 shadow-[0_30px_90px_-42px_rgba(0,0,0,0.8)] backdrop-blur sm:p-8" aria-live="polite">
        <p className="text-sm font-medium text-brand-300">MediTap</p>

        {view === "loading" ? (
          <div className="mt-5 flex items-center gap-3 text-sm text-brand-100"><LoaderCircle className="size-5 animate-spin text-brand-300" aria-hidden="true" /> {message}</div>
        ) : null}

        {view === "reset" ? (
          <>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Set a new password</h1>
            <p className="mt-2 text-sm leading-6 text-brand-300">Choose a new password for {email}.</p>
            <form className="mt-6 space-y-4" onSubmit={handlePasswordReset}>
              <label className="block space-y-2 text-sm font-semibold text-brand-100">New password<PasswordField value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required className="border-brand-600/65 bg-white/[0.04] text-brand-100 placeholder:text-brand-300/55 focus:border-brand-300/80 focus:ring-brand-300/20" /></label>
              <label className="block space-y-2 text-sm font-semibold text-brand-100">Confirm password<PasswordField value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required className="border-brand-600/65 bg-white/[0.04] text-brand-100 placeholder:text-brand-300/55 focus:border-brand-300/80 focus:ring-brand-300/20" /></label>
              {message ? <p role="alert" className="text-sm text-rose-300">{message}</p> : null}
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Updating…" : "Update password"}</Button>
            </form>
          </>
        ) : null}

        {view === "success" || view === "error" ? (
          <>
            <div className={`mt-5 flex size-10 items-center justify-center rounded-full ${view === "success" ? "bg-brand-300/15 text-brand-300" : "bg-rose-300/15 text-rose-300"}`}>
              {view === "success" ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <AlertCircle className="size-5" aria-hidden="true" />}
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{view === "success" ? "All set" : "Link unavailable"}</h1>
            <p className="mt-2 text-sm leading-6 text-brand-300">{message}</p>
            <Button asChild className="mt-6 w-full"><Link href="/login">Back to login</Link></Button>
          </>
        ) : null}
      </section>
    </main>
  );
}
