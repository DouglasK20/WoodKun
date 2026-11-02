"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { NewUserInput } from "@/schemas/user"
import { authClient } from "@/utils/authClient"
import type { Role } from "@/utils/permissions"
import { throwIfAuthError } from "./useAuth"

// Usuários são gerenciados pelas rotas do plugin admin do Better Auth (/api/auth/admin/…), via authClient

export const userKeys = {
  all: ["users"] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => {
      const data = throwIfAuthError(
        await authClient.admin.listUsers({ query: { limit: 500, sortBy: "name", sortDirection: "asc" } })
      )
      return data.users
    },
  })
}

export type UserListItem = NonNullable<ReturnType<typeof useUsers>["data"]>[number]

// Toda alteração recarrega a lista
function useUserMutation<Variables, Result>(mutationFn: (variables: Variables) => Promise<Result>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useCreateUser() {
  return useUserMutation(async (values: NewUserInput) => throwIfAuthError(await authClient.admin.createUser(values)))
}

export function useUpdateUser() {
  return useUserMutation(async ({ userId, role, password }: { userId: string; role: Role; password: string }) => {
    throwIfAuthError(await authClient.admin.setRole({ userId, role }))
    if (password) throwIfAuthError(await authClient.admin.setUserPassword({ userId, newPassword: password }))
  })
}

// Bloquear também encerra as sessões abertas do usuário
export function useSetUserBanned() {
  return useUserMutation(async ({ userId, banned }: { userId: string; banned: boolean }) =>
    throwIfAuthError(banned ? await authClient.admin.banUser({ userId }) : await authClient.admin.unbanUser({ userId }))
  )
}

export function useRemoveUser() {
  return useUserMutation(async (userId: string) => throwIfAuthError(await authClient.admin.removeUser({ userId })))
}
