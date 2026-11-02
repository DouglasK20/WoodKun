"use client"

import { useMemo, useState } from "react"

import { DataTable } from "@/components/data_table/DataTable"
import { MultiSelect } from "@/components/form/Select"
import { Button } from "@/components/shadcn/button"
import { Skeleton } from "@/components/shadcn/skeleton"
import { QUOTE_STATUSES, QUOTE_STATUS_LABEL, type QuoteStatus } from "@/db/constants"
import { useQuotes, type QuoteListResponse } from "@/hooks/queries/useQuotes"
import { columns } from "./columns"

// Fora do componente para ser sempre o mesmo array (um [] novo a cada render faria a tabela recalcular)
const EMPTY: QuoteListResponse[] = []

type QuotesTableProps = {
  toolbarActions?: React.ReactNode
}

export function QuotesTable({ toolbarActions }: QuotesTableProps) {
  const { data, isLoading, isError, error, refetch } = useQuotes()
  // Nenhum marcado = todos os status
  const [statuses, setStatuses] = useState<QuoteStatus[]>([])

  // useMemo: só refiltra quando os dados ou o filtro mudam (e mantém o mesmo array entre renders)
  const filtered = useMemo(
    () => (statuses.length ? (data ?? EMPTY).filter((quote) => statuses.includes(quote.status)) : (data ?? EMPTY)),
    [data, statuses]
  )

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-3 rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button variant="outline" className="cursor-pointer" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <DataTable
      name="orcamentos"
      data={filtered}
      columns={columns}
      searchConfig={{
        columnIds: ["title", "customerName"],
        placeholder: "Buscar por título ou cliente…",
      }}
      emptyMessage={statuses.length ? "Nenhum orçamento com os status selecionados." : "Nenhum orçamento cadastrado."}
      toolbarActions={
        <div className="flex items-center gap-2">
          <MultiSelect
            aria-label="Filtrar por status"
            options={QUOTE_STATUSES.map((value) => ({ value, label: QUOTE_STATUS_LABEL[value] }))}
            value={statuses}
            onChange={(values) => setStatuses(values as QuoteStatus[])}
            placeholder="Todos os status"
            summary
            summaryLabel={(count) => `${count} status`}
            className="w-56"
          />
          {toolbarActions}
        </div>
      }
    />
  )
}
