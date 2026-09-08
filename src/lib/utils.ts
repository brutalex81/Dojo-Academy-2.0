import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "player";
}

export function fmtNum(n: number | null | undefined, digits = 0) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("it-IT", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function fmtPct(n: number | null | undefined, digits = 1) {
  if (n == null || Number.isNaN(n)) return "—";
  const v = n > 1 ? n : n * 100;
  return `${v.toLocaleString("it-IT", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })}%`;
}

export function fmtDay(iso: string | undefined, locale = "it-IT") {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
}

export function fmtSec(n: number | null | undefined) {
  if (n == null || Number.isNaN(n) || n <= 0) return "—";
  return `${n.toLocaleString("it-IT", { maximumFractionDigits: 2 })}s`;
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

export function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdev(values: number[]) {
  if (values.length < 2) return 0;
  const m = mean(values);
  const v = values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(v);
}
