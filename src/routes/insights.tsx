import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/dojo/EmptyState";
import { useAnalysis } from "@/lib/dojo/useAnalysis";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights")({ component: InsightsPage });

function InsightsPage() {
  const { dataset, insights } = useAnalysis();
  if (!dataset) {
    return <EmptyState title="Nessun insight" body="Gli insight nascono solo dopo un import reale." />;
  }
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">Insights</p>
        <h1 className="mt-1 text-3xl font-medium tracking-tight">Lettura automatica</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Frasi generate dai numeri importati. Se il campione è magro, il sistema lo dice.
        </p>
      </header>
      <div className="grid gap-3">
        {insights.map((i) => (
          <article key={i.id} className="rounded-lg border border-line bg-surface p-4">
            <div
              className={cn(
                "font-mono text-[10px] tracking-[0.16em] uppercase",
                i.kind === "attention" && "text-warn",
                i.kind === "improve" && "text-accent",
                i.kind === "trend" && "text-info",
                i.kind === "info" && "text-subtle",
              )}
            >
              {i.kind}
            </div>
            <h2 className="mt-1 text-lg font-medium">{i.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{i.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
