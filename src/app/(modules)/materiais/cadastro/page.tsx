import { notFound } from "next/navigation"
import { MaterialForm } from "../_components/MaterialForm"
import { Can, NoPermission } from "@/components/providers/UserProvider"

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
      <Can permission={{ materials: ["write"] }} fallback={<NoPermission message="Você não tem permissão para editar materiais." />}>
        <MaterialForm materialId={materialId} />
      </Can>
    </div>
  )
}
