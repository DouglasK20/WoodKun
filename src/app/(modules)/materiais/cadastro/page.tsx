import { notFound } from "next/navigation"
import { MaterialForm } from "../_components/MaterialForm"

type MaterialFormPageProps = {
  // /materiais/cadastro = novo, /materiais/cadastro?id=1 = edição
  // No Next 15 os searchParams chegam como Promise
  searchParams: Promise<{ id?: string }>
}

export default async function MaterialFormPage({ searchParams }: MaterialFormPageProps) {
  const { id } = await searchParams

  const materialId = id ? Number(id) : undefined
  if (materialId !== undefined && !Number.isInteger(materialId)) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{materialId ? "Editar material" : "Novo material"}</h1>
      <MaterialForm materialId={materialId} />
    </div>
  )
}
