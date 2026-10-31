import { notFound } from "next/navigation"
import { CustomerForm } from "../_components/CustomerForm"

type CustomerFormPageProps = {
  // No Next 15 os searchParams chegam como Promise
  searchParams: Promise<{ id?: string }>
}

export default async function CustomerFormPage({ searchParams }: CustomerFormPageProps) {
  const { id } = await searchParams

  const customerId = id ? Number(id) : undefined
  if (customerId !== undefined && !Number.isInteger(customerId)) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{customerId ? "Editar cliente" : "Novo cliente"}</h1>
      <CustomerForm customerId={customerId} />
    </div>
  )
}
