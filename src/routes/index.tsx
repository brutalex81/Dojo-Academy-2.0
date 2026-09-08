import { createFileRoute, Link } from "@tanstack/react-router";
import { NickLink } from "@/components/dojo/NickLink";
import { useDojoStore } from "@/lib/dojo/store";

export const Route = createFileRoute("/")({ component: Academy });

function Academy() {
  const school = useDojoStore((s) => s.school);
  if (!school) {
    return (
      <div className="py-16 text-center">
        <img
          src="/dojo-logo.png"
          alt="DOJO ACADEMY"
          className="mx-auto h-36 w-36 object-contain sm:h-48 sm:w-48"
        />
        <h1 className="mt-8 text-4xl tracking-[0.18em]">DOJO</h1>
        <p className="mt-3 text-xs tracking-[0.7em] text-accent">ACADEMY</p>
        <p className="mx-auto mt-6 max-w-md text-sm text-muted">
          Portale vuoto. Carica il foglio scuola o l’esempio per vedere allievi e coach.
        </p>
        <Link to="/import" className="mt-8 inline-flex min-h-11 items-center border border-accent px-5 text-sm text-accent">
          Carica Excel
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-12">
      <header className="text-center">
        <img
          src="/dojo-logo.png"
          alt="DOJO ACADEMY"
          className="mx-auto h-36 w-36 object-contain sm:h-48 sm:w-48"
        />
        <h1 className="mt-8 text-5xl tracking-[0.18em]">DOJO</h1>
        <p className="mt-4 text-xs tracking-[0.7em] text-accent">ACADEMY</p>
        <p className="mt-6 text-sm text-muted">
          {school.pix.length && school.nino.length ? "2 coach" : ""} · {school.students.length} allievi
        </p>
      </header>
      <CoachBlock name="ARES PIX" rows={school.pix} />
      <CoachBlock name="ARES NINO" rows={school.nino} />
    </div>
  );
}

function CoachBlock({ name, rows }: { name: string; rows: Array<{ nick: string; days: string; map: string }> }) {
  return (
    <section>
      <div className="border-b border-accent px-1 py-3 text-sm tracking-[0.28em] text-accent">{name}</div>
      <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-2 border-b border-line px-1 py-2 text-[10px] tracking-widest text-subtle uppercase sm:grid-cols-3 sm:text-xs">
        <span>Allievi</span>
        <span>Giorni</span>
        <span>Mappa</span>
      </div>
      {rows.map((s) => (
        <div key={s.nick} className="grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-2 border-b border-line/60 px-1 py-3 text-xs sm:grid-cols-3 sm:text-sm">
          <NickLink nick={s.nick} />
          <span className="text-muted">{s.days}</span>
          <span className="text-accent">{s.map}</span>
        </div>
      ))}
    </section>
  );
}
