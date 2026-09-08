import type { PlayerAggregate, PlayerMatch } from "./types";

function csvEscape(v: unknown) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function playersToCsv(players: PlayerAggregate[]) {
  const headers = [
    "player",
    "sessions",
    "matches",
    "training_score",
    "accuracy",
    "one_hand_acc",
    "two_hand_acc",
    "shots_fired",
    "shots_hit",
    "headshots",
    "damage",
    "dmg_per_match",
    "revives",
    "deaths",
    "kills",
    "kd",
    "avg_placement",
    "banana_best",
    "consistency",
  ];
  const lines = [headers.join(",")];
  for (const p of players) {
    lines.push(
      [
        p.name,
        p.sessions.join("|"),
        p.matches,
        p.trainingScore,
        p.accuracy,
        p.oneHandAcc,
        p.twoHandAcc,
        p.shotsFired,
        p.shotsHit,
        p.headshots,
        p.damage,
        p.dmgPerMatch,
        p.revives,
        p.deaths,
        p.kills,
        p.kd,
        p.avgPlacement,
        p.bananaBest,
        p.consistency,
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return lines.join("\n");
}

export function matchesToCsv(rows: PlayerMatch[]) {
  const headers = [
    "session",
    "match",
    "team",
    "player",
    "placement",
    "accuracy",
    "shots_fired",
    "shots_hit",
    "damage",
    "revives",
    "deaths",
    "kills",
    "banana_min",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const acc = r.shotsFired ? r.shotsHit / r.shotsFired : 0;
    lines.push(
      [
        r.sessionCode,
        r.match,
        r.team,
        r.player,
        r.placement,
        acc,
        r.shotsFired,
        r.shotsHit,
        r.damage,
        r.revives,
        r.deaths,
        r.kills,
        r.bananaMinTime,
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return lines.join("\n");
}

export function downloadText(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
