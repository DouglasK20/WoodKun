"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { DataTableColumnHeader } from "@/components/data_table/_components/DataTableColumnHeader"
import { useDeleteQuote, type QuoteListResponse } from "@/hooks/queries/useQuotes"
import { formatCurrency, formatDate } from "@/utils/format"
import { QuoteStatusBadge } from "./QuoteStatusBadge"

function QuoteActions({ quote }: { quote: QuoteListResponse }) {
  const deleteQuote = useDeleteQuote()

  function handleDelete() {
    if (!confirm(`Excluir o orçamento "${quote.title}"?`)) return

    deleteQuote.mutate(quote.id, {
      onError: (error) => alert(error.message),
    })
  }

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" asChild title="Editar">
        <Link href={`/orcamentos/cadastro?id=${quote.id}`}>
          <Pencil />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Excluir"
        className="cursor-pointer text-destructive hover:text-destructive"
        disabled={deleteQuote.isPending}
        onClick={handleDelete}
      >
        <Trash2 />
      </Button>
    </div>
  )
}

export const columns: ColumnDef<QuoteListResponse>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Orçamento" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.title}</div>
        <div className="text-xs text-muted-foreground">
          #{row.original.id} · {row.original.itemCount} {row.original.itemCount === 1 ? "item" : "itens"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <QuoteStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Criado em" />
    ),
    enableSorting: true,
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "validUntil",
    header: "Validade",
    cell: ({ row }) =>
      row.original.validUntil ? formatDate(row.original.validUntil) : <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    enableSorting: true,
    cell: ({ row }) => <div className="font-medium">{formatCurrency(row.original.total)}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => <QuoteActions quote={row.original} />,
  },
]
