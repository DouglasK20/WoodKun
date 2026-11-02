"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useCan } from "@/components/providers/UserProvider"
import { DataTableColumnHeader } from "@/components/data_table/_components/DataTableColumnHeader"
import { RowActionButton, RowActionLink, RowActions } from "@/components/data_table/_components/RowActions"
import { useDeleteCustomer, type CustomerResponse } from "@/hooks/queries/useCustomers"

function CustomerActions({ customer }: { customer: CustomerResponse }) {
  const deleteCustomer = useDeleteCustomer()
  // Sem permissão de escrita, a linha não mostra editar/excluir (a API também recusaria)
  const canEdit = useCan({ customers: ["write"] })

  function handleDelete() {
    if (!confirm(`Excluir o cliente "${customer.name}"?`)) return

    deleteCustomer.mutate(customer.id, {
      onSuccess: () => toast.success("Cliente excluído"),
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <RowActions>
      {canEdit && (
        <>
          <RowActionLink href={`/clientes/cadastro?id=${customer.id}`} title="Editar" icon={Pencil} />
          <RowActionButton title="Excluir" icon={Trash2} destructive disabled={deleteCustomer.isPending} onClick={handleDelete} />
        </>
      )}
    </RowActions>
  )
}

function OptionalText({ value }: { value: string | null }) {
  return value ? <>{value}</> : <span className="text-muted-foreground">—</span>
}

export const columns: ColumnDef<CustomerResponse>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => <OptionalText value={row.original.phone} />,
  },
  {
    accessorKey: "email",
    header: "E-mail",
    cell: ({ row }) => <OptionalText value={row.original.email} />,
  },
  {
    // accessorFn: a coluna mostra um valor calculado; o id é usado pela busca e ordenação
    id: "city",
    accessorFn: (customer) => [customer.city, customer.state].filter(Boolean).join("/"),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cidade" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => <OptionalText value={getValue<string>() || null} />,
  },
  {
    id: "actions",
    // Sem rótulo visível (o padrão em tabelas); o texto continua para leitores de tela
    header: () => <span className="sr-only">Ações</span>,
    meta: { align: "right" },
    cell: ({ row }) => <CustomerActions customer={row.original} />,
  },
]
