import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/dojo/useLang";

export const Route = createFileRoute("/scuola")({ component: Scuola });

const SCHOOL = "https://discord.gg/xw5byvvKn";

function Scuola() {
  const { t } = useLang();
  return (
    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 md:items-center">
      <img src="/dojo-logo.png" alt="Dojo Academy" className="mx-auto w-full max-w-sm" />
      <div>
        <h1 className="font-display text-5xl">{t.schoolTitle}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">{t.schoolBody}</p>
        <a
          href={SCHOOL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-fg"
        >
          {t.schoolCta}
        </a>
      </div>
    </div>
  );
}
