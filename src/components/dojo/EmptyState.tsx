import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/dojo/useLang";

export function EmptyState({ title, body }: { title?: string; body?: string }) {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-xl py-6 text-center">
      <img
        src="/dojo-logo.png"
        alt="Dojo Academy"
        className="seal mx-auto mb-8 size-44 rounded-full object-cover sm:size-56"
      />
      <h2 className="font-display text-4xl sm:text-5xl">{title ?? t.emptyTitle}</h2>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted">{body ?? t.emptyBody}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/import">
          <Button>{t.loadExcel}</Button>
        </Link>
        <Link to="/scuola">
          <Button variant="ghost">{t.school}</Button>
        </Link>
      </div>
    </div>
  );
}
