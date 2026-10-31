import { NextResponse } from "next/server"
import { z } from "zod"

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

export function notFound(message = "Registro não encontrado") {
  return NextResponse.json({ error: message }, { status: 404 })
}
