"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Ban, CircleCheck, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { useCurrentUser } from "@/components/providers/UserProvider"
import { DataTableColumnHeader } from "@/components/data_table/_components/DataTableColumnHeader"
import { useRemoveUser, useSetUserBanned, type UserListItem } from "@/hooks/queries/useUsers"
import { cn } from "@/utils/cn"
import { ROLE_LABEL, type Role } from "@/utils/permissions"

function UserActions({ user }: { user: UserListItem }) {
  const currentUser = useCurrentUser()
  const setBanned = useSetUserBanned()
  const removeUser = useRemoveUser()
  // O administrador não pode bloquear nem excluir a si mesmo (ficaria sem acesso)
  const isSelf = user.id === currentUser.id

  function handleToggleBan() {
    const action = user.banned ? "Desbloquear" : "Bloquear"
    if (!confirm(`${action} o usuário "${user.name}"?`)) return
    setBanned.mutate({ userId: user.id, banned: !user.banned }, { onError: (error) => alert(error.message) })
  }

  function handleRemove() {
    if (!confirm(`Excluir o usuário "${user.name}"? Essa ação não pode ser desfeita.`)) return
    removeUser.mutate(user.id, { onError: (error) => alert(error.message) })
  }

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" asChild title="Editar">
        <Link href={`/usuarios/cadastro?id=${user.id}`}>
          <Pencil />
        </Link>
      </Button>
      {!isSelf && (
        <>
          <Button
            variant="ghost"
            size="icon"
            title={user.banned ? "Desbloquear" : "Bloquear"}
            className="cursor-pointer"
            disabled={setBanned.isPending}
            onClick={handleToggleBan}
          >
            {user.banned ? <CircleCheck /> : <Ban />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            className="cursor-pointer text-destructive hover:text-destructive"
            disabled={removeUser.isPending}
            onClick={handleRemove}
          >
            <Trash2 />
          </Button>
        </>
      )}
    </div>
  )
}

function NameCell({ user }: { user: UserListItem }) {
  const isSelf = useCurrentUser().id === user.id
  return (
    <span>
      {user.name}
      {isSelf && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
    </span>
  )
}

export const columns: ColumnDef<UserListItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    enableSorting: true,
    cell: ({ row }) => <NameCell user={row.original} />,
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "role",
    header: "Papel",
    cell: ({ row }) => ROLE_LABEL[row.original.role as Role] ?? row.original.role ?? "—",
  },
  {
    accessorKey: "banned",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
          row.original.banned ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
        )}
      >
        {row.original.banned ? "Bloqueado" : "Ativo"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => <UserActions user={row.original} />,
  },
]
