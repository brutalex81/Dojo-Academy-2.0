import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseSchoolWorkbook } from "@/lib/dojo/parseSchool";
import { parseWorkbook } from "@/lib/dojo/parseWorkbook";
import { useDojoStore } from "@/lib/dojo/store";
import { downloadText, matchesToCsv, playersToCsv } from "@/lib/dojo/export";
import { aggregatePlayers } from "@/lib/dojo/analytics";
import { useLang } from "@/lib/dojo/useLang";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/import")({ component: ImportPage });

function ImportPage() {
  const dataset = useDojoStore((s) => s.dataset);
  const saveDataset = useDojoStore((s) => s.saveDataset);
  const clear = useDojoStore((s) => s.clear);
  const pushLog = useDojoStore((s) => s.pushLog);
  const saveSchool = useDojoStore((s) => s.saveSchool);
  const school = useDojoStore((s) => s.school);
  const { t } = useLang();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  async function ingest(file: File) {
    setBusy(true);
    setStatus(`Lettura ${file.name}…`);
    pushLog(`[RUN] PARSE ${file.name}`);
    try {
      const notes: string[] = [];
      const schoolData = await parseSchoolWorkbook(file);
      if (schoolData) {
        await saveSchool(schoolData);
        notes.push(`scuola ${schoolData.students.length} allievi`);
      }
      try {
        const result = await parseWorkbook(file, file.name);
        if (result.rows.length) {
          await saveDataset(result);
          notes.push(`${result.rows.length} match · ${result.sessions.length} stanze`);
        }
      } catch {
        if (!schoolData) throw new Error("nessun foglio riconosciuto");
      }
      setStatus(notes.length ? `Importato: ${notes.join(" · ")}` : "File letto, nessun dato utile");
    } catch (err) {
      setStatus(`Errore: ${err instanceof Error ? err.message : "file non letto"}`);
      pushLog("[ERR] PARSE FAILED");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="mt-1 text-3xl font-medium tracking-tight">{t.importTitle}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{t.importBody}</p>
      </header>

      <label
        className={cn(
          "flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center",
          over && "border-accent bg-accent-dim/30",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const file = e.dataTransfer.files[0];
          if (file) void ingest(file);
        }}
      >
        <img src="/dojo-logo.png" alt="" className="mb-5 size-24 object-cover" />
        <div className="text-sm">{t.drop}</div>
        <div className="mt-1 text-xs text-muted">{t.dropHint}</div>
        <input
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void ingest(file);
          }}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {dataset || school ? (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                downloadText("dojo-allievi.csv", playersToCsv(aggregatePlayers(dataset.rows)))
              }
            >
              {t.exportPlayers}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => downloadText("dojo-match.csv", matchesToCsv(dataset.rows))}
            >
              {t.exportMatches}
            </Button>
            <Button type="button" variant="danger" onClick={() => void clear()}>
              {t.clear}
            </Button>
          </>
        ) : null}
      </div>

      {dataset ? (
        <Link
          to="/sessions"
          className="inline-flex min-h-11 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg"
        >
          {t.openLab}
        </Link>
      ) : null}

      <p className="font-mono text-xs text-muted">
        {status ||
          (dataset
            ? `Dataset locale: ${dataset.rows.length} righe · ${dataset.sessions.length} stanze`
            : "In attesa di un file .xlsx")}
      </p>

      {dataset ? (
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-mono text-[11px] tracking-[0.14em] text-subtle uppercase">Anteprima import</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>File: {dataset.fileName}</div>
            <div>Origine: {dataset.source}</div>
            <div>Fogli: {dataset.sheets.join(", ")}</div>
            <div>Righe: {dataset.rows.length}</div>
          </dl>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="font-mono text-[10px] text-subtle uppercase">
                <tr>
                  <th className="py-2">Stanza</th>
                  <th>Match</th>
                  <th>Allievi</th>
                  <th>Righe</th>
                </tr>
              </thead>
              <tbody>
                {dataset.sessions.map((s) => (
                  <tr key={s.code} className="border-t border-line">
                    <td className="py-2 font-mono">
                      <Link to="/sessions/$code" params={{ code: s.code }} className="hover:text-accent">
                        {s.code}
                        {s.current ? " · corrente" : ""}
                      </Link>
                    </td>
                    <td>{s.matches}</td>
                    <td>{s.players}</td>
                    <td>{s.rows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dataset.issues.length ? (
            <ul className="mt-4 space-y-1 text-xs text-muted">
              {dataset.issues.map((i, idx) => (
                <li key={idx}>
                  [{i.level}] {i.message}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
