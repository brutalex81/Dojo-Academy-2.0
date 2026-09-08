import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/dojo/EmptyState";
import { useAnalysis } from "@/lib/dojo/useAnalysis";
import { fmtNum, fmtPct, fmtSec } from "@/lib/utils";
import type { PlayerAggregate } from "@/lib/dojo/types";

export const Route = createFileRoute("/ranking")({ component: RankingPage });

type Metric = "trainingScore" | "accuracy" | "oneHandAcc" | "revives" | "bananaBest" | "kd";

const OPTIONS: { id: Metric; label: string }[] = [
  { id: "trainingScore", label: "Training score" },
  { id: "accuracy", label: "Precisione" },
  { id: "oneHandAcc", label: "One-hand" },
  { id: "revives", label: "Revive" },
  { id: "bananaBest", label: "Banana (più veloce)" },
  { id: "kd", label: "K/D (secondario)" },
];

function valueOf(p: PlayerAggregate, m: Metric) {
  if (m === "bananaBest") return p.bananaBest || 9999;
  return p[m];
}

function display(p: PlayerAggregate, m: Metric) {
  if (m === "accuracy" || m === "oneHandAcc") return fmtPct(p[m]);
  if (m === "bananaBest") return fmtSec(p.bananaBest);
  if (m === "kd") return fmtNum(p.kd, 2);
  return fmtNum(p[m] as number);
}

function RankingPage() {
  const { dataset, players } = useAnalysis();
  const [metric, setMetric] = useState<Metric>("trainingScore");
  const ranked = useMemo(() => {
    const list = [...players];
    list.sort((a, b) => {
      if (metric === "bananaBest") return valueOf(a, metric) - valueOf(b, metric);
      return Number(valueOf(b, metric)) - Number(valueOf(a, metric));
    });
    return list;
  }, [players, metric]);

  if (!dataset) return <EmptyState title="Ranking vuoto" body="Importa i dati per ordinare gli allievi." />;

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">Ranking</p>
        <h1 className="mt-1 text-3xl font-medium tracking-tight">Ordine secondario</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Serve per leggere il gruppo, non per sostituire la pagella. Default: training score.
        </p>
      </header>
      <select
        value={metric}
        onChange={(e) => setMetric(e.target.value as Metric)}
        className="min-h-11 rounded-sm border border-line bg-surface px-3 text-sm"
      >
        {OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="font-mono text-[10px] text-subtle uppercase">
            <tr>
              <th className="px-4 py-3">#</th>
              <th>Allievo</th>
              <th>Valore</th>
              <th>Match</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((p, i) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-2.5 font-mono text-muted">{String(i + 1).padStart(2, "0")}</td>
                <td>
                  <Link to="/players/$playerId" params={{ playerId: p.id }} className="hover:text-accent">
                    {p.name}
                  </Link>
                </td>
                <td className="tabular">{display(p, metric)}</td>
                <td className="tabular">{p.matches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
