"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"

import { Thumbnail } from "@/components/Thumbnail"
import { Button } from "@/components/shadcn/button"
import { useCan } from "@/components/providers/UserProvider"
import { DataTableColumnHeader } from "@/components/data_table/_components/DataTableColumnHeader"
import { useDeleteProduct, type ProductListResponse } from "@/hooks/queries/useProducts"
import { formatCurrency } from "@/utils/format"

function ProductActions({ product }: { product: ProductListResponse }) {
  const deleteProduct = useDeleteProduct()
  // Sem permissão de escrita, a linha não mostra editar/excluir (a API também recusaria)
  const canEdit = useCan({ products: ["write"] })

  function handleDelete() {
    if (!confirm(`Excluir o produto "${product.name}"?`)) return

    deleteProduct.mutate(product.id, {
      onError: (error) => alert(error.message),
    })
  }

  return (
    <div className="flex justify-end gap-1">
      {canEdit && (
        <>
          <Button variant="ghost" size="icon" asChild title="Editar">
            <Link href={`/produtos/cadastro?id=${product.id}`}>
              <Pencil />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            className="cursor-pointer text-destructive hover:text-destructive"
            disabled={deleteProduct.isPending}
            onClick={handleDelete}
          >
            <Trash2 />
          </Button>
        </>
      )}
    </div>
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
    header: "Materiais",
  },
  {
    accessorKey: "materialsCost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Custo" />
    ),
    enableSorting: true,
    cell: ({ row }) => formatCurrency(row.original.materialsCost),
  },
  {
    accessorKey: "profitMargin",
    header: "Margem",
    cell: ({ row }) => `${row.original.profitMargin.toLocaleString("pt-BR")}%`,
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Preço final" />
    ),
    enableSorting: true,
    cell: ({ row }) => <div className="font-medium">{formatCurrency(row.original.price)}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => <ProductActions product={row.original} />,
  },
]
