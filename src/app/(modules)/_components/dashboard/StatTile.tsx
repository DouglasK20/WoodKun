import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/utils/cn"

type StatTileProps = {
  label: string
  value: string
  detail?: string
  // Variação em relação a um período (ex.: "mesmo período de outubro"): número (0.12 = +12%), null = sem base para comparar
  delta?: { value: number | null; period: string }
}

// Cartão de indicador: rótulo, valor em destaque, detalhe e variação.
// A variação usa seta + texto além da cor (cor sozinha não é acessível)
export function StatTile({ label, value, detail, delta }: StatTileProps) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
      {delta && <Delta {...delta} />}
    </div>
  )
}

function Delta({ value, period }: { value: number | null; period: string }) {
  if (value === null) {
    return <p className="text-xs text-muted-foreground">Sem dados no {period} para comparar</p>
  }

  const percent = Math.round(value * 100)
  const direction = percent > 0 ? "up" : percent < 0 ? "down" : "flat"
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus

  return (
    <p
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        direction === "up" && "text-success",
        direction === "down" && "text-destructive",
        direction === "flat" && "text-muted-foreground"
      )}
    >
      <Icon className="size-3.5" />
      {percent > 0 ? "+" : ""}
      {percent}% <span className="font-normal text-muted-foreground">vs {period}</span>
    </p>
  )
}
