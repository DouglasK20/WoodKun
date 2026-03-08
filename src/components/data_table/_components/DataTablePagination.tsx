"use client"

import { Table } from "@tanstack/react-table"
import { Button } from "@/components/shadcn/button"
import { cn } from "@/utils/cn"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  className?: string
}

export function DataTablePagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const start = pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className={cn("flex items-center justify-between gap-4 px-1", className)}>
      <p className="text-xs text-muted-foreground">
        {totalRows > 0 ? (
          <>
            Exibindo {start} a {end} de {totalRows} itens.
          </>
        ) : (
          "0 resultados"
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-wood-border hover:bg-wood-muted"
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-wood-border hover:bg-wood-muted"
        >
          Próximo
        </Button>
      </div>
    </div>
  )
}
