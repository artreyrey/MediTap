import {
  Activity,
  Check,
  CreditCard,
  FileText,
  HeartPulse,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export function PatientCardPreview() {
  return (
    <div className="preview-enter relative mx-auto w-full max-w-[570px] lg:mr-0" aria-hidden="true">
      <div className="absolute -left-8 top-12 size-40 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="absolute -right-10 bottom-0 size-56 rounded-full bg-brand-600/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/76 p-3 shadow-[0_35px_90px_-45px_rgba(15,47,65,0.45)] backdrop-blur-xl sm:p-5">
        <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-[#f9fbfc]">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-white">
                <HeartPulse className="size-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-bold text-slate-900">Patient record</p>
                <p className="text-[9px] text-slate-400">Secure clinical workspace</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-brand-100/45 px-2.5 py-1 text-[9px] font-semibold text-brand-700">
              <span className="size-1.5 rounded-full bg-brand-500" /> Active
            </span>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-[1fr_0.72fr] sm:p-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-300/55 text-sm font-bold text-primary">
                  JD
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-slate-900">Juan Dela Cruz</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">Patient ID · MT-0248</p>
                  <p className="mt-2 flex items-center gap-1 text-[9px] text-slate-500">
                    <MapPin className="size-2.5" aria-hidden="true" /> Quezon City, Metro Manila
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                {[
                  ["Blood", "O+"],
                  ["Age", "42"],
                  ["Status", "Active"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-700">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-brand-950 p-4 text-white shadow-lg shadow-brand-950/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-brand-100">RFID reader</span>
                <Activity className="size-3 text-brand-300" aria-hidden="true" />
              </div>
              <div className="my-4 flex justify-center">
                <div className="relative grid size-16 place-items-center rounded-full border border-brand-300/20 bg-brand-300/5">
                  <div className="absolute size-11 rounded-full border border-brand-300/30" />
                  <CreditCard className="size-6 text-brand-300" aria-hidden="true" />
                </div>
              </div>
              <p className="text-center text-[10px] font-semibold">Card recognized</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-[8px] text-slate-400">
                <Check className="size-2.5 text-brand-300" aria-hidden="true" /> Identity linked securely
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-brand-100/45 text-primary"><FileText className="size-3.5" aria-hidden="true" /></span>
              <div><p className="text-[9px] font-bold text-slate-700">Medical files</p><p className="text-[8px] text-slate-400">4 documents</p></div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-brand-400/15 text-brand-500"><ShieldCheck className="size-3.5" aria-hidden="true" /></span>
              <div><p className="text-[9px] font-bold text-slate-700">Access verified</p><p className="text-[8px] text-slate-400">Authorized staff</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-2 flex items-center gap-3 rounded-2xl border border-white bg-white/90 p-3 pr-5 shadow-[0_20px_45px_-22px_rgba(15,47,65,0.4)] backdrop-blur sm:-left-9 sm:p-4 sm:pr-6">
        <span className="relative grid size-10 place-items-center rounded-xl bg-brand-100/45 text-brand-700">
          <ShieldCheck className="size-5" aria-hidden="true" />
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-brand-500" />
        </span>
        <div><p className="text-[11px] font-bold text-slate-800">Protected access</p><p className="mt-0.5 text-[9px] text-slate-400">Role-based permissions</p></div>
      </div>
    </div>
  );
}
