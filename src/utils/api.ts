import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/services/session"
import { hasPermission, type Permission } from "@/utils/permissions"

// Helpers compartilhados pelas rotas em src/app/api

export function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

// Lê o corpo como JSON e valida com o schema. Em caso de erro já devolve a resposta 400 pronta
export async function parseBody<T extends z.ZodType>(request: Request, schema: T) {
  const body = await request.json().catch(() => null)
  const result = schema.safeParse(body)

  if (!result.success) {
    return {
      data: null,
      errorResponse: NextResponse.json(
        { error: "Dados inválidos", fieldErrors: z.flattenError(result.error).fieldErrors },
        { status: 400 }
      ),
    }
  }

  return { data: result.data as z.infer<T>, errorResponse: null }
}

// 400 para um campo específico, no mesmo formato da validação do zod (o form mostra embaixo do campo)
export function fieldError(field: string, message: string) {
  return NextResponse.json({ error: "Dados inválidos", fieldErrors: { [field]: [message] } }, { status: 400 })
}

export function unauthorized() {
  return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: "Você não tem permissão para fazer isso." }, { status: 403 })
}

// Envolve um route handler: sem usuário logado responde 401; sem a permissão pedida, 403
// Uso: export const GET = withAuth(async (request, context) => { ... })
//      export const POST = withAuth(async (request) => { ... }, { materials: ["write"] })
export function withAuth<Context>(
  handler: (request: Request, context: Context) => Promise<Response>,
  permission?: Permission
) {
  return async (request: Request, context: Context) => {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    if (permission && !hasPermission(user.role, permission)) return forbidden()
    return handler(request, context)
  }
}

export function notFound(message = "Registro não encontrado") {
  return NextResponse.json({ error: message }, { status: 404 })
}
