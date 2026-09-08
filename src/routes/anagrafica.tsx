import { createFileRoute, Link } from "@tanstack/react-router";
import { NickLink } from "@/components/dojo/NickLink";
import { useDojoStore } from "@/lib/dojo/store";

export const Route = createFileRoute("/anagrafica")({ component: Page });

function Page() {
  const school = useDojoStore((s) => s.school);
  if (!school) {
    return (
      <p className="text-sm text-muted">
        Nessuna anagrafica. <Link to="/import" className="text-accent">Carica il foglio</Link>
      </p>
    );
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Anagrafica</h1>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs text-subtle uppercase">
            <tr>
              {["ID", "Nickname", "Nome", "Paese", "Ingresso", "Livello", "Coach", "Ore"].map((h) => (
                <th key={h} className="border-b border-line px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {school.students.map((s) => (
              <tr key={s.id} className="border-b border-line/70">
                <td className="px-3 py-2">{s.id}</td>
                <td className="px-3 py-2"><NickLink nick={s.nick} /></td>
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2">{s.country}</td>
                <td className="px-3 py-2">{s.joined}</td>
                <td className="px-3 py-2">{s.level || "—"}</td>
                <td className="px-3 py-2">{s.coach}</td>
                <td className="px-3 py-2">{s.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
