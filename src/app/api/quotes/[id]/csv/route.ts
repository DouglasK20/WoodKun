import { buildQuoteCsv, quoteFileName } from "@/services/quoteCsv"
import { getQuote } from "@/services/quoteService"
import { notFound, parseId } from "@/utils/api"

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/quotes/:id/csv
export async function GET(_request: Request, { params }: RouteContext) {
  const id = parseId((await params).id)
  const quote = id && (await getQuote(id))
  if (!quote) return notFound("Orçamento não encontrado")

  return new Response(buildQuoteCsv(quote), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      // attachment: o navegador baixa o arquivo com esse nome em vez de abrir
      "Content-Disposition": `attachment; filename="${quoteFileName(quote)}.csv"`,
    },
  })
}
