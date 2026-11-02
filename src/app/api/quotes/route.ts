import { NextResponse } from "next/server"
import { quoteSchema } from "@/schemas/quote"
import { createQuote, listQuotes } from "@/services/quoteService"
import { getCurrentUser } from "@/services/session"
import { fieldError, parseBody, withAuth } from "@/utils/api"

// GET /api/quotes
export const GET = withAuth(async () => {
  return NextResponse.json(await listQuotes())
})

// POST /api/quotes
export const POST = withAuth(async (request: Request) => {
  const { data, errorResponse } = await parseBody(request, quoteSchema)
  if (errorResponse) return errorResponse

  // withAuth já garantiu que há usuário logado
  const user = (await getCurrentUser())!
  const result = await createQuote(data, { id: user.id, name: user.name })
  if (result.invalidField === "customerId") return fieldError("customerId", "Cliente não encontrado")
  if (result.invalidField === "items") return fieldError("items", "Algum material ou produto da lista não existe mais")

  return NextResponse.json(result.quote, { status: 201 })
}, { quotes: ["write"] })
