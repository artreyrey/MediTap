"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { PasswordField } from "@/components/login/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";

const ACTION_WINDOW_MS = 3 * 60 * 1000;

function formatCountdown(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function createActionDeadline() {
  return Date.now() + ACTION_WINDOW_MS;
}

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Something went wrong. Please try again.";
  }

  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact an administrator.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Unable to sign in. Please try again.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState(false);
  const [verificationDeadline, setVerificationDeadline] = React.useState<number | null>(null);
  const [verificationSeconds, setVerificationSeconds] = React.useState(0);
  const [resetDeadline, setResetDeadline] = React.useState<number | null>(null);
  const [resetSeconds, setResetSeconds] = React.useState(0);

  React.useEffect(() => {
    if (!verificationDeadline && !resetDeadline) return;

    const updateCountdowns = () => {
      const now = Date.now();
      if (verificationDeadline) setVerificationSeconds(Math.max(0, Math.ceil((verificationDeadline - now) / 1000)));
      if (resetDeadline) setResetSeconds(Math.max(0, Math.ceil((resetDeadline - now) / 1000)));
    };

    updateCountdowns();
    const timer = window.setInterval(updateCountdowns, 1000);
    return () => window.clearInterval(timer);
  }, [resetDeadline, verificationDeadline]);

  function showMessage(nextMessage: string, isError = false) {
    setError(isError);
    setMessage(nextMessage);
  }

  async function resolveEmail(value: string) {
    const normalizedValue = value.trim().toLowerCase();
    if (!normalizedValue) return "";
    if (normalizedValue.includes("@")) return normalizedValue;

    const aliasSnapshot = await getDoc(doc(db, "loginAliases", normalizedValue));
    const aliasEmail = aliasSnapshot.data()?.email;
    return typeof aliasEmail === "string" ? aliasEmail : normalizedValue;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const email = await resolveEmail(identifier);
      const credential = await signInWithEmailAndPassword(auth, email, password);

      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        await signOut(auth);
        setVerificationDeadline(createActionDeadline());
        setVerificationSeconds(180);
        showMessage("Verify your email first. A new verification link was sent.", true);
      } else {
        router.replace("/dashboard");
      }
    } catch (authError) {
      showMessage(getAuthErrorMessage(authError), true);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    const normalizedEmail = await resolveEmail(identifier);

    if (!normalizedEmail) {
      showMessage("Enter your email or username first, then choose Forgot Password.", true);
      return;
    }

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setResetDeadline(createActionDeadline());
      setResetSeconds(180);
      showMessage("If that account exists, a password reset email is on its way.");
    } catch (authError) {
      showMessage(getAuthErrorMessage(authError), true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="identifier" className="text-sm font-semibold text-brand-100">
            Email or Username
          </label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            spellCheck={false}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="e.g. nurse1 or nurse@gmail.com"
            className="border-brand-600/65 bg-white/[0.04] text-brand-100 placeholder:text-brand-300/55 focus:border-brand-300/80 focus:ring-brand-300/20"
            required
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password…"
            className="border-brand-600/65 bg-white/[0.04] text-brand-100 placeholder:text-brand-300/55 focus:border-brand-300/80 focus:ring-brand-300/20"
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full bg-brand-100 text-brand-950 shadow-none hover:bg-white" disabled={loading}>
          {loading ? "Working…" : "Log In"}
        </Button>
      </form>

      <button
        type="button"
        className="mx-auto mt-6 block rounded-md px-2 py-1 text-sm text-brand-300/85 underline-offset-4 transition-colors hover:text-brand-100 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handlePasswordReset}
        disabled={loading}
      >
        Forgot Password?
      </button>

      {message ? (
        <p
          role={error ? "alert" : "status"}
          className={`mt-5 text-center text-xs leading-5 ${error ? "text-rose-300" : "text-brand-300"}`}
        >
          {message}
        </p>
      ) : null}
      {verificationDeadline !== null ? (
        <p className={`mt-2 text-center text-xs ${verificationSeconds > 0 ? "text-brand-300" : "text-rose-300"}`}>
          {verificationSeconds > 0 ? `Verification link expires in ${formatCountdown(verificationSeconds)}.` : "Verification link expired. Request a new one by signing in again."}
        </p>
      ) : null}
      {resetDeadline !== null ? (
        <p className={`mt-2 text-center text-xs ${resetSeconds > 0 ? "text-brand-300" : "text-rose-300"}`}>
          {resetSeconds > 0 ? `Password reset link expires in ${formatCountdown(resetSeconds)}.` : "Password reset link expired. Request a new one."}
        </p>
      ) : null}
    </>
  );
}
