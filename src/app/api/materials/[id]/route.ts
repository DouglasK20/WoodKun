import { NextResponse } from "next/server"
import { materialSchema } from "@/schemas/material"
import { deleteMaterial, getMaterial, updateMaterial } from "@/services/materialService"
import { notFound, parseBody, parseId } from "@/utils/api"

type RouteContext = {
  // No Next 15 os params chegam como Promise
  params: Promise<{ id: string }>
}

// GET /api/materials/:id
export async function GET(_request: Request, { params }: RouteContext) {
  const id = parseId((await params).id)
  const material = id && (await getMaterial(id))
  if (!material) return notFound("Material não encontrado")

  return NextResponse.json(material)
}

// PUT /api/materials/:id
export async function PUT(request: Request, { params }: RouteContext) {
  const id = parseId((await params).id)
  if (!id) return notFound("Material não encontrado")

  const { data, errorResponse } = await parseBody(request, materialSchema)
  if (errorResponse) return errorResponse

  const material = await updateMaterial(id, data)
  if (!material) return notFound("Material não encontrado")

  return NextResponse.json(material)
}

// DELETE /api/materials/:id
export async function DELETE(_request: Request, { params }: RouteContext) {
  const id = parseId((await params).id)
  if (!id) return notFound("Material não encontrado")

  const result = await deleteMaterial(id)
  if (result === "not_found") return notFound("Material não encontrado")
  if (result === "in_use") {
    return NextResponse.json(
      { error: "Este material está sendo usado em um produto ou orçamento e não pode ser excluído." },
      { status: 409 }
    )
  }

  return new NextResponse(null, { status: 204 })
}
