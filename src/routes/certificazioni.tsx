import { createFileRoute, Link } from "@tanstack/react-router";
import { NickLink } from "@/components/dojo/NickLink";
import { pct } from "@/lib/dojo/roster";
import { useDojoStore } from "@/lib/dojo/store";

export const Route = createFileRoute("/certificazioni")({ component: Page });

function Page() {
  const school = useDojoStore((s) => s.school);
  if (!school) {
    return (
      <p className="text-sm text-muted">
        Nessuna certificazione. <Link to="/import" className="text-accent">Carica il foglio</Link>
      </p>
    );
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Certificazioni</h1>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs text-subtle uppercase">
            <tr>
              {["Allievo", "Bronze", "Silver", "Gold", "Switch", "Build", "Mira", "Sniper", "Teoria", "Team"].map((h) => (
                <th key={h} className="border-b border-line px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(school.certs).map(([nick, c]) => (
              <tr key={nick} className="border-b border-line/70">
                <td className="px-3 py-2"><NickLink nick={nick} /></td>
                <td className="px-3 py-2">{pct(c.bronze)}</td>
                <td className="px-3 py-2">{pct(c.silver)}</td>
                <td className="px-3 py-2">{pct(c.gold)}</td>
                <td className="px-3 py-2">{pct(c.switch)}</td>
                <td className="px-3 py-2">{pct(c.buildAll)}</td>
                <td className="px-3 py-2">{pct(c.mira)}</td>
                <td className="px-3 py-2">{pct(c.sniper)}</td>
                <td className="px-3 py-2">{pct(c.teoria)}</td>
                <td className="px-3 py-2">{pct(c.tw)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
