import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/dojo/EmptyState";
import { LobbyView } from "@/components/dojo/LobbyView";
import { useAnalysis } from "@/lib/dojo/useAnalysis";

export const Route = createFileRoute("/sessions/$code")({ component: SessionPage });

function SessionPage() {
  const { code } = Route.useParams();
  const { dataset, rows } = useAnalysis();
  if (!dataset) {
    return <EmptyState title="Nessun dato" body="Carica un Excel per aprire le stanze." />;
  }
  const meta = dataset.sessions.find((s) => s.code === code);
  return <LobbyView code={code} rows={rows} meta={meta} />;
}
