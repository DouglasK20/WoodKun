"use client"

import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { ac, roles } from "./permissions"

// Cliente do Better Auth no navegador: login, logout, sessão e gerenciamento de usuários (admin)
// Sem baseURL: usa o mesmo endereço da página (funciona em localhost e em produção)
export const authClient = createAuthClient({
  plugins: [adminClient({ ac, roles })],
})
