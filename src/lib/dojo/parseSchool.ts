export type SchoolStudent = {
  id: number;
  nick: string;
  name: string;
  country: string;
  joined: string;
  level: string;
  coach: string;
  hours: number;
  goal: string;
  cert: string;
};

export type SchoolData = {
  students: SchoolStudent[];
  prog: Record<string, Record<string, number>>;
  certs: Record<string, Record<string, unknown>>;
  drills: Record<string, Array<{ text: string; done: boolean }>>;
  pix: Array<{ nick: string; days: string; map: string }>;
  nino: Array<{ nick: string; days: string; map: string }>;
  cards: Record<string, { role: string; str: string; grow: string }>;
};

export async function parseSchoolWorkbook(file: File): Promise<SchoolData | null> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const names = wb.SheetNames.map((n) => n.toLowerCase());
  if (!names.some((n) => n.includes("anagrafica") || n.includes("academy"))) return null;

  const g = (name: string) => {
    const key = wb.SheetNames.find((n) => n.toLowerCase() === name.toLowerCase())
      ?? wb.SheetNames.find((n) => n.toLowerCase().includes(name.toLowerCase()));
    if (!key) return [] as unknown[][];
    return XLSX.utils.sheet_to_json(wb.Sheets[key], { header: 1, defval: "", raw: true }) as unknown[][];
  };

  const ana = g("ANAGRAFICA");
  const header = ana.find((r) => String(r[1]).toLowerCase() === "nickname");
  const students: SchoolStudent[] = [];
  if (header) {
    for (const r of ana.slice(ana.indexOf(header) + 1)) {
      if (!r[1]) continue;
      const d = r[4];
      students.push({
        id: Number(r[0]) || students.length + 1,
        nick: String(r[1]).trim(),
        name: String(r[2] || "").trim(),
        country: String(r[3] || "").trim(),
        joined: d instanceof Date ? d.toISOString().slice(0, 10) : String(d || "").slice(0, 10),
        level: String(r[5] || "").trim(),
        coach: String(r[6] || "").replace("ARES_", ""),
        hours: Number(r[7]) || 0,
        goal: String(r[8] || ""),
        cert: String(r[9] || ""),
      });
    }
  }

  const prog: SchoolData["prog"] = {};
  for (const r of g("PROGRESSI")) {
    if (!r[0] || String(r[0]) === "Allievo") continue;
    prog[String(r[0])] = {
      aim: Number(r[1]) || 0,
      building: Number(r[2]) || 0,
      movimento: Number(r[3]) || 0,
      teamwork: Number(r[4]) || 0,
      sense: Number(r[5]) || 0,
      lead: Number(r[6]) || 0,
      avg: Number(r[7]) || 0,
    };
  }

  const certs: SchoolData["certs"] = {};
  const certRows = g("CERTIFICAZIONI");
  const ch = certRows.find((r) => String(r[0]) === "Allievo");
  if (ch) {
    for (const r of certRows.slice(certRows.indexOf(ch) + 1)) {
      if (!r[0]) continue;
      certs[String(r[0])] = {
        bronze: r[1], silver: r[2], gold: r[3], switch: r[4],
        buildP: r[5], buildPush: r[6], buildAll: r[7], mira: r[8],
        loot: r[9], sniper: r[10], teoria: r[11], armi: r[12], tw: r[13],
      };
    }
  }

  const drills: SchoolData["drills"] = {};
  for (const r of g("ESERCIZI")) {
    const nick = String(r[0] || "").trim();
    if (!nick || nick.toLowerCase().includes("esercizi")) continue;
    const items: Array<{ text: string; done: boolean }> = [];
    for (let i = 1; i < r.length; i += 2) {
      const t = String(r[i] || "").trim();
      if (t) items.push({ text: t, done: String(r[i + 1]).toLowerCase() === "true" });
    }
    drills[nick] = items;
  }

  const dash = g("ACADEMY");
  const pix: SchoolData["pix"] = [];
  const nino: SchoolData["nino"] = [];
  for (const r of dash) {
    const a = String(r[0] || "").trim();
    const b = String(r[6] || "").trim();
    if (a && a !== "allievi a carico" && a !== "ARES_PIX" && !a.startsWith("REGISTRO") && !a.toLowerCase().includes("accademy")) {
      if (String(r[1]).includes("/") || String(r[2]).toLowerCase().includes("map")) {
        pix.push({ nick: a, days: String(r[1]), map: String(r[2]) });
      }
    }
    if (b && b !== "allievi a carico" && b !== "ARES NINO" && !b.startsWith("REGISTRO")) {
      if (String(r[7]).includes("/") || String(r[8]).toLowerCase().includes("map")) {
        nino.push({ nick: b, days: String(r[7]), map: String(r[8]) });
      }
    }
  }

  const cards: SchoolData["cards"] = {};
  for (const name of wb.SheetNames.filter((n) => n.toUpperCase().includes("SCHEDA") && !n.toUpperCase().includes("BASE"))) {
    const rows = g(name);
    let nick = "";
    let role = "";
    let str = "";
    let grow = "";
    for (const r of rows) {
      const x = String(r[0] || "").trim();
      const y = String(r[1] || "").trim();
      if (x.startsWith("RUOLO")) role = y;
      else if (x.startsWith("PUNTI")) str = y;
      else if (x.startsWith("AREE")) grow = y;
      else if (x && !y && !x.includes("SCHEDA") && x.length < 40) nick = x;
    }
    if (nick) cards[nick] = { role, str, grow };
  }

  if (!students.length && !pix.length) return null;
  return { students, prog, certs, drills, pix, nino, cards };
}
