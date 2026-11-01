"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"

import { Thumbnail } from "@/components/Thumbnail"
import { Button } from "@/components/shadcn/button"
import { useCan } from "@/components/providers/UserProvider"
import { DataTableColumnHeader } from "@/components/data_table/_components/DataTableColumnHeader"
import { MEASUREMENT_UNIT_LABEL } from "@/db/constants"
import { useDeleteMaterial, type MaterialResponse } from "@/hooks/queries/useMaterials"
import { formatCurrency } from "@/utils/format"

function MaterialActions({ material }: { material: MaterialResponse }) {
  const deleteMaterial = useDeleteMaterial()
  // Sem permissão de escrita, a linha não mostra editar/excluir (a API também recusaria)
  const canEdit = useCan({ materials: ["write"] })

  function handleDelete() {
    if (!confirm(`Excluir o material "${material.name}"?`)) return

    deleteMaterial.mutate(material.id, {
      onError: (error) => alert(error.message),
    })
  }

  return (
    <div className="flex justify-end gap-1">
      {canEdit && (
        <>
          <Button variant="ghost" size="icon" asChild title="Editar">
            <Link href={`/materiais/cadastro?id=${material.id}`}>
              <Pencil />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            className="cursor-pointer text-destructive hover:text-destructive"
            disabled={deleteMaterial.isPending}
            onClick={handleDelete}
          >
            <Trash2 />
          </Button>
        </>
      )}
    </div>
  )
}

export const columns: ColumnDef<MaterialResponse>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Thumbnail src={row.original.imageUrl} alt={row.original.name} />
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-xs text-muted-foreground">
        {row.original.description ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "measurementUnit",
    header: "Unidade",
    cell: ({ row }) => MEASUREMENT_UNIT_LABEL[row.original.measurementUnit],
  },
  {
    accessorKey: "unitPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <div className="font-medium">{formatCurrency(row.original.unitPrice)}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => <MaterialActions material={row.original} />,
  },
]
