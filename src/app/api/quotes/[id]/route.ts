import { NextResponse } from "next/server"
import { quoteSchema } from "@/schemas/quote"
import { deleteQuote, getQuote, updateQuote } from "@/services/quoteService"
import { getCurrentUser } from "@/services/session"
import { fieldError, notFound, parseBody, parseId, withAuth } from "@/utils/api"

type RouteContext = {
  // No Next 15 os params chegam como Promise
  params: Promise<{ id: string }>
}

// GET /api/quotes/:id
export const GET = withAuth(async (_request: Request, { params }: RouteContext) => {
  const id = parseId((await params).id)
  const quote = id && (await getQuote(id))
  if (!quote) return notFound("Orçamento não encontrado")

  return NextResponse.json(quote)
})

// PUT /api/quotes/:id
export const PUT = withAuth(async (request: Request, { params }: RouteContext) => {
  const id = parseId((await params).id)
  if (!id) return notFound("Orçamento não encontrado")

  const { data, errorResponse } = await parseBody(request, quoteSchema)
  if (errorResponse) return errorResponse

  // withAuth já garantiu que há usuário logado
  const user = (await getCurrentUser())!
  const result = await updateQuote(id, data, { id: user.id, name: user.name })
  if (result.notFound) return notFound("Orçamento não encontrado")
  if (result.invalidField === "customerId") return fieldError("customerId", "Cliente não encontrado")
  if (result.invalidField === "items") return fieldError("items", "Algum material ou produto da lista não existe mais")

  return NextResponse.json(result.quote)
}, { quotes: ["write"] })

// DELETE /api/quotes/:id
export const DELETE = withAuth(async (_request: Request, { params }: RouteContext) => {
  const id = parseId((await params).id)
  if (!id) return notFound("Orçamento não encontrado")

  const result = await deleteQuote(id)
  if (result === "not_found") return notFound("Orçamento não encontrado")

  return new NextResponse(null, { status: 204 })
}, { quotes: ["write"] })
