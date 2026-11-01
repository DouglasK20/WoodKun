"use client"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Skeleton } from "@/components/shadcn/skeleton"
import { useDashboard } from "@/hooks/queries/useDashboard"
import { formatCurrency } from "@/utils/format"
import { ExpiringQuotes } from "./ExpiringQuotes"
import { MonthlyChart } from "./MonthlyChart"
import { StatTile } from "./StatTile"

const wholeCurrency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
const monthName = (month: string) => format(parseISO(`${month}-01`), "MMMM", { locale: ptBR })
const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count === 1 ? singular : pluralForm}`

// Variação percentual; sem valor no período anterior não dá para comparar
function change(current: number, previous: number) {
  return previous > 0 ? (current - previous) / previous : null
}

// Painel do Início: indicadores, gráfico mensal e orçamentos perto de vencer
export function Dashboard() {
  const { data, isLoading, error } = useDashboard()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !data) return <p className="text-sm text-destructive">{error?.message ?? "Não foi possível carregar o painel."}</p>

  const current = monthName(data.currentMonth)
  // A comparação é com o mesmo período do mês anterior (ver dashboardService)
  const previous = `mesmo período de ${monthName(data.previousMonth)}`
  const rate = data.approvalRate

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={`Orçado em ${current}`}
          value={wholeCurrency.format(data.quoted.total)}
          detail={plural(data.quoted.count, "orçamento", "orçamentos")}
          delta={{ value: change(data.quoted.total, data.quoted.previousTotal), period: previous }}
        />
        <StatTile
          label={`Aprovado em ${current}`}
          value={wholeCurrency.format(data.approved.total)}
          detail={plural(data.approved.count, "orçamento aprovado", "orçamentos aprovados")}
          delta={{ value: change(data.approved.total, data.approved.previousTotal), period: previous }}
        />
        <StatTile
          label="Aguardando resposta"
          value={formatCurrency(data.awaiting.total)}
          detail={plural(data.awaiting.count, "orçamento enviado", "orçamentos enviados")}
        />
        <StatTile
          label="Taxa de aprovação"
          value={rate.rate === null ? "—" : `${Math.round(rate.rate * 100)}%`}
          detail={
            rate.decided
              ? `${rate.approved} de ${plural(rate.decided, "decidido", "decididos")} nos últimos ${rate.windowDays} dias`
              : `Nenhum orçamento aprovado ou recusado nos últimos ${rate.windowDays} dias`
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyChart months={data.monthly} />
        </div>
        <ExpiringQuotes quotes={data.expiring} windowDays={data.expiringWindowDays} />
      </div>
    </div>
  )
}
