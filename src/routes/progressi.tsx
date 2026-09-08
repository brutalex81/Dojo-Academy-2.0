import { createFileRoute, Link } from "@tanstack/react-router";
import { NickLink } from "@/components/dojo/NickLink";
import { aimTone, bar } from "@/lib/dojo/roster";
import { useDojoStore } from "@/lib/dojo/store";

export const Route = createFileRoute("/progressi")({ component: Page });

function Page() {
  const school = useDojoStore((s) => s.school);
  if (!school) {
    return (
      <p className="text-sm text-muted">
        Nessun progresso. <Link to="/import" className="text-accent">Carica il foglio</Link>
      </p>
    );
  }
  const rows = Object.entries(school.prog);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Progressi</h1>
      <div className="grid grid-cols-3 text-center text-xs font-semibold">
        <div className="bg-red-500 py-2 text-black">0–40%</div>
        <div className="bg-orange-400 py-2 text-black">40–80%</div>
        <div className="bg-emerald-400 py-2 text-black">80–100%</div>
      </div>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs text-subtle uppercase">
            <tr>
              {["Allievo", "AIM", "Build", "Mov", "Team", "Sense", "Lead", "Media"].map((h) => (
                <th key={h} className="border-b border-line px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([nick, p]) => {
              const m = bar(p.avg);
              return (
                <tr key={nick} className="border-b border-line/70">
                  <td className="px-3 py-2"><NickLink nick={nick} /></td>
                  {(["aim", "building", "movimento", "teamwork", "sense", "lead"] as const).map((k) => (
                    <td key={k} className="px-3 py-2 tabular">{bar(p[k])}</td>
                  ))}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 bg-elevated">
                        <div className={`h-2 ${aimTone(m)}`} style={{ width: `${m}%` }} />
                      </div>
                      <span>{m}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
