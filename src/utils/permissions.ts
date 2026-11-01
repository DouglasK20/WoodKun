// Papéis e permissões. Usado no servidor (API e Better Auth) e no client (esconder botões) — por isso fica em utils
import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"

// O que pode ser controlado. Ver os dados é liberado para qualquer usuário logado; "write" = criar, editar e excluir
// defaultStatements traz as permissões do plugin admin (gerenciar usuários e sessões)
const statement = {
  ...defaultStatements,
  materials: ["write"],
  products: ["write"],
  customers: ["write"],
  quotes: ["write"],
  company: ["write"],
} as const

export const ac = createAccessControl(statement)

export const roles = {
  // Tudo, inclusive usuários (adminAc.statements) e configurações da empresa
  admin: ac.newRole({
    ...adminAc.statements,
    materials: ["write"],
    products: ["write"],
    customers: ["write"],
    quotes: ["write"],
    company: ["write"],
  }),
  // Responsável pela tabela de materiais e pelos preços (e pelos produtos, que são calculados a partir deles)
  purchasing: ac.newRole({ materials: ["write"], products: ["write"] }),
  // Atende os clientes e monta os orçamentos
  sales: ac.newRole({ customers: ["write"], quotes: ["write"] }),
}

export type Role = keyof typeof roles
export const ROLES = Object.keys(roles) as Role[]

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  purchasing: "Compras",
  sales: "Vendas",
}

export const ROLE_DESCRIPTION: Record<Role, string> = {
  admin: "Acesso total, inclusive usuários e configurações da empresa",
  purchasing: "Cadastra materiais, atualiza preços e monta produtos",
  sales: "Cadastra clientes e monta orçamentos",
}

// Ex.: { materials: ["write"] }
export type Permission = { [Resource in keyof typeof statement]?: (typeof statement)[Resource][number][] }

// Mesma checagem no servidor e no client; papel desconhecido nunca tem permissão
export function hasPermission(role: string | null | undefined, permission: Permission) {
  const roleDefinition = roles[role as Role]
  return roleDefinition ? roleDefinition.authorize(permission).success : false
}
