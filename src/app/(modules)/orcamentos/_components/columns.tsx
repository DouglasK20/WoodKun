"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FileText, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useCan } from "@/components/providers/UserProvider"
import { DataTableColumnHeader } from "@/components/data_table/_components/DataTableColumnHeader"
import { RowActionButton, RowActionLink, RowActions } from "@/components/data_table/_components/RowActions"
import { useDeleteQuote, type QuoteListResponse } from "@/hooks/queries/useQuotes"
import { formatCurrency, formatDate } from "@/utils/format"
import { QuoteStatusBadge } from "./QuoteStatusBadge"

function QuoteActions({ quote }: { quote: QuoteListResponse }) {
  const deleteQuote = useDeleteQuote()
  // Sem permissão de escrita, a linha não mostra editar/excluir (a API também recusaria)
  const canEdit = useCan({ quotes: ["write"] })

  function handleDelete() {
    if (!confirm(`Excluir o orçamento "${quote.title}"?`)) return

    deleteQuote.mutate(quote.id, {
      onSuccess: () => toast.success("Orçamento excluído"),
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <RowActions>
      <RowActionLink href={`/api/quotes/${quote.id}/pdf`} title="Abrir PDF" icon={FileText} external />
      {canEdit && (
        <>
          <RowActionLink href={`/orcamentos/cadastro?id=${quote.id}`} title="Editar" icon={Pencil} />
          <RowActionButton title="Excluir" icon={Trash2} destructive disabled={deleteQuote.isPending} onClick={handleDelete} />
        </>
      )}
    </RowActions>
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
    meta: { numeric: true },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    enableSorting: true,
    cell: ({ row }) => <div className="font-medium">{formatCurrency(row.original.total)}</div>,
  },
  {
    id: "actions",
    // Sem rótulo visível (o padrão em tabelas); o texto continua para leitores de tela
    header: () => <span className="sr-only">Ações</span>,
    meta: { align: "right" },
    cell: ({ row }) => <QuoteActions quote={row.original} />,
  },
]
