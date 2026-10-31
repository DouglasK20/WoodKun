"use client"

import { DataTable } from "@/components/data_table/DataTable"
import { Button } from "@/components/shadcn/button"
import { Skeleton } from "@/components/shadcn/skeleton"
import { useCustomers, type CustomerResponse } from "@/hooks/queries/useCustomers"
import { columns } from "./columns"

// Fora do componente para ser sempre o mesmo array (um [] novo a cada render faria a tabela recalcular)
const EMPTY: CustomerResponse[] = []

type CustomersTableProps = {
  toolbarActions?: React.ReactNode
}

export function CustomersTable({ toolbarActions }: CustomersTableProps) {
  const { data, isLoading, isError, error, refetch } = useCustomers()

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
      name="clientes"
      data={data ?? EMPTY}
      columns={columns}
      searchConfig={{
        columnIds: ["name", "phone", "email", "city"],
        placeholder: "Buscar cliente…",
      }}
      emptyMessage="Nenhum cliente cadastrado."
      toolbarActions={toolbarActions}
    />
  )
}
