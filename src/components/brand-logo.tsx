import { HeartPulse } from "lucide-react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_rgba(12,95,103,0.8)]">
        <HeartPulse className="size-[19px]" strokeWidth={2.35} aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-[19px] font-bold tracking-[-0.04em] text-foreground">
          Medi<span className="text-primary">Tap</span>
        </span>
      )}
    </span>
  );
}
