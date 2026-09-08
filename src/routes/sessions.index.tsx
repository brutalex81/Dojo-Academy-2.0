import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/dojo/EmptyState";
import { LobbyView } from "@/components/dojo/LobbyView";
import { useAnalysis } from "@/lib/dojo/useAnalysis";
import { useLang } from "@/lib/dojo/useLang";
import { cn, fmtDay } from "@/lib/utils";

export const Route = createFileRoute("/sessions/")({ component: Stats });

function Stats() {
  const { t, lang } = useLang();
  const locale = lang === "en" ? "en-GB" : "it-IT";
  const { dataset, rows } = useAnalysis();
  const first = dataset?.sessions.find((s) => s.current)?.code ?? dataset?.sessions[0]?.code ?? "";
  const [code, setCode] = useState("");
  const active = dataset?.sessions.some((s) => s.code === code) ? code : first;
  const meta = dataset?.sessions.find((s) => s.code === active);
  const dates = useMemo(
    () => [...new Set((dataset?.sessions ?? []).map((s) => s.date).filter(Boolean))].sort(),
    [dataset],
  );

  if (!dataset) return <EmptyState />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Statbot</h1>
      {dates.length ? (
        <p className="text-xs text-subtle">{t.day}: {dates.map((d) => fmtDay(d, locale)).join(" · ")}</p>
      ) : (
        <p className="text-xs text-subtle">{t.noDates}</p>
      )}
      <div className="grid gap-8 lg:grid-cols-[210px_1fr]">
        <aside className="flex gap-2 overflow-x-auto lg:flex-col">
          {dataset.sessions.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => setCode(s.code)}
              className={cn(
                "min-h-12 shrink-0 border px-3 py-2 text-left",
                s.code === active ? "border-accent text-accent" : "border-line text-muted",
              )}
            >
              <div className="font-mono text-sm">{s.code}</div>
            </button>
          ))}
        </aside>
        {active ? <LobbyView key={active} code={active} rows={rows} meta={meta} /> : null}
      </div>
    </div>
  );
}
