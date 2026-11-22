"use client";

import * as React from "react";
import { Eye, Pencil, Plus, Printer, ScanLine, X } from "lucide-react";
import { collection, doc, getDoc, onSnapshot, runTransaction, serverTimestamp, Timestamp as FirestoreTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";
import { rfidReader, type ReaderStatus } from "@/lib/rfid-serial";

type Patient = { id: string; patientId: string; name: string; number: string; address: string; dateJoined: FirestoreTimestamp | null };
type PatientForm = { name: string; address: string; birthDate: string };

const emptyForm: PatientForm = { name: "", address: "", birthDate: "" };

function formatDate(value: FirestoreTimestamp | null) {
  return value ? value.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—";
}

function readerLabel(status: ReaderStatus) {
  if (status === "scanning") return "Waiting for RFID card";
  if (status === "connected") return "RFID reader connected";
  if (status === "connecting") return "Connecting RFID reader…";
  if (status === "unsupported") return "Web Serial is unsupported";
  return "RFID reader not connected";
}

export function PatientTable() {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [scanState, setScanState] = React.useState<"idle" | "waiting" | "form">("idle");
  const [readerStatus, setReaderStatus] = React.useState<ReaderStatus>(rfidReader.getStatus());
  const [rfidUID, setRfidUID] = React.useState("");
  const [form, setForm] = React.useState<PatientForm>(emptyForm);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "patients"), (snapshot) => {
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
    }, () => {
      setError("Firestore denied this action. Check the patients collection rules for active staff.");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => rfidReader.subscribe(setReaderStatus), []);

  async function startScan() {
    setError("");
    setScanState("waiting");
    try {
      if (rfidReader.getStatus() !== "connected") await rfidReader.connect();
      const uid = await rfidReader.scanCard();
      const existingPatient = await getDoc(doc(db, "patients", uid));
      if (existingPatient.exists()) {
        setError("This RFID card is already registered to a patient.");
        setScanState("idle");
        return;
      }
      setRfidUID(uid);
      setForm(emptyForm);
      setScanState("form");
    } catch (scanError) {
      const message = scanError instanceof Error ? scanError.message : "Could not start the RFID scan. Please try again.";
      if (message !== "RFID scan cancelled.") setError(message);
      setScanState("idle");
    }
  }

  async function closeAddPatient() {
    setScanState("idle");
    setRfidUID("");
    setForm(emptyForm);
    await rfidReader.cancelScan();
  }

  async function savePatient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rfidUID || !form.name.trim() || !form.address.trim() || !form.birthDate) return;
    setSaving(true);
    setError("");
    try {
      await runTransaction(db, async (transaction) => {
        const patientRef = doc(db, "patients", rfidUID);
        const counterRef = doc(db, "counters", "patients");
        const [patientSnapshot, counterSnapshot] = await Promise.all([transaction.get(patientRef), transaction.get(counterRef)]);
        if (patientSnapshot.exists()) throw new Error("This RFID card is already registered to a patient.");
        const lastPatientNumber = typeof counterSnapshot.data()?.lastPatientNumber === "number" ? counterSnapshot.data()?.lastPatientNumber : 1;
        const patientNumber = lastPatientNumber + 1;
        transaction.set(counterRef, { lastPatientNumber: patientNumber, updatedAt: serverTimestamp() });
        transaction.set(patientRef, {
          patientId: String(patientNumber).padStart(3, "0"), name: form.name.trim(), address: form.address.trim(),
          birthDate: FirestoreTimestamp.fromDate(new Date(`${form.birthDate}T00:00:00.000Z`)), rfidUID,
          dateJoined: serverTimestamp(), createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: auth.currentUser?.uid ?? null,
        });
      });
      await closeAddPatient();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the patient record.");
    } finally {
      setSaving(false);
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const search = query.trim().toLowerCase();
    return !search || [patient.patientId, patient.name, patient.number, patient.address].some((value) => value.toLowerCase().includes(search));
  });
  const readerReady = readerStatus === "connected" || readerStatus === "scanning";

  return <div className="space-y-5">
    <div><p className="text-sm font-medium text-primary">Records workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Patient Information</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">View patient records connected to Firestore.</p></div>
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="grid gap-3 border-b border-border pb-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="flex justify-start"><Button size="sm" className="rounded-lg" onClick={() => void startScan()}><Plus className="size-4" aria-hidden="true" /> Add Patient</Button></div>
        <label className="relative w-full max-w-sm"><ScanLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Scan to search" className="bg-background pl-9" aria-label="Scan to search patients" /></label>
      </div>
      {error ? <p role="alert" className="mb-4 mt-4 text-sm text-rose-300">{error}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-background text-xs font-semibold uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3 font-semibold">Patient ID</th><th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Number</th><th className="px-4 py-3 font-semibold">Address</th><th className="px-4 py-3 font-semibold">Date Joined</th><th className="px-4 py-3 text-right font-semibold">Actions</th></tr></thead>
        <tbody className="divide-y divide-border">
          {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading patients…</td></tr> : filteredPatients.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No patient records found.</td></tr> : filteredPatients.map((patient) => <tr key={patient.id} className="transition-colors duration-200 hover:bg-accent/40"><td className="px-4 py-4 font-medium">{patient.patientId}</td><td className="px-4 py-4 font-medium">{patient.name}</td><td className="px-4 py-4 text-muted-foreground">{patient.number}</td><td className="px-4 py-4 text-muted-foreground">{patient.address}</td><td className="px-4 py-4 text-muted-foreground">{formatDate(patient.dateJoined)}</td><td className="px-4 py-4"><div className="flex justify-end gap-1"><button type="button" disabled title="Show patient information — coming soon" aria-label={`Show information for ${patient.name}`} className="grid size-9 cursor-not-allowed place-items-center rounded-md text-muted-foreground opacity-60"><Eye className="size-4" aria-hidden="true" /></button><button type="button" disabled title="Edit patient information — coming soon" aria-label={`Edit information for ${patient.name}`} className="grid size-9 cursor-not-allowed place-items-center rounded-md text-muted-foreground opacity-60"><Pencil className="size-4" aria-hidden="true" /></button><button type="button" disabled title="Print patient information — coming soon" aria-label={`Print information for ${patient.name}`} className="grid size-9 cursor-not-allowed place-items-center rounded-md text-muted-foreground opacity-60"><Printer className="size-4" aria-hidden="true" /></button></div></td></tr>)}
        </tbody>
      </table></div>
    </section>
    {scanState !== "idle" ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="patient-modal-title" className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4"><div><h2 id="patient-modal-title" className="text-xl font-semibold">{scanState === "waiting" ? "Tap RFID card" : "Add Patient"}</h2><p className="mt-1 text-sm text-muted-foreground">{scanState === "waiting" ? "Hold an unregistered RFID card near the reader." : "Complete the patient details for the scanned card."}</p></div><button type="button" onClick={() => void closeAddPatient()} className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Close Add Patient"><X className="size-4" aria-hidden="true" /></button></div>
      {scanState === "waiting" ? <div className="mt-6 rounded-xl border border-border bg-background p-5 text-center"><ScanLine className="mx-auto size-8 text-primary" aria-hidden="true" /><div className="mt-3 flex items-center justify-center gap-2 text-sm font-medium"><span className={`size-2.5 rounded-full ${readerReady ? "bg-emerald-500" : readerStatus === "connecting" ? "bg-amber-400" : "bg-rose-500"}`} aria-hidden="true" /><span>{readerLabel(readerStatus)}</span></div><p className="mt-1 text-xs text-muted-foreground">{readerStatus === "scanning" ? "Hold an unregistered RFID card near the reader." : readerStatus === "connecting" ? "Choose the ESP32 in the browser prompt." : "Connect the ESP32 by USB, then try again."}</p><p className="mt-3 text-xs text-muted-foreground">Cancel if you do not want to scan a card.</p></div> : <form className="mt-6 space-y-4" onSubmit={savePatient}><label className="block space-y-2 text-sm font-medium">RFID UID<Input value={rfidUID} readOnly className="bg-background" /></label><label className="block space-y-2 text-sm font-medium">Name<Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Lastname, Firstname MI." required className="bg-background" /></label><label className="block space-y-2 text-sm font-medium">Address<Input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Barangay, City" required className="bg-background" /></label><label className="block space-y-2 text-sm font-medium">Birthdate<Input type="date" value={form.birthDate} onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))} required className="bg-background" /></label><div className="flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="ghost" onClick={() => void closeAddPatient()}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Patient"}</Button></div></form>}
    </section></div> : null}
  </div>;
}
