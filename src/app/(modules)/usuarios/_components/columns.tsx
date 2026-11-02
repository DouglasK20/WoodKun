"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Ban, CircleCheck, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useCurrentUser } from "@/components/providers/UserProvider"
import { DataTableColumnHeader } from "@/components/data_table/_components/DataTableColumnHeader"
import { RowActionButton, RowActionLink, RowActions } from "@/components/data_table/_components/RowActions"
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
    setBanned.mutate(
      { userId: user.id, banned: !user.banned },
      {
        onSuccess: () => toast.success(user.banned ? `${user.name} desbloqueado` : `${user.name} bloqueado`),
        onError: (error) => toast.error(error.message),
      }
    )
  }

  function handleRemove() {
    if (!confirm(`Excluir o usuário "${user.name}"? Essa ação não pode ser desfeita.`)) return
    removeUser.mutate(user.id, {
      onSuccess: () => toast.success("Usuário excluído"),
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <RowActions>
      <RowActionLink href={`/usuarios/cadastro?id=${user.id}`} title="Editar" icon={Pencil} />
      {!isSelf && (
        <>
          <RowActionButton title={user.banned ? "Desbloquear" : "Bloquear"} icon={user.banned ? CircleCheck : Ban} disabled={setBanned.isPending} onClick={handleToggleBan} />
          <RowActionButton title="Excluir" icon={Trash2} destructive disabled={removeUser.isPending} onClick={handleRemove} />
        </>
      )}
    </RowActions>
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
    // Sem rótulo visível (o padrão em tabelas); o texto continua para leitores de tela
    header: () => <span className="sr-only">Ações</span>,
    meta: { align: "right" },
    cell: ({ row }) => <UserActions user={row.original} />,
  },
]
