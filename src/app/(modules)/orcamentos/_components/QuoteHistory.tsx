import { History } from "lucide-react"
import type { QuoteResponse } from "@/hooks/queries/useQuotes"
import { formatDateTime } from "@/utils/format"
import { QuoteStatusBadge } from "./QuoteStatusBadge"

// Linha do tempo das mudanças de status do orçamento, da mais recente para a mais antiga
export function QuoteHistory({ history }: { history: QuoteResponse["history"] }) {
  if (history.length === 0) return null

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 font-semibold">
        <History className="size-4 text-primary" />
        Histórico
      </h2>
      <ol className="relative space-y-4 border-l border-border pl-4">
        {[...history].reverse().map((entry, index) => (
          <li key={`${entry.changedAt}-${index}`} className="relative">
            {/* Ponto na linha do tempo */}
            <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-card bg-primary" aria-hidden="true" />
            <QuoteStatusBadge status={entry.status} />
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDateTime(entry.changedAt)}
              {/* Sem nome = registro criado a partir da data do orçamento, antes de existir o histórico */}
              {entry.changedByName ? ` · por ${entry.changedByName}` : ""}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
