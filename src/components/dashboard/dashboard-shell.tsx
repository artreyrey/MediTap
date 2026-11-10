"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Moon,
  Search,
  ScanLine,
  Sun,
  IdCard,
  UsersRound,
} from "lucide-react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

import { BrandLogo } from "@/components/brand-logo";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/scan", label: "Scan", icon: ScanLine },
  { href: "/dashboard/staff", label: "Staff Information", icon: UsersRound },
  { href: "/dashboard/patients", label: "Patient Information", icon: IdCard },
];

type Theme = "light" | "dark";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [theme, setTheme] = React.useState<Theme>(() => (
    typeof window !== "undefined" && window.localStorage.getItem("meditap-theme") === "light" ? "light" : "dark"
  ));

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("meditap-theme", theme);

    return () => document.documentElement.classList.remove("dark");
  }, [theme]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || !currentUser.emailVerified) {
        setUser(null);
        setCheckingAuth(false);
        void signOut(auth).finally(() => router.replace("/login"));
        return;
      }

      setUser(currentUser);
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, [router]);

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  if (checkingAuth || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading MediTap…</p>
      </main>
    );
  }

  const displayName = user.displayName || user.email?.split("@")[0] || "Staff";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/dashboard" aria-label="MediTap dashboard">
            <BrandLogo />
          </Link>
        </div>

        <div className="px-4 pt-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </div>
        <nav className="mt-3 space-y-1 px-3" aria-label="Dashboard navigation">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
              pathname === "/dashboard" && "bg-accent text-foreground",
            )}
            aria-current={pathname === "/dashboard" ? "page" : undefined}
          >
            <UsersRound className="size-4" aria-hidden="true" /> Overview
          </Link>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  active && "bg-accent text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4" aria-hidden="true" /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-accent/70 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/dashboard" className="lg:hidden" aria-label="MediTap dashboard">
              <BrandLogo compact />
            </Link>
            <button
              type="button"
              className="hidden items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
              aria-label="Search workspace"
            >
              <Search className="size-4" aria-hidden="true" /> Search
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">⌘ K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="grid size-10 place-items-center rounded-lg border border-border bg-card transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
              </button>
              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden" aria-label="Dashboard navigation">
            <Link href="/dashboard" className={cn("whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium", pathname === "/dashboard" && "bg-accent")}>
              Overview
            </Link>
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium text-muted-foreground", isActivePath(pathname, href) && "bg-accent text-foreground")}>
                <Icon className="size-3.5" aria-hidden="true" /> {label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
