import {
  ArrowRight,
  ArchiveRestore,
  CheckCircle2,
  CircleUserRound,
  FileLock2,
  Fingerprint,
  KeyRound,
  LogIn,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  Usb,
} from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { PatientCardPreview } from "@/components/landing/patient-card-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const capabilities = [
  {
    icon: ScanLine,
    title: "Tap-to-view records",
    description:
      "Connect the RFID scanner by USB and retrieve the linked patient profile in moments.",
    color: "bg-brand-100/45 text-brand-700",
  },
  {
    icon: Search,
    title: "Fast patient lookup",
    description:
      "Find active patient profiles through a clear directory and focused search experience.",
    color: "bg-brand-300/20 text-brand-700",
  },
  {
    icon: FileLock2,
    title: "Organized medical files",
    description:
      "Keep patient information and linked document references together in one structured view.",
    color: "bg-brand-400/18 text-brand-600",
  },
  {
    icon: CircleUserRound,
    title: "Role-based access",
    description:
      "Give administrators and operators the access they need while protecting restricted actions.",
    color: "bg-brand-100/35 text-brand-950",
  },
  {
    icon: ArchiveRestore,
    title: "Safe archiving",
    description:
      "Archive patient records and documents without making destructive deletion the default.",
    color: "bg-brand-600/12 text-brand-700",
  },
  {
    icon: ShieldCheck,
    title: "Verified updates",
    description:
      "Use RFID-assisted confirmation for sensitive registration, editing, and archive workflows.",
    color: "bg-brand-500/15 text-brand-700",
  },
];

