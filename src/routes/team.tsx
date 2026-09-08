import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/dojo/EmptyState";
import { StatCard } from "@/components/dojo/StatCard";
import { useAnalysis } from "@/lib/dojo/useAnalysis";
import { useDojoStore } from "@/lib/dojo/store";
import { fmtNum, fmtPct } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/team")({ component: TeamPage });

function TeamPage() {
  const { dataset, players, team, series } = useAnalysis();
  const sessionFilter = useDojoStore((s) => s.sessionFilter);
  const setSessionFilter = useDojoStore((s) => s.setSessionFilter);
  if (!dataset) {
    return <EmptyState title="Nessun team" body="Importa i dati per capire come sta andando il gruppo." />;
  }

  const attention = players.filter((p) => p.accuracy < 0.15 && p.shotsFired >= 80).slice(0, 5);
  const chart = players.slice(0, 12).map((p) => ({
    name: p.name.length > 12 ? `${p.name.slice(0, 11)}…` : p.name,
    score: p.trainingScore,
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">Team</p>
        <h1 className="mt-1 text-3xl font-medium tracking-tight">Come sta andando il dojo</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Vista coach: volume di allenamento, precisione media, criticità. Non è una classifica kill.
        </p>
      </header>
      <select
        value={sessionFilter}
        onChange={(e) => setSessionFilter(e.target.value)}
        className="min-h-11 rounded-sm border border-line bg-surface px-3 text-sm"
      >
        <option value="">Tutte le stanze</option>
        {dataset.sessions.map((s) => (
          <option key={s.code} value={s.code}>
            {s.code}
          </option>
        ))}
      </select>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Allievi attivi" value={`${team.active}/${team.players}`} hint="almeno 2 match" />
        <StatCard label="Presenze" value={fmtNum(team.matches)} hint="righe match aggregate" />
        <StatCard label="Precisione media" value={fmtPct(team.accAvg)} />
        <StatCard label="Revive totali" value={fmtNum(team.revives)} hint="segnale teamplay" />
      </section>
      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="font-mono text-[11px] tracking-[0.14em] text-subtle uppercase">
          Training score — primi 12
        </h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid stroke="#3a3226" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#b8a88a", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fill: "#b8a88a", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1a1610", border: "1px solid #3a3226", color: "#e8eee9" }}
              />
              <Bar dataKey="score" fill="#c9a24a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="font-mono text-[11px] tracking-[0.14em] text-subtle uppercase">Punti di attenzione</h2>
        {attention.length ? (
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {attention.map((p) => (
              <li key={p.id}>
                {p.name}: precisione {fmtPct(p.accuracy)} su {fmtNum(p.shotsFired)} colpi.
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">Nessuna criticità evidente sul volume attuale.</p>
        )}
        <p className="mt-4 text-xs text-muted">
          Andamento stanze: {series.map((s) => `${s.code} ${fmtPct(s.accuracy)}`).join(" · ") || "—"}
        </p>
      </section>
    </div>
  );
}
