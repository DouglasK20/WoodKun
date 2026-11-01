"use client"

import { createContext, useContext } from "react"
import { hasPermission, type Permission } from "@/utils/permissions"

export type CurrentUser = {
  id: string
  name: string
  email: string
  role: string | null
}

const UserContext = createContext<CurrentUser | null>(null)

// O layout (servidor) já sabe quem está logado: passa para cá e as telas leem sem precisar buscar de novo
export function UserProvider({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useCurrentUser() {
  const user = useContext(UserContext)
  if (!user) throw new Error("useCurrentUser precisa estar dentro de <UserProvider>")
  return user
}

// Para esconder botões: const canEdit = useCan({ materials: ["write"] })
// (só esconde na tela; quem garante a regra de verdade é a API, com withAuth)
export function useCan(permission: Permission) {
  return hasPermission(useCurrentUser().role, permission)
}

type CanProps = {
  permission: Permission
  // O que mostrar sem permissão (padrão: nada)
  fallback?: React.ReactNode
  children: React.ReactNode
}

// Versão em componente do useCan, para usar dentro de server components: <Can permission={...}>…</Can>
export function Can({ permission, fallback = null, children }: CanProps) {
  return useCan(permission) ? children : fallback
}

// Aviso para quem abre direto o endereço de uma tela que não pode usar
export function NoPermission({ message = "Você não tem permissão para acessar esta tela." }: { message?: string }) {
  return (
    <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">{message}</p>
  )
}
