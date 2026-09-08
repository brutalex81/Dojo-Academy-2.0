import { mean, slugify, stdev } from "@/lib/utils";
import type { Insight, PlayerAggregate, PlayerMatch, WeaponStat } from "./types";

function acc(hit: number, fired: number) {
  if (!fired) return 0;
  return hit / fired;
}

function mergeWeapons(list: WeaponStat[][]): WeaponStat[] {
  const map = new Map<string, WeaponStat>();
  for (const group of list) {
    for (const w of group) {
      const cur = map.get(w.weapon) ?? {
        weapon: w.weapon,
        damage: 0,
        shotsFired: 0,
        shotsHit: 0,
        headshots: 0,
        oneHandFired: 0,
        oneHandHit: 0,
        twoHandFired: 0,
        twoHandHit: 0,
        minDist: 0,
        maxDist: 0,
        avgDist: 0,
      };
      cur.damage += w.damage;
      cur.shotsFired += w.shotsFired;
      cur.shotsHit += w.shotsHit;
      cur.headshots += w.headshots;
      cur.oneHandFired += w.oneHandFired;
      cur.oneHandHit += w.oneHandHit;
      cur.twoHandFired += w.twoHandFired;
      cur.twoHandHit += w.twoHandHit;
      cur.minDist = cur.minDist && w.minDist ? Math.min(cur.minDist, w.minDist) : cur.minDist || w.minDist;
      cur.maxDist = Math.max(cur.maxDist, w.maxDist);
      cur.avgDist = w.avgDist || cur.avgDist;
      map.set(w.weapon, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.damage - a.damage);
}

export function trainingScore(p: {
  accuracy: number;
  consistency: number;
  revives: number;
  matches: number;
  bananaBest: number;
  damage: number;
  shotsFired: number;
  avgPlacement: number;
}) {
  const accPts = Math.min(100, p.accuracy * 400);
  const consistPts = Math.max(0, 100 - p.consistency * 800);
  const teamPts = Math.min(100, (p.revives / Math.max(1, p.matches)) * 35);
  const mobility = p.bananaBest > 0 ? Math.max(0, 100 - p.bananaBest * 8) : 40;
  const eff = p.shotsFired ? Math.min(100, (p.damage / p.shotsFired) * 12) : 0;
  const place = p.avgPlacement > 0 ? Math.max(0, 100 - p.avgPlacement * 12) : 40;
  return Math.round(accPts * 0.34 + consistPts * 0.16 + teamPts * 0.16 + mobility * 0.14 + eff * 0.12 + place * 0.08);
}

export function aggregatePlayers(rows: PlayerMatch[], sessionFilter?: string): PlayerAggregate[] {
  const filtered = sessionFilter ? rows.filter((r) => r.sessionCode === sessionFilter) : rows;
  const groups = new Map<string, PlayerMatch[]>();
  for (const r of filtered) {
    const key = r.player.toLowerCase();
    const list = groups.get(key) ?? [];
    list.push(r);
    groups.set(key, list);
  }
  const out: PlayerAggregate[] = [];
  for (const list of groups.values()) {
    const name = list[0]!.player;
    const shotsFired = list.reduce((a, r) => a + r.shotsFired, 0);
    const shotsHit = list.reduce((a, r) => a + r.shotsHit, 0);
    const oneF = list.reduce((a, r) => a + r.oneHandFired, 0);
    const oneH = list.reduce((a, r) => a + r.oneHandHit, 0);
    const twoF = list.reduce((a, r) => a + r.twoHandFired, 0);
    const twoH = list.reduce((a, r) => a + r.twoHandHit, 0);
    const kills = list.reduce((a, r) => a + r.kills, 0);
    const deaths = list.reduce((a, r) => a + r.deaths, 0);
    const bananaTimes = list.map((r) => r.bananaMinTime).filter((n) => n > 0);
    const accByMatch = list.filter((r) => r.shotsFired > 0).map((r) => r.shotsHit / r.shotsFired);
    const placements = list.map((r) => r.placement).filter((n) => n > 0);
    const accuracy = acc(shotsHit, shotsFired);
    const consistency = stdev(accByMatch);
    const agg: PlayerAggregate = {
      id: slugify(name),
      name,
      playfabId: list.find((r) => r.playfabId)?.playfabId ?? "",
      sessions: [...new Set(list.map((r) => r.sessionCode))],
      matches: list.length,
      kills,
      damage: list.reduce((a, r) => a + r.damage, 0),
      deaths,
      revives: list.reduce((a, r) => a + r.revives, 0),
      shotsFired,
      shotsHit,
      headshots: list.reduce((a, r) => a + r.headshots, 0),
      oneHandFired: oneF,
      oneHandHit: oneH,
      twoHandFired: twoF,
      twoHandHit: twoH,
      bananaCount: list.reduce((a, r) => a + r.bananaCount, 0),
      bananaBest: bananaTimes.length ? Math.min(...bananaTimes) : 0,
      damageTaken: list.reduce((a, r) => a + r.damageTaken, 0),
      avgPlacement: placements.length ? mean(placements) : 0,
      accuracy,
      oneHandAcc: acc(oneH, oneF),
      twoHandAcc: acc(twoH, twoF),
      kd: deaths ? kills / deaths : kills,
      dmgPerMatch: list.length ? list.reduce((a, r) => a + r.damage, 0) / list.length : 0,
      consistency,
      trainingScore: 0,
      weapons: mergeWeapons(list.map((r) => r.weapons)),
    };
    agg.trainingScore = trainingScore(agg);
    out.push(agg);
  }
  return out.sort((a, b) => b.trainingScore - a.trainingScore || b.accuracy - a.accuracy);
}

export function sessionAccuracySeries(rows: PlayerMatch[]) {
  const map = new Map<string, { fired: number; hit: number }>();
  for (const r of rows) {
    const key = r.sessionCode || "UNKNOWN";
    const cur = map.get(key) ?? { fired: 0, hit: 0 };
    cur.fired += r.shotsFired;
    cur.hit += r.shotsHit;
    map.set(key, cur);
  }
  return [...map.entries()].map(([code, v]) => ({
    code,
    accuracy: acc(v.hit, v.fired),
  }));
}

export function matchTrend(rows: PlayerMatch[], playerName: string) {
  const mine = rows.filter((r) => r.player.toLowerCase() === playerName.toLowerCase());
  const map = new Map<string, { session: string; match: number; fired: number; hit: number }>();
  for (const r of mine) {
    const key = `${r.sessionCode}#${r.match}`;
    const cur = map.get(key) ?? { session: r.sessionCode, match: r.match, fired: 0, hit: 0 };
    cur.fired += r.shotsFired;
    cur.hit += r.shotsHit;
    map.set(key, cur);
  }
  return [...map.values()]
    .sort((a, b) => a.session.localeCompare(b.session) || a.match - b.match)
    .map((t) => ({
      label: `${t.session} M${t.match}`,
      session: t.session,
      match: t.match,
      accuracy: acc(t.hit, t.fired),
    }));
}

export function buildInsights(rows: PlayerMatch[], players: PlayerAggregate[]): Insight[] {
  const out: Insight[] = [];
  if (!players.length) {
    out.push({
      id: "empty",
      kind: "info",
      title: "Nessun allievo in questa stanza",
      body: "Scegli un altro codice o importa un Excel con fogli RAW.",
    });
    return out;
  }
  const bestAcc = [...players].sort((a, b) => b.accuracy - a.accuracy)[0];
  const bestRes = [...players].sort((a, b) => b.revives - a.revives)[0];
  if (bestAcc) {
    out.push({
      id: "acc",
      kind: "trend",
      title: `Precisione: ${bestAcc.name}`,
      body: "Mira pulita in questa selezione. Serve da riferimento, non da classifica ego.",
    });
  }
  if (bestRes && bestRes.revives > 0) {
    out.push({
      id: "res",
      kind: "improve",
      title: `Revive: ${bestRes.name}`,
      body: "1 kill in meno, 1 res in più. Qui si vede chi gioca per la lobby.",
    });
  }
  const shaky = players.filter((p) => p.matches >= 3 && p.consistency > 0.06);
  if (shaky[0]) {
    out.push({
      id: "var",
      kind: "attention",
      title: `Altalena: ${shaky[0].name}`,
      body: "La precisione salta tra i match. Meglio volume costante che un picco isolato.",
    });
  }
  if (rows.length < 40) {
    out.push({
      id: "thin",
      kind: "info",
      title: "Campione ancora sottile",
      body: `${players.length} allievi e ${rows.length} righe. Servono più sessioni per trend robusti.`,
    });
  }
  return out.slice(0, 6);
}

export function teamSummary(players: PlayerAggregate[]) {
  const n = Math.max(1, players.length);
  const accAvg = players.reduce((a, p) => a + p.accuracy, 0) / n;
  const scoreAvg = players.reduce((a, p) => a + p.trainingScore, 0) / n;
  const matches = players.reduce((a, p) => a + p.matches, 0);
  const revives = players.reduce((a, p) => a + p.revives, 0);
  const shots = players.reduce((a, p) => a + p.shotsFired, 0);
  const hits = players.reduce((a, p) => a + p.shotsHit, 0);
  return {
    players: players.length,
    matches,
    accAvg,
    scoreAvg,
    revives,
    shots,
    hits,
    sessions: new Set(players.flatMap((p) => p.sessions)).size,
    active: players.filter((p) => p.matches >= 2).length,
    perPlayerMatches: matches / n,
  };
}

export function weaponBoards(players: PlayerAggregate[], minShots = 6) {
  const map = new Map<string, { id: string; name: string; acc: number; damage: number; fired: number }[]>();
  for (const p of players) {
    for (const w of p.weapons) {
      if (w.shotsFired < minShots) continue;
      const list = map.get(w.weapon) ?? [];
      list.push({
        id: p.id,
        name: p.name,
        acc: w.shotsHit / w.shotsFired,
        damage: w.damage,
        fired: w.shotsFired,
      });
      map.set(w.weapon, list);
    }
  }
  return [...map.entries()]
    .map(([weapon, list]) => ({
      weapon,
      rows: list.sort((a, b) => b.acc - a.acc || b.damage - a.damage).slice(0, 5),
    }))
    .sort((a, b) => b.rows.length - a.rows.length);
}
