import { Activity, Archive, FileText, ScanLine, UsersRound } from "lucide-react";

const overviewCards = [
  { label: "RFID Scanner", value: "Ready to connect", detail: "USB reader status", icon: ScanLine },
  { label: "Staff Accounts", value: "Firestore connected", detail: "Manage verified access", icon: UsersRound },
  { label: "Patient Records", value: "Coming next", detail: "Patient database workspace", icon: FileText },
  { label: "Archive", value: "Safe by default", detail: "Records remain recoverable", icon: Archive },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">MediTap workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Overview</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Connect the RFID workflow, staff access, and patient records from one focused workspace.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Workspace summary">
        {overviewCards.map(({ label, value, detail, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-4 text-lg font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Ready for the next record</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Use Scan to prepare the RFID reader, or open Staff Information to manage the accounts that can access MediTap.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
