import { notFound } from "next/navigation"
import { QuoteForm } from "../_components/QuoteForm"

type QuoteFormPageProps = {
  // No Next 15 os searchParams chegam como Promise
  searchParams: Promise<{ id?: string }>
}

export default async function QuoteFormPage({ searchParams }: QuoteFormPageProps) {
  const { id } = await searchParams

  const quoteId = id ? Number(id) : undefined
  if (quoteId !== undefined && !Number.isInteger(quoteId)) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{quoteId ? "Editar orçamento" : "Novo orçamento"}</h1>
      <QuoteForm quoteId={quoteId} />
    </div>
  )
}
