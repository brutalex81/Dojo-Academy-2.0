import school from "./school.json";

export const SCHOOL = school;
export const STUDENTS = school.students;

export function pct(v: unknown) {
  if (v === "/" || v === "" || v == null) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  if (n > 1 && n <= 10) return String(n);
  const p = n <= 1 ? n * 100 : n;
  return `${Math.round(p)}%`;
}

export function bar(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return n <= 1 ? Math.round(n * 100) : Math.round(n);
}

export function aimTone(n: number) {
  if (n >= 80) return "bg-emerald-400";
  if (n >= 40) return "bg-orange-400";
  return "bg-red-500";
}

export function findCard(nick: string, cards?: Record<string, { role: string; str: string; grow: string }>) {
  const source = cards ?? school.cards;
  const key = Object.keys(source).find(
    (k) => k.replace(/\s+/g, "_").toLowerCase() === nick.replace(/\s+/g, "_").toLowerCase(),
  );
  return key ? source[key as keyof typeof source] : null;
}
