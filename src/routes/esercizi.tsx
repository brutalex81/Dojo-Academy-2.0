import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { NickLink } from "@/components/dojo/NickLink";
import { useDojoStore } from "@/lib/dojo/store";

export const Route = createFileRoute("/esercizi")({ component: Page });

function Page() {
  const school = useDojoStore((s) => s.school);
  const [who, setWho] = useState("");
  const groups = useMemo(() => {
    if (!school) return [];
    return Object.entries(school.drills)
      .filter(([nick]) => !who || nick === who)
      .map(([nick, items]) => {
        const seen = new Set<string>();
        const unique = items.filter((it) => {
          if (seen.has(it.text)) return false;
          seen.add(it.text);
          return true;
        });
        return { nick, items: unique };
      });
  }, [school, who]);

  if (!school) {
    return (
      <p className="text-sm text-muted">
        Nessun esercizio. <Link to="/import" className="text-accent">Carica il foglio</Link>
      </p>
    );
  }

  const nicks = Object.keys(school.drills);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-3xl">Esercizi</h1>
        <label className="block text-xs tracking-widest text-subtle uppercase">
          Allievo
          <select
            value={who}
            onChange={(e) => setWho(e.target.value)}
            className="mt-2 min-h-12 w-full border border-line bg-bg px-3 text-sm sm:w-64"
          >
            <option value="">Tutti</option>
            {nicks.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </header>

      {groups.map(({ nick, items }) => (
        <article key={nick} className="border border-line">
          <div className="border-b border-line px-4 py-3">
            <NickLink nick={nick} className="text-base text-fg hover:text-accent" />
          </div>
          <ul>
            {items.length ? items.map((it) => (
              <li
                key={it.text}
                className="flex items-start gap-3 border-b border-line/70 px-4 py-3 last:border-0"
              >
                <span
                  className={`mt-0.5 shrink-0 px-2 py-1 text-[10px] tracking-widest uppercase ${
                    it.done ? "bg-accent text-accent-fg" : "border border-line text-subtle"
                  }`}
                >
                  {it.done ? "ok" : "todo"}
                </span>
                <span className="text-sm leading-relaxed">{it.text}</span>
              </li>
            )) : (
              <li className="px-4 py-3 text-sm text-muted">Nessun drill assegnato</li>
            )}
          </ul>
        </article>
      ))}
    </div>
  );
}
