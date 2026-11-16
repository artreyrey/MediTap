"use client";

import * as React from "react";
import { Eye, Pencil } from "lucide-react";
import { collection, onSnapshot, Timestamp as FirestoreTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";

type Patient = {
  id: string;
  patientId: string;
  name: string;
  number: string;
  address: string;
  dateJoined: FirestoreTimestamp | null;
};

function formatDate(value: FirestoreTimestamp | null) {
  return value ? value.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—";
}

export function PatientTable() {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "patients"),
      (snapshot) => {
        setPatients(snapshot.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            patientId: typeof data.patientId === "string" ? data.patientId : item.id,
            name: typeof data.name === "string" ? data.name : typeof data.fullName === "string" ? data.fullName : "Unnamed patient",
            number: typeof data.number === "string" ? data.number : typeof data.phone === "string" ? data.phone : "—",
            address: typeof data.address === "string" ? data.address : "—",
            dateJoined: data.dateJoined instanceof FirestoreTimestamp ? data.dateJoined : null,
          } satisfies Patient;
        }));
        setLoading(false);
      },
      () => {
        setError("Firestore denied this action. Check the patients collection rules for active staff.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-primary">Records workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Patient Information</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">View patient records connected to Firestore.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        {error ? <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p> : null}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-background text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Patient ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Number</th>
                <th className="px-4 py-3 font-semibold">Address</th>
                <th className="px-4 py-3 font-semibold">Date Joined</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading patients…</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No patient records found.</td></tr>
              ) : patients.map((patient) => (
                <tr key={patient.id} className="transition-colors duration-200 hover:bg-accent/40">
                  <td className="px-4 py-4 font-medium">{patient.patientId}</td>
                  <td className="px-4 py-4 font-medium">{patient.name}</td>
                  <td className="px-4 py-4 text-muted-foreground">{patient.number}</td>
                  <td className="px-4 py-4 text-muted-foreground">{patient.address}</td>
                  <td className="px-4 py-4 text-muted-foreground">{formatDate(patient.dateJoined)}</td>
                  <td className="px-4 py-4"><div className="flex justify-end gap-1">
                    <button type="button" disabled title="Show patient information — coming soon" aria-label={`Show information for ${patient.name}`} className="grid size-9 cursor-not-allowed place-items-center rounded-md text-muted-foreground opacity-60"><Eye className="size-4" aria-hidden="true" /></button>
                    <button type="button" disabled title="Edit patient information — coming soon" aria-label={`Edit information for ${patient.name}`} className="grid size-9 cursor-not-allowed place-items-center rounded-md text-muted-foreground opacity-60"><Pencil className="size-4" aria-hidden="true" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
