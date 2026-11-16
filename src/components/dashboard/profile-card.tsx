"use client";

import * as React from "react";
import { CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type Profile = {
  role: string;
  name: string;
  email: string;
  dateJoined: Timestamp | null;
};

function formatDate(value: Timestamp | null) {
  return value ? value.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—";
}

export function ProfileCard() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    return onSnapshot(doc(db, "staffs", user.uid), (snapshot) => {
      const data = snapshot.data();
      const firstName = typeof data?.firstName === "string" ? data.firstName : "";
      const storedMiddleInitial = typeof data?.middleInitial === "string" ? data.middleInitial.replace(/\./g, "") : "";
      const middleInitial = storedMiddleInitial ? `${storedMiddleInitial}.` : "";
      const lastName = typeof data?.lastName === "string" ? data.lastName : "";
      setProfile({
        role: data?.role === "Administrator" ? "Administrator" : "Operator",
        name: [lastName, middleInitial, firstName].filter(Boolean).join(" ") || (typeof data?.fullName === "string" ? data.fullName : "Staff member"),
        email: typeof data?.email === "string" ? data.email : user.email ?? "—",
        dateJoined: data?.dateJoined instanceof Timestamp ? data.dateJoined : null,
      });
    }, () => setError("Could not load your staff profile."));
  }, []);

  const details = profile ? [
    { label: "Role", value: profile.role, icon: ShieldCheck },
    { label: "Name", value: profile.name, icon: UserRound },
    { label: "Email", value: profile.email, icon: Mail },
    { label: "Date Joined", value: formatDate(profile.dateJoined), icon: CalendarDays },
  ] : [];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-primary">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Profile</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Your MediTap staff account information.</p>
      </div>

      <section className="max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : !profile ? <p className="text-sm text-muted-foreground">Loading profile…</p> : (
          <dl className="divide-y divide-border rounded-xl border border-border">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-4">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" aria-hidden="true" /></span>
                <div className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-foreground">{value}</dd></div>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}
