import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/dojo/EmptyState";
import { Meter } from "@/components/dojo/Meter";
import { StatCard } from "@/components/dojo/StatCard";
import { matchTrend } from "@/lib/dojo/analytics";
import { findCard } from "@/lib/dojo/roster";
import { useAnalysis } from "@/lib/dojo/useAnalysis";
import { useDojoStore } from "@/lib/dojo/store";
import { useLang } from "@/lib/dojo/useLang";
import { fmtNum, fmtPct, fmtSec, slugify } from "@/lib/utils";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/players/$playerId")({ component: PlayerPage });

function PlayerPage() {
  const { t } = useLang();
  const { playerId } = Route.useParams();
  const { dataset, allPlayers, rows } = useAnalysis();
  const school = useDojoStore((s) => s.school);
  const student = school?.students.find((s) => slugify(s.nick) === playerId);
  const player = allPlayers.find((p) => p.id === playerId)
    ?? allPlayers.find((p) => student && slugify(p.name) === slugify(student.nick));
  const card = findCard(student?.nick ?? player?.name ?? "", school?.cards);

  if (!student && !player) {
    return (
      <div className="p-6">
        <p>{t.noPlayer}</p>
        <Link to="/players" className="mt-3 inline-block text-accent">{t.backRoster}</Link>
      </div>
    );
  }

  const name = student?.nick ?? player?.name ?? playerId;

  return (
    <div className="space-y-6">
      <header>
        <Link to="/players" className="text-xs text-muted">← {t.backRoster}</Link>
        <h1 className="mt-2 text-3xl tracking-wide">{name}</h1>
        {student ? (
          <p className="mt-1 text-sm text-muted">
            {student.name} · {student.coach} · {student.hours}h · {student.goal}
          </p>
        ) : null}
      </header>

      {card ? (
        <section className="space-y-3 text-sm">
          <p className="tracking-widest text-accent uppercase">{card.role}</p>
          <p className="whitespace-pre-wrap text-muted">{card.str}</p>
          <p className="whitespace-pre-wrap text-muted">{card.grow}</p>
        </section>
      ) : null}

      {player ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Training score" value={String(player.trainingScore)} />
            <StatCard label={t.accuracy} value={fmtPct(player.accuracy)} />
            <StatCard label={t.matches} value={fmtNum(player.matches)} />
            <StatCard label={t.revive} value={fmtNum(player.revives)} />
          </section>
          {dataset ? <MatchBits player={player} rows={rows} t={t} /> : null}
        </>
      ) : (
        <EmptyState title={t.noData} body={t.noDataBody} />
      )}
    </div>
  );
}

function MatchBits({
  player,
  rows,
  t,
}: {
  player: NonNullable<ReturnType<typeof useAnalysis>["allPlayers"][number]>;
  rows: ReturnType<typeof useAnalysis>["rows"];
  t: ReturnType<typeof useLang>["t"];
}) {
  const trend = matchTrend(rows, player.name).map((x) => ({
    label: x.label,
    precisione: Number((x.accuracy * 100).toFixed(1)),
  }));
  const weapons = player.weapons.filter((w) => w.shotsFired >= 8).slice(0, 8);
  return (
    <>
      <section className="h-56 border border-line p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <CartesianGrid stroke="#2b2b2b" />
            <XAxis dataKey="label" hide />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="precisione" stroke="#ff2a2a" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>
      <section>
        <h2 className="mb-2 text-sm">{t.weapon}</h2>
        {weapons.map((w) => (
          <div key={w.weapon} className="mb-2">
            <div className="flex justify-between text-sm">
              <span>{w.weapon}</span>
              <span>{fmtPct(w.shotsFired ? w.shotsHit / w.shotsFired : 0)}</span>
            </div>
            <Meter label={w.weapon} value={w.shotsFired ? w.shotsHit / w.shotsFired : 0} />
          </div>
        ))}
        <p className="mt-2 text-xs text-subtle">
          {fmtSec(player.bananaBest)} banana · {fmtNum(player.damage)} {t.damage}
        </p>
      </section>
    </>
  );
}
