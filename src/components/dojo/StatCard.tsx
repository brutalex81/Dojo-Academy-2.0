export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">{label}</div>
      <div className="mt-2 font-mono text-2xl tabular text-fg">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}
