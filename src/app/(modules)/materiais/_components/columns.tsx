"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Thumbnail } from "@/components/Thumbnail"
import { useCan } from "@/components/providers/UserProvider"
import { DataTableColumnHeader } from "@/components/data_table/_components/DataTableColumnHeader"
import { RowActionButton, RowActionLink, RowActions } from "@/components/data_table/_components/RowActions"
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
      onSuccess: () => toast.success("Material excluído"),
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <RowActions>
      {canEdit && (
        <>
          <RowActionLink href={`/materiais/cadastro?id=${material.id}`} title="Editar" icon={Pencil} />
          <RowActionButton title="Excluir" icon={Trash2} destructive disabled={deleteMaterial.isPending} onClick={handleDelete} />
        </>
      )}
    </RowActions>
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
    meta: { numeric: true },
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
    // Sem rótulo visível (o padrão em tabelas); o texto continua para leitores de tela
    header: () => <span className="sr-only">Ações</span>,
    meta: { align: "right" },
    cell: ({ row }) => <MaterialActions material={row.original} />,
  },
]
