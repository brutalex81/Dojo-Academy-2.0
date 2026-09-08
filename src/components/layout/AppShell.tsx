import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDojoStore } from "@/lib/dojo/store";
import { useLang } from "@/lib/dojo/useLang";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const load = useDojoStore((s) => s.load);
  const clear = useDojoStore((s) => s.clear);
  const { lang, choose, t } = useLang();
  const nav = [
    { to: "/", label: "Academy" },
    { to: "/anagrafica", label: "Anagrafica" },
    { to: "/progressi", label: "Progressi" },
    { to: "/certificazioni", label: "Cert" },
    { to: "/esercizi", label: "Esercizi" },
    { to: "/players", label: t.reports },
    { to: "/sessions", label: "Statbot" },
    { to: "/import", label: t.upload },
    { to: "/scuola", label: t.school },
  ] as const;

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="sticky top-0 z-50 border-b border-accent/30 bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-3 sm:h-20 sm:px-4">
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src="/dojo-logo.png"
              alt="DOJO ACADEMY"
              width={56}
              height={56}
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
            />
          </Link>
          <nav className="ml-auto hidden items-center gap-5 lg:flex">
            {nav.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/" || pathname.startsWith("/sessions")
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "text-sm tracking-[0.14em] uppercase",
                    active ? "text-accent" : "text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => void clear()}
              className="min-h-10 border border-line px-3 text-xs text-muted hover:border-accent hover:text-accent"
            >
              Svuota
            </button>
            <div className="flex overflow-hidden border border-line">
              <button
                type="button"
                onClick={() => choose("it")}
                className={cn("min-h-10 px-3 text-xs", lang === "it" ? "bg-accent text-accent-fg" : "text-muted")}
              >
                IT
              </button>
              <button
                type="button"
                onClick={() => choose("en")}
                className={cn("min-h-10 px-3 text-xs", lang === "en" ? "bg-accent text-accent-fg" : "text-muted")}
              >
                EN
              </button>
            </div>
          </nav>
          <button
            className="ml-auto inline-flex size-12 items-center justify-center border border-line lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open ? (
          <nav className="grid gap-1 border-t border-line px-4 py-3 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center text-sm text-muted"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                void clear();
                setOpen(false);
              }}
              className="mt-2 min-h-12 border border-line text-sm text-muted"
            >
              Svuota
            </button>
            <div className="flex gap-2 py-2">
              <button type="button" onClick={() => choose("it")} className="min-h-10 border border-line px-3 text-xs">
                IT
              </button>
              <button type="button" onClick={() => choose("en")} className="min-h-10 border border-line px-3 text-xs">
                EN
              </button>
            </div>
          </nav>
        ) : null}
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-4 sm:py-10">{children}</main>
      <footer className="border-t border-accent/20 py-7 text-center text-sm text-subtle">
        Powered by <span className="typewriter text-accent">Brutalex</span>
      </footer>
    </div>
  );
}
