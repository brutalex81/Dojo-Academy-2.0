import { LANGS, type Lang } from "@/lib/dojo/community";
import { cn } from "@/lib/utils";

export function LangSwitch({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="inline-flex rounded-sm border border-line bg-surface p-0.5">
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => onChange(l.id)}
          className={cn(
            "min-h-9 min-w-11 rounded-sm px-2 font-mono text-[11px] tracking-wider",
            lang === l.id ? "bg-elevated text-accent" : "text-muted hover:text-fg",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
