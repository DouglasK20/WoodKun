"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { useCan } from "@/components/providers/UserProvider"
import { DataTableColumnHeader } from "@/components/data_table/_components/DataTableColumnHeader"
import { useDeleteCustomer, type CustomerResponse } from "@/hooks/queries/useCustomers"

function CustomerActions({ customer }: { customer: CustomerResponse }) {
  const deleteCustomer = useDeleteCustomer()
  // Sem permissão de escrita, a linha não mostra editar/excluir (a API também recusaria)
  const canEdit = useCan({ customers: ["write"] })

  function handleDelete() {
    if (!confirm(`Excluir o cliente "${customer.name}"?`)) return

    deleteCustomer.mutate(customer.id, {
      onError: (error) => alert(error.message),
    })
  }

  return (
    <div className="flex justify-end gap-1">
      {canEdit && (
        <>
          <Button variant="ghost" size="icon" asChild title="Editar">
            <Link href={`/clientes/cadastro?id=${customer.id}`}>
              <Pencil />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            className="cursor-pointer text-destructive hover:text-destructive"
            disabled={deleteCustomer.isPending}
            onClick={handleDelete}
          >
            <Trash2 />
          </Button>
        </>
      )}
    </div>
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
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => <CustomerActions customer={row.original} />,
  },
]
