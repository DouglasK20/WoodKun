import { NextResponse } from "next/server"
import { quoteSchema } from "@/schemas/quote"
import { createQuote, listQuotes } from "@/services/quoteService"
import { fieldError, parseBody } from "@/utils/api"

// GET /api/quotes
export async function GET() {
  return NextResponse.json(await listQuotes())
}

// POST /api/quotes
export async function POST(request: Request) {
  const { data, errorResponse } = await parseBody(request, quoteSchema)
  if (errorResponse) return errorResponse

  const result = await createQuote(data)
  if (result.invalidField === "customerId") return fieldError("customerId", "Cliente não encontrado")
  if (result.invalidField === "items") return fieldError("items", "Algum material ou produto da lista não existe mais")

  return NextResponse.json(result.quote, { status: 201 })
}
