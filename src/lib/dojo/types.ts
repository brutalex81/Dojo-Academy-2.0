export type WeaponStat = {
  weapon: string;
  damage: number;
  shotsFired: number;
  shotsHit: number;
  headshots: number;
  oneHandFired: number;
  oneHandHit: number;
  twoHandFired: number;
  twoHandHit: number;
  minDist: number;
  maxDist: number;
  avgDist: number;
};

export type PlayerMatch = {
  sessionCode: string;
  sessionDate: string;
  match: number;
  team: string;
  player: string;
  playfabId: string;
  placement: number;
  kills: number;
  damage: number;
  revives: number;
  deaths: number;
  damageTaken: number;
  firstKill: number;
  bananaCount: number;
  bananaMinTime: number;
  bananaAvgTime: number;
  shotsFired: number;
  shotsHit: number;
  headshots: number;
  oneHandFired: number;
  oneHandHit: number;
  twoHandFired: number;
  twoHandHit: number;
  minDist: number;
  maxDist: number;
  avgDist: number;
  mvp: number;
  weapons: WeaponStat[];
};

export type SessionMeta = {
  code: string;
  matches: number;
  players: number;
  rows: number;
  date: string;
  current: boolean;
};

export type ImportIssue = {
  level: "warn" | "info";
  message: string;
};

export type ImportResult = {
  fileName: string;
  importedAt: number;
  sheets: string[];
  sessions: SessionMeta[];
  rows: PlayerMatch[];
  issues: ImportIssue[];
  source: "raw" | "army" | "mixed" | "generic";
};

export type Dataset = ImportResult;

export type PlayerAggregate = {
  id: string;
  name: string;
  playfabId: string;
  sessions: string[];
  matches: number;
  kills: number;
  damage: number;
  deaths: number;
  revives: number;
  shotsFired: number;
  shotsHit: number;
  headshots: number;
  oneHandFired: number;
  oneHandHit: number;
  twoHandFired: number;
  twoHandHit: number;
  bananaCount: number;
  bananaBest: number;
  damageTaken: number;
  avgPlacement: number;
  accuracy: number;
  oneHandAcc: number;
  twoHandAcc: number;
  kd: number;
  dmgPerMatch: number;
  consistency: number;
  trainingScore: number;
  weapons: WeaponStat[];
};

export type Insight = {
  id: string;
  kind: "trend" | "improve" | "attention" | "info";
  title: string;
  body: string;
};
