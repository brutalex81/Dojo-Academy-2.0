import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/dojo/EmptyState";
import { NickLink } from "@/components/dojo/NickLink";
import { useAnalysis } from "@/lib/dojo/useAnalysis";
import { useDojoStore } from "@/lib/dojo/store";
import { useLang } from "@/lib/dojo/useLang";
import { fmtPct, slugify } from "@/lib/utils";

export const Route = createFileRoute("/players/")({ component: PlayersPage });

function PlayersPage() {
  const { t } = useLang();
  const { dataset, players } = useAnalysis();
  const school = useDojoStore((s) => s.school);
  const [q, setQ] = useState("");
  const schoolList = useMemo(() => {
    const s = q.toLowerCase();
    return (school?.students ?? []).filter((p) => !s || p.nick.toLowerCase().includes(s) || p.name.toLowerCase().includes(s));
  }, [school, q]);
  const statList = useMemo(() => {
    const s = q.toLowerCase();
    return players.filter((p) => !s || p.name.toLowerCase().includes(s));
  }, [players, q]);

  if (!school && !dataset) {
    return <EmptyState title={t.noRoster} body={t.noRosterBody} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">{t.rosterTitle}</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.searchNick}
        className="min-h-11 w-full max-w-md border border-line bg-surface px-3 text-sm"
      />
      {schoolList.length ? (
        <div className="space-y-1">
          {schoolList.map((s) => (
            <div key={s.id} className="flex justify-between border-b border-line/70 py-3 text-sm">
              <NickLink nick={s.nick} />
              <span className="text-muted">{s.name} · {s.coach}</span>
            </div>
          ))}
        </div>
      ) : null}
      {dataset && statList.length && !school ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {statList.map((p) => (
            <Link
              key={p.id}
              to="/players/$playerId"
              params={{ playerId: p.id || slugify(p.name) }}
              className="border border-line p-4 hover:border-accent"
            >
              <div>{p.name}</div>
              <div className="text-xs text-muted">{fmtPct(p.accuracy)} · {p.matches} match</div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
