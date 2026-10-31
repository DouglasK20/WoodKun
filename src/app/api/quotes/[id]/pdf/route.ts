import { getCustomer } from "@/services/customerService"
import { quoteFileName } from "@/services/quoteCsv"
import { renderQuotePdf } from "@/services/quotePdf"
import { getQuote } from "@/services/quoteService"
import { notFound, parseId } from "@/utils/api"

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/quotes/:id/pdf
export async function GET(_request: Request, { params }: RouteContext) {
  const id = parseId((await params).id)
  const quote = id && (await getQuote(id))
  if (!quote) return notFound("Orçamento não encontrado")

  // O PDF mostra os dados completos do cliente (documento, contato, endereço)
  const customer = (await getCustomer(quote.customerId))!
  const pdf = await renderQuotePdf(quote, customer)

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // inline: abre no visualizador do navegador (de lá dá para imprimir ou baixar)
      "Content-Disposition": `inline; filename="${quoteFileName(quote)}.pdf"`,
    },
  })
}
