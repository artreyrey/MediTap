"use client";

import * as React from "react";
import { FirebaseError } from "firebase/app";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { PasswordField } from "@/components/login/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";

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
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState(false);

  function showMessage(nextMessage: string, isError = false) {
    setError(isError);
    setMessage(nextMessage);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        await signOut(auth);
        showMessage("Verify your email first. A new verification link was sent.", true);
      } else {
        showMessage("Signed in successfully. Your MediTap session is ready.");
      }
    } catch (authError) {
      showMessage(getAuthErrorMessage(authError), true);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      showMessage("Enter your email address first, then choose Forgot Password.", true);
      return;
    }

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
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
          <label htmlFor="email" className="text-sm font-semibold text-brand-100">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email…"
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
    </>
  );
}
