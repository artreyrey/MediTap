import { ScanLine, Usb } from "lucide-react";

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">RFID workflow</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Scan</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Connect the ESP32 reader, then tap a registered card to find its patient record.</p>
      </div>
      <section className="grid place-items-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ScanLine className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-xl font-semibold">RFID reader is waiting</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">The hardware bridge will appear here when the USB reader is connected.</p>
        <div className="mt-6 flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground">
          <Usb className="size-4" aria-hidden="true" /> USB connection pending
        </div>
      </section>
    </div>
  );
}
