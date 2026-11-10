import { FileText, UserRound } from "lucide-react";

export default function PatientsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Records workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Patient Information</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Search patient profiles, linked documents, and archive history from one place.</p>
      </div>
      <section className="grid place-items-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <UserRound className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-xl font-semibold">Patient database comes next</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">The Firestore patient collection and document workspace will be added after staff access is ready.</p>
        <div className="mt-6 flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground">
          <FileText className="size-4" aria-hidden="true" /> No patient records loaded
        </div>
      </section>
    </div>
  );
}
