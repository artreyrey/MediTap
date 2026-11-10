"use client";

import * as React from "react";
import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { Archive, CalendarDays, KeyRound, Pencil, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";

type StaffRole = "Administrator" | "Operator";
type StaffStatus = "active" | "archived";

type StaffMember = {
  id: string;
  role: StaffRole;
  fullName: string;
  username: string;
  email: string;
  dateJoined: Timestamp | null;
  status: StaffStatus;
  emailVerified: boolean;
};

type StaffForm = Pick<StaffMember, "role" | "fullName" | "username" | "email">;

const emptyForm: StaffForm = {
  role: "Operator",
  fullName: "",
  username: "",
  email: "",
};

function formatDate(value: Timestamp | null) {
  return value ? value.toDate().toISOString().slice(0, 10) : "Pending";
}

function getFirestoreMessage(error: unknown) {
  if (error instanceof FirebaseError && error.code === "permission-denied") {
    return "Firestore denied this action. Check the staff collection rules for authenticated users.";
  }

  return "Something went wrong. Please try again.";
}

export function StaffTable() {
  const [members, setMembers] = React.useState<StaffMember[]>([]);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"active" | "archived" | "all">("active");
  const [form, setForm] = React.useState<StaffForm>(emptyForm);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [actionId, setActionId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "staff"),
      (snapshot) => {
        const nextMembers = snapshot.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            role: data.role === "Administrator" ? "Administrator" : "Operator",
            fullName: typeof data.fullName === "string" ? data.fullName : "Unnamed staff",
            username: typeof data.username === "string" ? data.username : "—",
            email: typeof data.email === "string" ? data.email : "—",
            dateJoined: data.dateJoined instanceof Timestamp ? data.dateJoined : null,
            status: data.status === "archived" ? "archived" : "active",
            emailVerified: data.emailVerified === true,
          } satisfies StaffMember;
        });

        nextMembers.sort((left, right) => (right.dateJoined?.toMillis() ?? 0) - (left.dateJoined?.toMillis() ?? 0));
        setMembers(nextMembers);
        setLoading(false);
      },
      (snapshotError) => {
        setError(true);
        setMessage(getFirestoreMessage(snapshotError));
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
    setMessage("");
    setError(false);
  }

  function openEditModal(member: StaffMember) {
    setEditingId(member.id);
    setForm({ role: member.role, fullName: member.fullName, username: member.username, email: member.email });
    setModalOpen(true);
    setMessage("");
    setError(false);
  }

  async function saveMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError(false);

    try {
      if (editingId) {
        await updateDoc(doc(db, "staff", editingId), { ...form, updatedAt: serverTimestamp() });
        setMessage("Staff information updated.");
      } else {
        await addDoc(collection(db, "staff"), {
          ...form,
          status: "active",
          emailVerified: false,
          dateJoined: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: auth.currentUser?.uid ?? null,
        });
        setMessage("Staff profile added to Firestore.");
      }
      setModalOpen(false);
    } catch (saveError) {
      setError(true);
      setMessage(getFirestoreMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function archiveMember(member: StaffMember) {
    if (!window.confirm(`Archive ${member.fullName}?`)) return;

    setActionId(member.id);
    setMessage("");
    setError(false);
    try {
      await updateDoc(doc(db, "staff", member.id), { status: "archived", updatedAt: serverTimestamp() });
      setMessage(`${member.fullName} was archived.`);
    } catch (archiveError) {
      setError(true);
      setMessage(getFirestoreMessage(archiveError));
    } finally {
      setActionId(null);
    }
  }

  async function resetPassword(member: StaffMember) {
    setActionId(member.id);
    setMessage("");
    setError(false);
    try {
      await sendPasswordResetEmail(auth, member.email);
      setMessage(`If ${member.email} has an account, a reset email is on its way.`);
    } catch (resetError) {
      setError(true);
      setMessage(getFirestoreMessage(resetError));
    } finally {
      setActionId(null);
    }
  }

  const filteredMembers = members.filter((member) => {
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || [member.fullName, member.username, member.email, member.role].some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Access management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Staff Information</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Manage administrator and operator profiles connected to Firebase.</p>
        </div>
        <Button size="sm" onClick={openAddModal}><Plus className="size-4" aria-hidden="true" /> Add Staff</Button>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search staff…" className="bg-background pl-9" aria-label="Search staff" />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-1 text-xs" role="group" aria-label="Filter staff status">
            {(["active", "archived", "all"] as const).map((filter) => (
              <button key={filter} type="button" onClick={() => setStatusFilter(filter)} className={`rounded-md px-3 py-2 capitalize transition-colors ${statusFilter === filter ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {message ? <p role={error ? "alert" : "status"} className={`mb-4 mt-4 text-sm ${error ? "text-rose-300" : "text-primary"}`}>{message}</p> : null}

        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-background text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Full Name</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Account Status</th>
                <th className="px-4 py-3 font-medium">Date Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Loading staff…</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No staff profiles found.</td></tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.id} className="transition-colors hover:bg-accent/40">
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${member.role === "Administrator" ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{member.role}</span></td>
                  <td className="px-4 py-4 font-medium">{member.fullName}</td>
                  <td className="px-4 py-4 text-muted-foreground">{member.username}</td>
                  <td className="px-4 py-4 text-muted-foreground">{member.email}</td>
                  <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${member.status === "archived" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}><span className={`size-1.5 rounded-full ${member.status === "archived" ? "bg-muted-foreground" : "bg-primary"}`} />{member.status === "archived" ? "Archived" : member.emailVerified ? "Verified Active" : "Active"}</span></td>
                  <td className="px-4 py-4 text-muted-foreground"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden="true" /> {formatDate(member.dateJoined)}</span></td>
                  <td className="px-4 py-4"><div className="flex justify-end gap-1">
                    <button type="button" title="Send password reset" aria-label={`Send password reset to ${member.fullName}`} disabled={actionId === member.id} onClick={() => void resetPassword(member)} className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"><KeyRound className="size-4" aria-hidden="true" /></button>
                    <button type="button" title="Edit staff" aria-label={`Edit ${member.fullName}`} onClick={() => openEditModal(member)} className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Pencil className="size-4" aria-hidden="true" /></button>
                    {member.status !== "archived" ? <button type="button" title="Archive staff" aria-label={`Archive ${member.fullName}`} disabled={actionId === member.id} onClick={() => void archiveMember(member)} className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"><Archive className="size-4" aria-hidden="true" /></button> : null}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="staff-modal-title" className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="staff-modal-title" className="text-xl font-semibold">{editingId ? "Edit Staff" : "Add Staff"}</h2><p className="mt-1 text-sm text-muted-foreground">Save the staff profile in Firestore.</p></div>
              <button type="button" onClick={() => setModalOpen(false)} className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Close staff form"><X className="size-4" aria-hidden="true" /></button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={saveMember}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">Role<select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as StaffRole }))} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/20"><option>Administrator</option><option>Operator</option></select></label>
                <label className="space-y-2 text-sm font-medium">Full Name<Input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Juan Dela Cruz" required className="bg-background" /></label>
              </div>
              <label className="block space-y-2 text-sm font-medium">Username<Input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} placeholder="jdelacruz" required className="bg-background" /></label>
              <label className="block space-y-2 text-sm font-medium">Email<Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="staff@meditap.ph" required className="bg-background" /></label>
              <p className="text-xs leading-5 text-muted-foreground">This creates the Firestore profile. The matching Firebase Authentication account must also exist before password reset can work.</p>
              <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save Changes" : "Add Staff"}</Button></div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
