"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Thumbnail } from "@/components/Thumbnail"
import { useCan } from "@/components/providers/UserProvider"
import { DataTableColumnHeader } from "@/components/data_table/_components/DataTableColumnHeader"
import { RowActionButton, RowActionLink, RowActions } from "@/components/data_table/_components/RowActions"
import { useDeleteProduct, type ProductListResponse } from "@/hooks/queries/useProducts"
import { formatCurrency } from "@/utils/format"

function ProductActions({ product }: { product: ProductListResponse }) {
  const deleteProduct = useDeleteProduct()
  // Sem permissão de escrita, a linha não mostra editar/excluir (a API também recusaria)
  const canEdit = useCan({ products: ["write"] })

  function handleDelete() {
    if (!confirm(`Excluir o produto "${product.name}"?`)) return

    deleteProduct.mutate(product.id, {
      onSuccess: () => toast.success("Produto excluído"),
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <RowActions>
      {canEdit && (
        <>
          <RowActionLink href={`/produtos/cadastro?id=${product.id}`} title="Editar" icon={Pencil} />
          <RowActionButton title="Excluir" icon={Trash2} destructive disabled={deleteProduct.isPending} onClick={handleDelete} />
        </>
      )}
    </RowActions>
  )
}

export const columns: ColumnDef<ProductListResponse>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Thumbnail src={row.original.imageUrl} alt={row.original.name} />
        <div>
          <div>{row.original.name}</div>
          {row.original.description && (
            <div className="line-clamp-1 max-w-xs text-xs text-muted-foreground">{row.original.description}</div>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "materialCount",
    meta: { numeric: true },
    header: "Materiais",
  },
  {
    accessorKey: "materialsCost",
    meta: { numeric: true },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Custo" />
    ),
    enableSorting: true,
    cell: ({ row }) => formatCurrency(row.original.materialsCost),
  },
  {
    accessorKey: "profitMargin",
    meta: { numeric: true },
    header: "Margem",
    cell: ({ row }) => `${row.original.profitMargin.toLocaleString("pt-BR")}%`,
  },
  {
    accessorKey: "price",
    meta: { numeric: true },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Preço final" />
    ),
    enableSorting: true,
    cell: ({ row }) => <div className="font-medium">{formatCurrency(row.original.price)}</div>,
  },
  {
    id: "actions",
    // Sem rótulo visível (o padrão em tabelas); o texto continua para leitores de tela
    header: () => <span className="sr-only">Ações</span>,
    meta: { align: "right" },
    cell: ({ row }) => <ProductActions product={row.original} />,
  },
]
