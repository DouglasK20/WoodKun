import Link from "next/link"
import { CalendarClock, CircleAlert } from "lucide-react"
import type { Dashboard } from "@/services/dashboardService"
import { cn } from "@/utils/cn"
import { formatCurrency } from "@/utils/format"

type ExpiringQuote = Dashboard["expiring"][number]

function deadlineText(daysLeft: number) {
  if (daysLeft < 0) return `Venceu há ${-daysLeft} ${daysLeft === -1 ? "dia" : "dias"}`
  if (daysLeft === 0) return "Vence hoje"
  return `Vence em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`
}

// Orçamentos enviados (aguardando o cliente) cuja validade acaba em breve: bom momento para um contato
export function ExpiringQuotes({ quotes, windowDays }: { quotes: ExpiringQuote[]; windowDays: number }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <CalendarClock className="size-4 text-primary" />
          Vencendo em breve
        </h2>
        <p className="text-sm text-muted-foreground">Enviados com validade nos próximos {windowDays} dias</p>
      </div>

      {quotes.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-8 text-center text-sm text-muted-foreground">
          Nenhum orçamento enviado vence nos próximos {windowDays} dias.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {quotes.map((quote) => {
            const expired = quote.daysLeft < 0
            return (
              <li key={quote.id}>
                <Link
                  href={`/orcamentos/cadastro?id=${quote.id}`}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{quote.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{quote.customerName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium">{formatCurrency(quote.total)}</p>
                    {/* Ícone + texto além da cor: o estado não depende só do vermelho */}
                    <p className={cn("flex items-center justify-end gap-1 text-xs", expired ? "text-destructive" : "text-muted-foreground")}>
                      {expired && <CircleAlert className="size-3" />}
                      {deadlineText(quote.daysLeft)}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
