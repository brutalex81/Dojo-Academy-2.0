import { useNavigate } from "@tanstack/react-router";
import type { SessionMeta } from "@/lib/dojo/types";
import { fmtDay } from "@/lib/utils";

export function SessionPicker({
  sessions,
  value,
}: {
  sessions: SessionMeta[];
  value?: string;
}) {
  const navigate = useNavigate();
  const current = sessions.find((s) => s.code === value);

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="font-mono text-[11px] tracking-[0.14em] text-subtle uppercase">Stanza</span>
          <select
            value={value ?? ""}
            onChange={(e) => {
              const code = e.target.value;
              if (!code) void navigate({ to: "/sessions" });
              else void navigate({ to: "/sessions/$code", params: { code } });
            }}
            className="mt-2 min-h-11 w-full rounded-sm border border-line bg-bg px-3 text-sm"
          >
            <option value="">Scegli il codice stanza</option>
            {sessions.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code}
                {s.current ? " · corrente" : ""}
                {s.date ? ` · ${fmtDay(s.date)}` : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="min-h-11 rounded-sm border border-line px-4 py-3">
          <div className="font-mono text-[10px] tracking-[0.14em] text-subtle uppercase">Giorno sessione</div>
          <div className="text-sm">
            {current?.date ? fmtDay(current.date) : current ? "Non indicato nel foglio" : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
