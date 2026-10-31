"use client"

import { useMemo, useState } from "react"

import { DataTable } from "@/components/data_table/DataTable"
import { NativeSelect } from "@/components/form/NativeSelect"
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
  const [status, setStatus] = useState<QuoteStatus | "">("")

  // useMemo: só refiltra quando os dados ou o filtro mudam (e mantém o mesmo array entre renders)
  const filtered = useMemo(
    () => (status ? (data ?? EMPTY).filter((quote) => quote.status === status) : (data ?? EMPTY)),
    [data, status]
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
      emptyMessage={status ? "Nenhum orçamento com esse status." : "Nenhum orçamento cadastrado."}
      toolbarActions={
        <div className="flex items-center gap-2">
          <NativeSelect
            aria-label="Filtrar por status"
            value={status}
            onChange={(event) => setStatus(event.target.value as QuoteStatus | "")}
            className="w-40"
          >
            <option value="">Todos os status</option>
            {QUOTE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {QUOTE_STATUS_LABEL[value]}
              </option>
            ))}
          </NativeSelect>
          {toolbarActions}
        </div>
      }
    />
  )
}
