"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CHART_COLORS, EChart, type EChartOption } from "@/components/charts/EChart"
import type { Dashboard } from "@/services/dashboardService"
import { cn } from "@/utils/cn"
import { formatCurrency } from "@/utils/format"

type Month = Dashboard["monthly"][number]

const monthLabel = (month: string, pattern: string) => {
  const label = format(parseISO(`${month}-01`), pattern, { locale: ptBR })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// Eixo com valores compactos: R$ 1,2 mil
const compactCurrency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 })

function buildOption(months: Month[]): EChartOption {
  const series = [
    { name: "Orçado", key: "quoted" as const, color: CHART_COLORS.context },
    { name: "Aprovado", key: "approved" as const, color: CHART_COLORS.accent },
  ]

  return {
    textStyle: { fontFamily: "inherit", color: CHART_COLORS.text },
    grid: { left: 8, right: 8, top: 40, bottom: 4, containLabel: true },
    legend: {
      top: 0,
      left: 0,
      icon: "roundRect",
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 16,
      textStyle: { color: CHART_COLORS.muted, fontSize: 12 },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow", shadowStyle: { color: "rgba(143, 76, 20, 0.06)" } },
      backgroundColor: CHART_COLORS.surface,
      borderColor: CHART_COLORS.grid,
      textStyle: { color: CHART_COLORS.text, fontSize: 12 },
      valueFormatter: (value) => formatCurrency(Number(value)),
    },
    xAxis: {
      type: "category",
      data: months.map((month) => monthLabel(month.month, "MMM")),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: CHART_COLORS.grid } },
      axisLabel: { color: CHART_COLORS.muted },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: CHART_COLORS.muted, formatter: (value: number) => (value === 0 ? "0" : compactCurrency.format(value)) },
      splitLine: { lineStyle: { color: CHART_COLORS.grid, type: "dashed" } },
    },
    series: series.map(({ name, key, color }) => ({
      name,
      type: "bar",
      data: months.map((month) => month[key]),
      itemStyle: { color, borderRadius: [4, 4, 0, 0] },
      barMaxWidth: 28,
      // Espaço entre as duas colunas do mesmo mês
      barGap: "15%",
      // Sem "apagar" a outra série no hover: o tooltip já compara as duas no mês
      emphasis: { disabled: true },
    })),
  }
}

// Orçado × aprovado por mês. Gráfico ou tabela com os mesmos números (para leitura exata e acessibilidade)
export function MonthlyChart({ months }: { months: Month[] }) {
  const [view, setView] = useState<"chart" | "table">("chart")
  const option = useMemo(() => buildOption(months), [months])
  const hasData = months.some((month) => month.quoted > 0)

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Orçado × aprovado</h2>
          <p className="text-sm text-muted-foreground">Por mês de criação do orçamento, últimos {months.length} meses</p>
        </div>
        <div className="flex rounded-md border border-border p-0.5 text-xs" role="group" aria-label="Formato">
          {(["chart", "table"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={cn(
                "cursor-pointer rounded px-2.5 py-1 transition-colors",
                view === option ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option === "chart" ? "Gráfico" : "Tabela"}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">
          Nenhum orçamento criado nos últimos {months.length} meses.
        </p>
      ) : view === "chart" ? (
        <EChart option={option} ariaLabel="Gráfico de colunas com o valor orçado e o valor aprovado em cada um dos últimos meses" />
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Mês</th>
                <th className="px-3 py-2 text-right font-medium">Orçamentos</th>
                <th className="px-3 py-2 text-right font-medium">Orçado</th>
                <th className="px-3 py-2 text-right font-medium">Aprovado</th>
              </tr>
            </thead>
            {/* tabular-nums: números alinhados na coluna */}
            <tbody className="tabular-nums">
              {months.map((month) => (
                <tr key={month.month} className="border-t border-border">
                  <td className="px-3 py-2">{monthLabel(month.month, "MMMM 'de' yyyy")}</td>
                  <td className="px-3 py-2 text-right">{month.count}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(month.quoted)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(month.approved)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