const workflow = [
  {
    step: "01",
    icon: Usb,
    title: "Connect",
    description: "Plug the ESP32 RFID scanner into the workstation through USB.",
  },
  {
    step: "02",
    icon: Fingerprint,
    title: "Tap",
    description: "Present the registered RFID card to identify the linked record.",
  },
  {
    step: "03",
    icon: KeyRound,
    title: "Verify",
    description: "Confirm staff access and card status before protected data is shown.",
  },
  {
    step: "04",
    icon: CheckCircle2,
    title: "Access",
    description: "Open the patient profile and work with authorized information.",
  },
];

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to Content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-brand-100/55 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <a href="#top" className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="MediTap home">
            <BrandLogo />
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex" aria-label="Main navigation">
            <a className="rounded-md transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" href="#capabilities">Capabilities</a>
            <a className="rounded-md transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" href="#workflow">How It Works</a>
            <a className="rounded-md transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" href="#security">Security</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login"><LogIn aria-hidden="true" /> Log In</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href="#learn-more">Explore MediTap <ArrowRight aria-hidden="true" /></a>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="overflow-hidden">
      <section id="top" className="hero-grid relative min-h-[760px] scroll-mt-24 pt-36 sm:pt-40 lg:flex lg:min-h-[820px] lg:items-center lg:pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_35%,rgba(123,189,232,0.24),transparent_28%),radial-gradient(circle_at_18%_12%,rgba(73,118,159,0.10),transparent_24%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-20 px-5 pb-24 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:px-10 lg:pb-12">
          <div className="hero-enter max-w-2xl">
            <Badge className="mb-6"><Sparkles className="size-3" aria-hidden="true" /> RFID-powered patient records</Badge>
            <h1 className="text-balance text-[clamp(3.2rem,7vw,5.8rem)] font-bold leading-[0.97] tracking-[-0.065em] text-slate-950">
              Patient records, <span className="text-primary">one tap away.</span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
              MediTap helps authorized staff identify patients, retrieve organized records, and manage updates through a focused RFID-enabled workspace.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#capabilities">Discover the System <ArrowRight aria-hidden="true" /></a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#workflow"><ScanLine aria-hidden="true" /> See How It Works</a>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              {["USB-connected scanner", "Protected staff access", "Cloud-linked records"].map((item) => (
                <span className="flex items-center gap-2" key={item}>
                  <CheckCircle2 className="size-4 text-primary" aria-hidden="true" /> {item}
                </span>
              ))}
            </div>
          </div>
          <PatientCardPreview />
        </div>
      </section>

      <section id="capabilities" className="scroll-mt-20 bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <Badge variant="outline">Core capabilities</Badge>
              <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl">A clearer way to manage patient records.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground lg:justify-self-end">
              From first tap to record updates, MediTap brings patient identification and medical record organization into one guided experience.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, description, color }) => (
              <article key={title} className="rounded-[26px] border border-brand-100/65 bg-white p-6 shadow-[0_18px_55px_-45px_rgba(10,65,116,0.30)] sm:p-7">
                <span className={`grid size-11 place-items-center rounded-2xl ${color}`}><Icon className="size-5" aria-hidden="true" /></span>
                <h3 className="mt-6 text-xl font-bold tracking-[-0.025em] text-slate-900">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="scroll-mt-20 border-y border-brand-100/65 bg-brand-100/18 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <Badge>Simple workflow</Badge>
            <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl">From tap to the right record.</h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">A direct workflow designed to keep the scanner, staff session, and patient record connected.</p>
          </div>

          <div className="relative mt-16 grid gap-5 md:grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden border-t border-dashed border-primary/25 md:block" />
            {workflow.map(({ step, icon: Icon, title, description }) => (
              <article key={step} className="relative rounded-[24px] border border-brand-100/70 bg-white p-6 shadow-[0_16px_45px_-36px_rgba(10,65,116,0.36)]">
                <div className="flex items-center justify-between">
                  <span className="relative z-10 grid size-16 place-items-center rounded-2xl border border-primary/10 bg-primary/7 text-primary"><Icon className="size-6" aria-hidden="true" /></span>
                  <span className="text-xs font-bold tracking-[0.18em] text-slate-300">{step}</span>
                </div>
                <h3 className="mt-7 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="scroll-mt-20 bg-white py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
          <div className="relative overflow-hidden rounded-[32px] bg-brand-950 p-8 text-white sm:p-10">
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-brand-300/15 blur-3xl" />
            <div className="relative">
              <span className="grid size-13 place-items-center rounded-2xl bg-white/10 text-brand-300"><ShieldCheck className="size-6" aria-hidden="true" /></span>
              <h3 className="mt-10 max-w-md text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Built around responsible access.</h3>
              <p className="mt-5 max-w-lg leading-7 text-slate-300">The RFID card links to a cloud-stored record—it does not carry medical data. Staff authentication and access controls remain essential at every step.</p>
              <div className="mt-8 space-y-3">
                {["Administrator and operator roles", "RFID-assisted sensitive actions", "Archive-first record handling", "Audit-ready workflow design"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    <CheckCircle2 className="size-4 text-brand-300" aria-hidden="true" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Badge variant="outline">Privacy by design</Badge>
            <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl">An identifier—not a medical record in your pocket.</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">MediTap keeps the card’s role intentionally narrow. It identifies the record to retrieve; authorization still comes from the protected staff workspace.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5"><Fingerprint className="size-5 text-primary" aria-hidden="true" /><p className="mt-4 font-bold text-slate-900">Card identity</p><p className="mt-2 text-sm leading-6 text-muted-foreground">A normalized card UID maps to one active patient record.</p></div>
              <div className="rounded-2xl border border-slate-200 p-5"><KeyRound className="size-5 text-primary" aria-hidden="true" /><p className="mt-4 font-bold text-slate-900">Staff authority</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Authenticated roles determine what actions are permitted.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="learn-more" className="scroll-mt-20 px-5 pb-6 sm:px-8 sm:pb-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-primary px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute" />
          <Badge className="border-white/15 bg-white/10 text-brand-100">ESP32 · Next.js · Firebase</Badge>
          <h2 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-[-0.05em] sm:text-5xl">A more direct path to the patient record you need.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-brand-100">MediTap combines familiar web tools with a physical RFID workflow for a focused academic prototype.</p>
          <Button asChild variant="outline" size="lg" className="mt-9 border-white/20 bg-white text-primary hover:bg-brand-100">
            <a href="#top">Back to the Top <ArrowRight aria-hidden="true" /></a>
          </Button>
        </div>
      </section>
      </main>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <BrandLogo />
          <p className="text-sm text-muted-foreground">RFID-based patient record management and archiving.</p>
          <p className="text-xs text-slate-400">Academic thesis prototype</p>
        </div>
      </footer>
    </>
  );
}
