import type { ImportIssue, ImportResult, PlayerMatch, SessionMeta, WeaponStat } from "./types";

type SheetGrid = (string | number | boolean | Date | null | undefined)[][];

const SKIP_PLAYERS = new Set(["", "player", "totals", "total", "lobby", "select player"]);

function cellStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function cellDate(v: unknown): string {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  const s = cellStr(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (m) {
    const dd = m[1]!.padStart(2, "0");
    const mm = m[2]!.padStart(2, "0");
    const yy = m[3]!.length === 2 ? `20${m[3]}` : m[3]!;
    return `${yy}-${mm}-${dd}`;
  }
  return "";
}

function cellNum(v: unknown): number {
  if (v == null || v === "") return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function normHeader(h: unknown): string {
  return cellStr(h)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[.%]+/g, "")
    .replace(/_+/g, "_");
}

function prettyWeapon(raw: string): string {
  const map: Record<string, string> = {
    firearmassaultakm: "AKM",
    firearmassaultcx4: "CX4",
    firearmassaultcx: "CX4",
    firearmassaultfal: "FAL",
    firearmassaultm60: "M60",
    firearmassaultmg338: "MG338",
    firearmassaultmk18: "MK18",
    firearmassaultrfb: "RFB",
    firearmpistol1911: "1911",
    firearmpistol357magnum: "357 MAGNUM",
    firearmpistolpx4: "PX4",
    firearmpistoltec9: "TEC9",
    firearmrocket: "SMAW",
    firearmrocketlaunchersmaw: "SMAW",
    firearmrocketlauncher: "SMAW",
    firearmsmgmp5: "MP5",
    firearmpistolp9silent: "P9 SILENT",
    firearmp9silent: "P9 SILENT",
    firearmsmgp9silent: "P9 SILENT",
    firearmsmgp90: "P90",
    firearmsmgump: "UMP",
    firearmsmguzi: "UZI",
    firearmshotgundt11: "DT11",
    firearmshotgunm1014: "M1014",
    firearmshotgunmatadors: "MATADORS",
    firearmsniperawp: "AWP",
    firearmsnipersako: "SAKO",
  };
  const key = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (map[key]) return map[key];
  const stripped = raw
    .replace(/^Firearm/i, "")
    .replace(/Assault|Pistol|SMG|Shotgun|Sniper/gi, " ")
    .replace(/_/g, " ")
    .trim();
  return stripped.replace(/\s+/g, " ").toUpperCase() || raw.toUpperCase();
}

const METRIC_SUFFIX: Record<string, keyof WeaponStat> = {
  damage: "damage",
  shotsfired: "shotsFired",
  shotshit: "shotsHit",
  headshots: "headshots",
  onehandfired: "oneHandFired",
  onehandhit: "oneHandHit",
  twohandfired: "twoHandFired",
  twohandhit: "twoHandHit",
  mindist: "minDist",
  maxdist: "maxDist",
  avgdist: "avgDist",
};

function emptyMatch(partial: Partial<PlayerMatch> = {}): PlayerMatch {
  return {
    sessionCode: "",
    sessionDate: "",
    match: 0,
    team: "",
    player: "",
    playfabId: "",
    placement: 0,
    kills: 0,
    damage: 0,
    revives: 0,
    deaths: 0,
    damageTaken: 0,
    firstKill: 0,
    bananaCount: 0,
    bananaMinTime: 0,
    bananaAvgTime: 0,
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
    mvp: 0,
    weapons: [],
    ...partial,
  };
}

function isSkipName(name: string) {
  const n = name.trim().toLowerCase();
  if (!n) return true;
  if (SKIP_PLAYERS.has(n)) return true;
  if (n === "n" || n === "setting") return true;
  return false;
}

function detectRawHeaders(headers: string[]): boolean {
  const set = new Set(headers);
  return set.has("player") && (set.has("code") || set.has("room") || set.has("session")) &&
    (set.has("kills") || set.has("kill")) &&
    headers.some((h) => h.startsWith("firearm") || h.includes("shotsfired") || h === "damage");
}

function detectArmyHeaders(headers: string[]): boolean {
  const set = new Set(headers);
  return set.has("player") && (set.has("kill") || set.has("kills")) &&
    (set.has("dmg") || set.has("damage")) &&
    (set.has("acc") || set.has("acc%") || headers.some((h) => h.includes("acc")));
}

function parseRawSheet(grid: SheetGrid, issues: ImportIssue[]): PlayerMatch[] {
  if (!grid.length) return [];
  const headerRow = grid[0]!.map((h) => normHeader(h));
  const idx = (aliases: string[]) => {
    for (const a of aliases) {
      const i = headerRow.indexOf(a);
      if (i >= 0) return i;
    }
    return -1;
  };
  const iPlayer = idx(["player", "nome", "name", "nick"]);
  if (iPlayer < 0) {
    issues.push({ level: "warn", message: "Foglio RAW: colonna player non trovata." });
    return [];
  }
  const iCode = idx(["code", "room", "session", "stanza", "room_code"]);
  const iDate = idx(["date", "giorno", "day", "session_date", "data"]);
  const iMatch = idx(["match", "game", "round"]);
  const iTeam = idx(["team", "squad", "lobby"]);
  const iFab = idx(["playfabid", "playfab", "id"]);
  const iPlace = idx(["placement", "place", "pos"]);
  const iKills = idx(["kills", "kill"]);
  const iDmg = idx(["damage", "dmg"]);
  const iRev = idx(["revives", "revive"]);
  const iDeaths = idx(["deaths", "death"]);
  const iTaken = idx(["damagetaken", "dmg_taken"]);
  const iFirst = idx(["firstkill", "first_kill"]);
  const iBanC = idx(["buffbanana_count", "banana", "faster_banana"]);
  const iBanMin = idx(["buffbanana_mintime", "banana_min"]);
  const iBanAvg = idx(["buffbanana_avgtime", "banana_avg"]);
  const iShots = idx(["firearm_shotsfired", "shots_fired", "shotsfired", "tot_shot"]);
  const iHits = idx(["firearm_shotshit", "shots_hit", "shotshit", "tot_shot_hit"]);
  const iHs = idx(["firearm_headshots", "headshots", "head_shot"]);
  const iOhF = idx(["firearm_onehandfired", "onehand", "one_hand_shot"]);
  const iOhH = idx(["firearm_onehandhit", "onehandshit", "one_hand_hit"]);
  const iThF = idx(["firearm_twohandfired", "twohand", "two_hand_shot"]);
  const iThH = idx(["firearm_twohandhit", "twihand_shit", "two_hand_hit"]);
  const iMinD = idx(["firearm_mindist"]);
  const iMaxD = idx(["firearm_maxdist"]);
  const iAvgD = idx(["firearm_avgdist"]);
  const iMvp = idx(["mvp", "mpv"]);

  const weaponCols: { i: number; weapon: string; metric: keyof WeaponStat }[] = [];
  headerRow.forEach((h, i) => {
    if (!h.startsWith("firearm") || h.startsWith("firearm_")) return;
    const last = h.lastIndexOf("_");
    if (last < 0) return;
    const prefix = h.slice(0, last);
    const metricKey = h.slice(last + 1).replace(/[^a-z0-9]/g, "");
    const metric = METRIC_SUFFIX[metricKey];
    if (!metric) return;
    weaponCols.push({ i, weapon: prettyWeapon(prefix), metric });
  });

  const rows: PlayerMatch[] = [];
  for (let r = 1; r < grid.length; r++) {
    const line = grid[r] ?? [];
    const player = cellStr(line[iPlayer]);
    if (isSkipName(player)) continue;
    const weaponsMap = new Map<string, WeaponStat>();
    for (const col of weaponCols) {
      const val = cellNum(line[col.i]);
      if (!val) continue;
      let w = weaponsMap.get(col.weapon);
      if (!w) {
        w = {
          weapon: col.weapon,
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
        weaponsMap.set(col.weapon, w);
      }
      const cur = Number(w[col.metric] ?? 0);
      if (col.metric === "minDist") w.minDist = cur > 0 ? Math.min(cur, val) : val;
      else if (col.metric === "maxDist") w.maxDist = Math.max(cur, val);
      else if (col.metric === "avgDist") w.avgDist = val;
      else if (col.metric !== "weapon") w[col.metric] = cur + val;
    }
    rows.push(
      emptyMatch({
        sessionCode: iCode >= 0 ? cellStr(line[iCode]) || "UNKNOWN" : "UNKNOWN",
        sessionDate: iDate >= 0 ? cellDate(line[iDate]) : "",
        match: iMatch >= 0 ? cellNum(line[iMatch]) : 0,
        team: iTeam >= 0 ? cellStr(line[iTeam]) : "",
        player,
        playfabId: iFab >= 0 ? cellStr(line[iFab]) : "",
        placement: iPlace >= 0 ? cellNum(line[iPlace]) : 0,
        kills: iKills >= 0 ? cellNum(line[iKills]) : 0,
        damage: iDmg >= 0 ? cellNum(line[iDmg]) : 0,
        revives: iRev >= 0 ? cellNum(line[iRev]) : 0,
        deaths: iDeaths >= 0 ? cellNum(line[iDeaths]) : 0,
        damageTaken: iTaken >= 0 ? cellNum(line[iTaken]) : 0,
        firstKill: iFirst >= 0 ? cellNum(line[iFirst]) : 0,
        bananaCount: iBanC >= 0 ? cellNum(line[iBanC]) : 0,
        bananaMinTime: iBanMin >= 0 ? cellNum(line[iBanMin]) : 0,
        bananaAvgTime: iBanAvg >= 0 ? cellNum(line[iBanAvg]) : 0,
        shotsFired: iShots >= 0 ? cellNum(line[iShots]) : 0,
        shotsHit: iHits >= 0 ? cellNum(line[iHits]) : 0,
        headshots: iHs >= 0 ? cellNum(line[iHs]) : 0,
        oneHandFired: iOhF >= 0 ? cellNum(line[iOhF]) : 0,
        oneHandHit: iOhH >= 0 ? cellNum(line[iOhH]) : 0,
        twoHandFired: iThF >= 0 ? cellNum(line[iThF]) : 0,
        twoHandHit: iThH >= 0 ? cellNum(line[iThH]) : 0,
        minDist: iMinD >= 0 ? cellNum(line[iMinD]) : 0,
        maxDist: iMaxD >= 0 ? cellNum(line[iMaxD]) : 0,
        avgDist: iAvgD >= 0 ? cellNum(line[iAvgD]) : 0,
        mvp: iMvp >= 0 ? cellNum(line[iMvp]) : 0,
        weapons: [...weaponsMap.values()].filter((w) => w.shotsFired > 0 || w.damage > 0),
      }),
    );
  }
  return rows;
}

function parseArmySheet(grid: SheetGrid, sessionCode: string, issues: ImportIssue[]): PlayerMatch[] {
  let headerIdx = -1;
  for (let i = 0; i < Math.min(grid.length, 12); i++) {
    const headers = (grid[i] ?? []).map((h) => normHeader(h));
    if (headers.includes("player") && (headers.includes("kill") || headers.includes("kills"))) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) {
    issues.push({ level: "info", message: "Nessuna tabella ARMY riconosciuta." });
    return [];
  }
  const headerRow = (grid[headerIdx] ?? []).map((h) => normHeader(h));
  const idx = (aliases: string[]) => {
    for (const a of aliases) {
      const i = headerRow.indexOf(a);
      if (i >= 0) return i;
    }
    return -1;
  };
  const iPlayer = idx(["player", "nome", "name"]);
  const iKills = idx(["kill", "kills"]);
  const iDmg = idx(["dmg", "damage"]);
  const iMvp = idx(["mvp", "mpv"]);
  const iDeaths = idx(["death", "deaths"]);
  const iRev = idx(["revive", "revives"]);
  const iShots = idx(["shots_fired", "tot_shot"]);
  const iHits = idx(["shots_hit", "tot_shot_hit"]);
  const iAcc = idx(["acc", "accuaty", "accuracy"]);
  const iOh = idx(["onehand", "one_hand_shot"]);
  const iOhH = idx(["onehandshit", "shit_onehand", "one_hand_hit"]);
  const iTh = idx(["twohand", "two_hand_shot"]);
  const iThH = idx(["twihand_shit", "shit_twohand", "two_hand_hit"]);
  const iBan = idx(["banana", "faster_banana"]);

  const rows: PlayerMatch[] = [];
  for (let r = headerIdx + 1; r < grid.length; r++) {
    const line = grid[r] ?? [];
    const player = iPlayer >= 0 ? cellStr(line[iPlayer]) : "";
    if (isSkipName(player)) continue;
    const shots = iShots >= 0 ? cellNum(line[iShots]) : 0;
    const hits = iHits >= 0 ? cellNum(line[iHits]) : 0;
    const acc = iAcc >= 0 ? cellNum(line[iAcc]) : 0;
    const shotsFired = shots || (acc && hits ? Math.round(hits / (acc > 1 ? acc / 100 : acc)) : 0);
    rows.push(
      emptyMatch({
        sessionCode,
        match: 0,
        player,
        kills: iKills >= 0 ? cellNum(line[iKills]) : 0,
        damage: iDmg >= 0 ? cellNum(line[iDmg]) : 0,
        mvp: iMvp >= 0 ? cellNum(line[iMvp]) : 0,
        deaths: iDeaths >= 0 ? cellNum(line[iDeaths]) : 0,
        revives: iRev >= 0 ? cellNum(line[iRev]) : 0,
        shotsFired,
        shotsHit: hits,
        oneHandFired: iOh >= 0 ? cellNum(line[iOh]) : 0,
        oneHandHit: iOhH >= 0 ? cellNum(line[iOhH]) : 0,
        twoHandFired: iTh >= 0 ? cellNum(line[iTh]) : 0,
        twoHandHit: iThH >= 0 ? cellNum(line[iThH]) : 0,
        bananaMinTime: iBan >= 0 ? cellNum(line[iBan]) : 0,
      }),
    );
  }
  return rows;
}

function parseSettings(grid: SheetGrid): { historic: string[]; current: string } {
  const historic: string[] = [];
  let current = "";
  let currentCol = -1;
  for (const row of grid) {
    const cells = (row ?? []).map((c) => cellStr(c).toLowerCase());
    const curIdx = cells.findIndex((c) => c.includes("current") && c.includes("room"));
    if (curIdx >= 0) currentCol = curIdx;
  }
  for (const row of grid) {
    const a = cellStr(row?.[1]);
    if (/^[A-Z0-9]{4,8}$/i.test(a)) historic.push(a.toUpperCase());
    if (currentCol >= 0) {
      const c = cellStr(row?.[currentCol]);
      if (/^[A-Z0-9]{4,8}$/i.test(c)) current = c.toUpperCase();
    }
  }
  return { historic: [...new Set(historic)], current };
}

function sessionsFrom(rows: PlayerMatch[], current = ""): SessionMeta[] {
  const map = new Map<string, SessionMeta>();
  for (const r of rows) {
    const code = r.sessionCode || "UNKNOWN";
    let s = map.get(code);
    if (!s) {
      s = { code, matches: 0, players: 0, rows: 0, date: r.sessionDate || "", current: code === current };
      map.set(code, s);
    }
    s.rows += 1;
    if (!s.date && r.sessionDate) s.date = r.sessionDate;
  }
  for (const s of map.values()) {
    const subset = rows.filter((r) => r.sessionCode === s.code);
    s.players = new Set(subset.map((r) => r.player)).size;
    s.matches = new Set(subset.map((r) => r.match)).size;
    s.current = s.code === current;
  }
  return [...map.values()].sort((a, b) => Number(b.current) - Number(a.current) || a.code.localeCompare(b.code));
}

export async function parseWorkbook(file: File | ArrayBuffer, fileName: string): Promise<ImportResult> {
  const XLSX = await import("xlsx");
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const wb = XLSX.read(data, { type: "array", cellDates: true });
  const issues: ImportIssue[] = [];
  const sheets = wb.SheetNames.slice();
  let rows: PlayerMatch[] = [];
  let source: ImportResult["source"] = "generic";
  const knownRooms: string[] = [];
  let currentRoom = "";

  const sheetGrids: { name: string; grid: SheetGrid }[] = [];
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    if (!ws) continue;
    const grid = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true }) as SheetGrid;
    sheetGrids.push({ name, grid });
    if (name.toUpperCase().includes("SETTING")) {
      const settings = parseSettings(grid);
      knownRooms.push(...settings.historic);
      if (settings.current) currentRoom = settings.current;
    }
  }

  const rawSheets = sheetGrids.filter(({ name, grid }) => {
    const upper = name.toUpperCase();
    const headerProbe = (grid[0] ?? []).map((h) => normHeader(h));
    return detectRawHeaders(headerProbe) || upper === "RAW";
  });
  const armySheets = sheetGrids.filter(({ name, grid }) => {
    const upper = name.toUpperCase();
    if (upper === "RAW" || upper.includes("SETTING") || upper.includes("STAT")) return false;
    if (upper.includes("TRAINING")) return false;
    const headerProbe = (grid[0] ?? []).map((h) => normHeader(h));
    return detectArmyHeaders(headerProbe) || upper === "ARMY";
  });

  for (const { name } of sheetGrids) {
    const upper = name.toUpperCase();
    if (upper.includes("STAT COMP") || upper.includes("STATCOMP")) {
      issues.push({
        level: "info",
        message: `${name}: vista lookup ignorata (i dati arrivano da RAW / ARMY).`,
      });
    }
    if (upper.includes("TRAINING")) {
      issues.push({
        level: "info",
        message: `${name}: classifiche formattate ignorate a favore dei dati grezzi.`,
      });
    }
  }

  for (const { grid } of rawSheets) {
    const parsed = parseRawSheet(grid, issues);
    if (parsed.length) {
      rows = rows.concat(parsed);
      source = "raw";
    }
  }

  if (!rows.length) {
    for (const { name, grid } of armySheets) {
      const parsed = parseArmySheet(grid, knownRooms[knownRooms.length - 1] || name, issues);
      if (parsed.length) {
        rows = parsed;
        source = "army";
        break;
      }
    }
  } else if (armySheets.length) {
    issues.push({
      level: "info",
      message: "Foglio ARMY ignorato: i match RAW sono la fonte primaria.",
    });
  }

  if (!rows.length) {
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name];
      if (!ws) continue;
      const grid = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true }) as SheetGrid;
      const parsed = parseArmySheet(grid, "IMPORT", issues);
      if (parsed.length) {
        rows = parsed;
        source = "generic";
        break;
      }
    }
  }

  if (!rows.length) {
    issues.push({
      level: "warn",
      message: "Nessuna riga giocatore riconosciuta. Serve almeno una colonna Player / Nome.",
    });
  }

  const sessions = sessionsFrom(rows, currentRoom);
  if (knownRooms.length) {
    issues.push({
      level: "info",
      message: `Codici stanza da SETTINGS: ${knownRooms.slice(0, 8).join(", ")}${currentRoom ? ` · corrente ${currentRoom}` : ""}`,
    });
  }

  return {
    fileName,
    importedAt: Date.now(),
    sheets,
    sessions,
    rows,
    issues,
    source,
  };
}
