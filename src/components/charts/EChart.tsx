"use client"

import { useEffect, useRef } from "react"
import { BarChart, type BarSeriesOption } from "echarts/charts"
import {
  AriaComponent,
  GridComponent,
  type GridComponentOption,
  LegendComponent,
  type LegendComponentOption,
  TooltipComponent,
  type TooltipComponentOption,
} from "echarts/components"
// "use" do ECharts renomeado: o lint o confundia com o hook use() do React
import { type ComposeOption, init, use as registerEChartsModules, type EChartsType } from "echarts/core"
import { SVGRenderer } from "echarts/renderers"
import { cn } from "@/utils/cn"

// Registra só o que usamos (importar "echarts" inteiro levaria a biblioteca toda para o navegador).
// Novo tipo de gráfico? Registre aqui e acrescente o tipo da opção em EChartOption
registerEChartsModules([BarChart, GridComponent, TooltipComponent, LegendComponent, AriaComponent, SVGRenderer])

export type EChartOption = ComposeOption<
  BarSeriesOption | GridComponentOption | TooltipComponentOption | LegendComponentOption
>

// Cores dos gráficos em hexadecimal (o ECharts não lê as variáveis CSS do tema)
export const CHART_COLORS = {
  text: "#3b342e",
  muted: "#7a7067",
  grid: "#ece6df",
  surface: "#ffffff",
  // Ênfase: a série principal no destaque, a de contexto em cinza (validados: ΔE 17,9 normal / 16,4 daltonismo)
  accent: "#8f4c14",
  context: "#8f8a85",
}

type EChartProps = {
  option: EChartOption
  className?: string
  // Descrição para leitores de tela
  ariaLabel: string
}

// Monta o gráfico no div, atualiza quando a opção muda e redimensiona junto com o card
export function EChart({ option, className, ariaLabel }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<EChartsType | null>(null)

  useEffect(() => {
    const chart = init(containerRef.current!, undefined, { renderer: "svg" })
    chartRef.current = chart
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(containerRef.current!)

    return () => {
      observer.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    // notMerge: substitui a opção inteira (sem restos da anterior)
    chartRef.current?.setOption({ ...option, aria: { enabled: true, label: { description: ariaLabel } } }, { notMerge: true })
  }, [option, ariaLabel])

  return <div ref={containerRef} role="img" aria-label={ariaLabel} className={cn("h-72 w-full", className)} />
}
