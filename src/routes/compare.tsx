import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/dojo/EmptyState";
import { useAnalysis } from "@/lib/dojo/useAnalysis";
import { fmtNum, fmtPct, fmtSec } from "@/lib/utils";

export const Route = createFileRoute("/compare")({ component: ComparePage });

function ComparePage() {
  const { dataset, allPlayers } = useAnalysis();
  const [picked, setPicked] = useState<string[]>([]);
  const selected = useMemo(
    () => allPlayers.filter((p) => picked.includes(p.id)),
    [allPlayers, picked],
  );

  if (!dataset) {
    return <EmptyState title="Niente da confrontare" body="Serve un dataset importato." />;
  }

  function toggle(id: string) {
    setPicked((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 4) return cur;
      return [...cur, id];
    });
  }

  const metrics: { key: string; label: string; render: (id: string) => string }[] = [
    { key: "score", label: "Training score", render: (id) => String(selected.find((p) => p.id === id)?.trainingScore ?? "—") },
    { key: "acc", label: "Precisione", render: (id) => fmtPct(selected.find((p) => p.id === id)?.accuracy) },
    { key: "oh", label: "One-hand", render: (id) => fmtPct(selected.find((p) => p.id === id)?.oneHandAcc) },
    { key: "th", label: "Two-hand", render: (id) => fmtPct(selected.find((p) => p.id === id)?.twoHandAcc) },
    { key: "rev", label: "Revive", render: (id) => fmtNum(selected.find((p) => p.id === id)?.revives) },
    { key: "match", label: "Match", render: (id) => fmtNum(selected.find((p) => p.id === id)?.matches) },
    { key: "cons", label: "Variabilità prec.", render: (id) => fmtPct(selected.find((p) => p.id === id)?.consistency) },
    { key: "ban", label: "Banana best", render: (id) => fmtSec(selected.find((p) => p.id === id)?.bananaBest) },
    { key: "dmg", label: "Danno / match", render: (id) => fmtNum(selected.find((p) => p.id === id)?.dmgPerMatch, 0) },
    { key: "kd", label: "K/D (secondario)", render: (id) => fmtNum(selected.find((p) => p.id === id)?.kd, 2) },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">Compare</p>
        <h1 className="mt-1 text-3xl font-medium tracking-tight">Confronto allievi</h1>
        <p className="mt-2 text-sm text-muted">Fino a 4 nick. Utile in debrief, non per fare ranking da bar.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {allPlayers.slice(0, 36).map((p) => {
          const on = picked.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={
                on
                  ? "min-h-10 rounded-full border border-accent bg-accent-dim px-3 text-xs"
                  : "min-h-10 rounded-full border border-line px-3 text-xs text-muted"
              }
            >
              {p.name}
            </button>
          );
        })}
      </div>
      {selected.length < 2 ? (
        <p className="text-sm text-muted">Seleziona almeno due allievi.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="font-mono text-[10px] text-subtle uppercase">
              <tr>
                <th className="px-4 py-3">Metrica</th>
                {selected.map((p) => (
                  <th key={p.id}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.key} className="border-t border-line">
                  <td className="px-4 py-2.5 text-muted">{m.label}</td>
                  {selected.map((p) => (
                    <td key={p.id} className="tabular">
                      {m.render(p.id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
