"use client";

import * as React from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { Printer, ScanLine, Usb } from "lucide-react";

import PatientPrintChart, { type PatientPrintData } from "@/components/PatientPrintChart";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { rfidReader, type ReaderStatus } from "@/lib/rfid-serial";

const text = (value: unknown) => typeof value === "string" ? value : "";
const date = (value: unknown) => value instanceof Timestamp ? value.toDate().toLocaleDateString("en-PH") : "";
const years = (value: unknown) => {
  if (!(value instanceof Timestamp)) return "";
  const born = value.toDate();
  const today = new Date();
  return String(today.getFullYear() - born.getFullYear() - (today < new Date(today.getFullYear(), born.getMonth(), born.getDate()) ? 1 : 0));
};

async function mapPatient(id: string, data: Record<string, unknown>): Promise<PatientPrintData> {
  const emergency = data.emergencyContact as Record<string, unknown> | undefined;
  const conditions = data.conditions as { none?: boolean; items?: unknown[] } | undefined;
  const allergies = data.allergies as { none?: boolean; items?: unknown[] } | undefined;
  const medications = data.medications as { none?: boolean; items?: unknown[] } | undefined;
  const editorId = text(data.updatedBy);
  const editor = editorId ? await getDoc(doc(db, "staffs", editorId)) : null;
  const editorData = editor?.data();
  const updatedBy =
    text(editorData?.fullName) ||
    [text(editorData?.lastName), text(editorData?.middleInitial), text(editorData?.firstName)]
      .filter(Boolean)
      .join(" ") ||
    "Staff";
  return {
    id: text(data.patientId) || id, lastUpdated: date(data.updatedAt),
    fullName: text(data.fullName) || text(data.name), age: years(data.birthDate), sex: text(data.sex),
    contactNumber: text(data.number), email: text(data.email), address: text(data.address),
    emergency: { name: text(emergency?.name), relationship: text(emergency?.relationship), phone: text(emergency?.number), email: text(emergency?.email), address: text(emergency?.address), sameAsPatient: emergency?.sameAsPatientAddress === true },
    conditions: conditions?.none ? [] : (conditions?.items ?? []).map(text),
    allergies: allergies?.none ? [] : (allergies?.items ?? []).map((item) => { const value = item as Record<string, unknown>; return { allergen: text(value?.allergen), reaction: text(value?.reaction) }; }),
    medications: medications?.none ? [] : (medications?.items ?? []).map((item) => { const value = item as Record<string, unknown>; return { name: text(value?.name), dosage: text(value?.dosage), purpose: text(value?.purpose) }; }),
    updatedBy,
  };
}

export function ScanWorkflow() {
  const [status, setStatus] = React.useState<ReaderStatus>(rfidReader.getStatus());
  const [patient, setPatient] = React.useState<PatientPrintData | null>(null);
  const [error, setError] = React.useState("");
  const started = React.useRef(false);

  const scan = React.useCallback(async () => {
    if (rfidReader.getStatus() !== "connected" || started.current) return;
    started.current = true;
    setError("");
    try {
      const uid = await rfidReader.scanCard();
      const snapshot = await getDoc(doc(db, "patients", uid));
      if (!snapshot.exists()) {
        void rfidReader.feedback("rejected");
        throw new Error("No patient record matches this RFID card.");
      }
      void rfidReader.feedback("accepted");
      setPatient(await mapPatient(uid, snapshot.data()));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not scan RFID card.";
      if (message !== "RFID scan cancelled.") setError(message);
    }
  }, []);

  React.useEffect(() => rfidReader.subscribe((nextStatus) => {
    setStatus(nextStatus);
    if (nextStatus === "connected" && !started.current) void scan();
  }), [scan]);
  React.useEffect(() => () => { void rfidReader.cancelScan(); }, []);

  function scanAnother() {
    started.current = false;
    setPatient(null);
    setError("");
    void scan();
  }

  return <div className="mx-auto max-w-5xl space-y-8">
    <div><p className="text-sm font-medium text-primary">RFID workflow</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Scan</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Tap a registered RFID card to find its patient record.</p></div>
    {patient ? <><div className="overflow-x-auto print:hidden"><PatientPrintChart patient={patient} /></div><div className="hidden print:block"><PatientPrintChart patient={patient} /></div><div className="flex justify-end gap-2 print:hidden"><Button type="button" variant="outline" onClick={scanAnother}><ScanLine className="size-4" /> Scan another card</Button><Button type="button" onClick={() => window.print()}><Printer className="size-4" /> Print</Button></div></> : <section className="grid place-items-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center"><span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary"><ScanLine className="size-8" /></span><h2 className="mt-6 text-xl font-semibold">{status === "scanning" ? "Waiting for RFID card" : "RFID reader is waiting"}</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{error || (status === "connected" ? "Tap a registered RFID card now." : "Connect the ESP32 reader, then this page will begin scanning automatically.")}</p><div className="mt-6 flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground"><Usb className="size-4" /> {status === "connected" || status === "scanning" ? "RFID connected" : "USB connection pending"}</div></section>}
  </div>;
}
