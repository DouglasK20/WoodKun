"use client"

import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/shadcn/button"
import { cn } from "@/utils/cn"

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span>{title}</span>
  }

  const isSorted = column.getIsSorted()
  const alignRight = column.columnDef.meta?.align === "right" || column.columnDef.meta?.numeric

  const icon =
    isSorted === "desc" ? (
      <ArrowDown className="h-1 w-1" />
    ) : isSorted === "asc" ? (
      <ArrowUp className="h-1 w-1" />
    ) : (
      <ArrowUpDown className="h-1 w-1 opacity-50" />
    )

  // Em colunas à direita (valores), o ícone vem antes do título: assim o texto termina na mesma linha dos números.
  // A margem negativa compensa o padding do botão, alinhando o texto com a borda da coluna
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 cursor-pointer hover:bg-accent", alignRight ? "-mr-3 ml-auto flex" : "-ml-3 text-left")}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {alignRight && icon}
      <span>{title}</span>
      {!alignRight && icon}
    </Button>
  )
}
