import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { aggregatePlayers, weaponBoards } from "@/lib/dojo/analytics";
import type { PlayerMatch, SessionMeta } from "@/lib/dojo/types";
import { useLang } from "@/lib/dojo/useLang";
import { cn, fmtDay, fmtNum, fmtPct } from "@/lib/utils";

export function LobbyView({
  code,
  rows,
  meta,
}: {
  code: string;
  rows: PlayerMatch[];
  meta?: SessionMeta;
}) {
  const { t, lang } = useLang();
  const locale = lang === "en" ? "en-GB" : "it-IT";
  const [weapon, setWeapon] = useState("");
  const sessionRows = useMemo(
    () => rows.filter((r) => r.sessionCode === code && r.player.toLowerCase() !== "totals"),
    [rows, code],
  );
  const players = useMemo(() => aggregatePlayers(sessionRows), [sessionRows]);
  const boards = useMemo(() => weaponBoards(players, 1), [players]);
  const weapons = useMemo(() => {
    const set = new Set<string>();
    for (const p of players) {
      for (const w of p.weapons) if (w.shotsFired > 0 || w.damage > 0) set.add(w.weapon);
    }
    return [...set].sort();
  }, [players]);

  const ranked = [...players].sort((a, b) => {
    if (!weapon) return b.accuracy - a.accuracy || b.revives - a.revives;
    const wa = a.weapons.find((w) => w.weapon === weapon);
    const wb = b.weapons.find((w) => w.weapon === weapon);
    const aa = wa && wa.shotsFired ? wa.shotsHit / wa.shotsFired : -1;
    const bb = wb && wb.shotsFired ? wb.shotsHit / wb.shotsFired : -1;
    return bb - aa;
  });

  const lobbyAcc =
    players.reduce((a, p) => a + p.shotsHit, 0) / Math.max(1, players.reduce((a, p) => a + p.shotsFired, 0));
  const resTotal = players.reduce((a, p) => a + p.revives, 0);
  const matches = new Set(sessionRows.map((r) => r.match)).size;

  return (
    <section className="board p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-5xl leading-none text-accent">{code}</h2>
          <p className="mt-2 text-sm text-muted">
            {meta?.date ? fmtDay(meta.date, locale) : t.noDate}
            {meta?.current ? ` · ${t.current}` : ""} · {players.length} {t.students} · {matches} {t.matches}
          </p>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="text-xs tracking-widest text-subtle uppercase">{t.accuracy}</div>
            <div className="font-display text-3xl">{fmtPct(lobbyAcc)}</div>
          </div>
          <div>
            <div className="text-xs tracking-widest text-subtle uppercase">{t.revive}</div>
            <div className="font-display text-3xl">{fmtNum(resTotal)}</div>
          </div>
        </div>
      </div>

      <label className="mt-6 block max-w-sm">
        <span className="text-xs tracking-widest text-subtle uppercase">{t.weapon}</span>
        <select
          value={weapon}
          onChange={(e) => setWeapon(e.target.value)}
          className="mt-2 min-h-12 w-full cursor-pointer border border-accent/50 bg-bg px-3 text-sm"
        >
          <option value="">{t.allWeapons}</option>
          {weapons.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setWeapon("")}
          className={cn(
            "min-h-11 cursor-pointer border px-3 text-xs",
            weapon === "" ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:border-accent",
          )}
        >
          {t.lobby}
        </button>
        {weapons.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWeapon(w)}
            className={cn(
              "min-h-11 cursor-pointer border px-3 text-xs",
              weapon === w ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:border-accent",
            )}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs tracking-widest text-subtle uppercase">
            <tr className="border-b border-accent/30">
              <th className="py-3 pr-3">#</th>
              <th className="py-3">{t.player}</th>
              <th className="py-3">{t.accuracy}</th>
              <th className="py-3">{t.revive}</th>
              <th className="py-3">{t.score}</th>
              <th className="py-3">{t.damage}</th>
              <th className="py-3">{t.kills}</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((p, i) => {
              const w = weapon ? p.weapons.find((x) => x.weapon === weapon) : null;
              const acc = w && w.shotsFired ? w.shotsHit / w.shotsFired : p.accuracy;
              return (
                <tr key={p.id} className="border-b border-line/80 hover:bg-elevated/50">
                  <td className="py-3 pr-3 font-mono text-subtle">{String(i + 1).padStart(2, "0")}</td>
                  <td className="py-3">
                    <Link to="/players/$playerId" params={{ playerId: p.id }} className="hover:text-accent">
                      {p.name}
                    </Link>
                  </td>
                  <td className="tabular py-3">{fmtPct(acc)}</td>
                  <td className="tabular py-3">{p.revives}</td>
                  <td className="tabular py-3">{p.trainingScore}</td>
                  <td className="tabular py-3">{fmtNum(w ? w.damage : p.damage)}</td>
                  <td className="tabular py-3 text-subtle">{fmtNum(p.kills)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {weapon && boards.find((b) => b.weapon === weapon) ? (
        <p className="mt-4 text-xs text-subtle">
          {t.weaponHint}: {weapon}. {t.weaponHint2}
        </p>
      ) : null}
    </section>
  );
}
