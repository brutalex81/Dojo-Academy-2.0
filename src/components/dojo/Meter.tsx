import { clamp } from "@/lib/utils";

export function Meter({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const width = clamp(value);
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[11px] text-muted">
        <span>{label}</span>
        <span className="tabular text-fg">{suffix ?? `${Math.round(width)}`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
        <div className="h-full bg-accent" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
