import { useMemo } from "react";
import { aggregatePlayers, buildInsights, sessionAccuracySeries, teamSummary } from "./analytics";
import { useDojoStore } from "./store";

export function useAnalysis() {
  const dataset = useDojoStore((s) => s.dataset);
  const sessionFilter = useDojoStore((s) => s.sessionFilter);
  const rows = dataset?.rows ?? [];
  const filtered = useMemo(
    () => (sessionFilter ? rows.filter((r) => r.sessionCode === sessionFilter) : rows),
    [rows, sessionFilter],
  );
  const players = useMemo(() => aggregatePlayers(filtered), [filtered]);
  const allPlayers = useMemo(() => aggregatePlayers(rows), [rows]);
  const insights = useMemo(() => buildInsights(filtered, players), [filtered, players]);
  const series = useMemo(() => sessionAccuracySeries(rows), [rows]);
  const team = useMemo(() => teamSummary(players), [players]);
  return { dataset, rows, filtered, players, allPlayers, insights, series, team, sessionFilter };
}
