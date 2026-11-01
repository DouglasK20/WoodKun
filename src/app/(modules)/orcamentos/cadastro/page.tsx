import { notFound } from "next/navigation"
import { QuoteForm } from "../_components/QuoteForm"
import { Can, NoPermission } from "@/components/providers/UserProvider"

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
      <Can permission={{ quotes: ["write"] }} fallback={<NoPermission message="Você não tem permissão para editar orçamentos." />}>
        <QuoteForm quoteId={quoteId} />
      </Can>
    </div>
  )
}
