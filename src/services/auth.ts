// Configuração do Better Auth (login, sessões, usuários e papéis). Só no servidor
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"
import { db } from "@/db"
import * as schema from "@/db/schema"
import { ac, roles } from "@/utils/permissions"

const MIN_PASSWORD_LENGTH = 8

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema,
    // Tabelas no plural (users, sessions…), como o resto do banco
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    // Ninguém se cadastra sozinho: usuários são criados pelo administrador
    disableSignUp: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
  },
  hooks: {
    // As rotas do plugin admin (criar usuário, redefinir senha) não aplicam o minPasswordLength; validamos aqui
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/admin/create-user" && ctx.path !== "/admin/set-user-password") return

      const password = ctx.body?.password ?? ctx.body?.newPassword
      if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
        throw new APIError("BAD_REQUEST", { code: "PASSWORD_TOO_SHORT", message: "Password too short" })
      }
    }),
  },
  plugins: [
    // Papéis e gerenciamento de usuários (criar, trocar papel, redefinir senha, bloquear)
    admin({ ac, roles, defaultRole: "sales", adminRoles: ["admin"] }),
    // Deve ser o último plugin: grava os cookies de sessão pelo mecanismo do Next
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
