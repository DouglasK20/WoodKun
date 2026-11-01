import { NextResponse } from "next/server"
import { materialSchema } from "@/schemas/material"
import { createMaterial, listMaterials } from "@/services/materialService"
import { parseBody, withAuth } from "@/utils/api"

// GET /api/materials
export const GET = withAuth(async () => {
  return NextResponse.json(await listMaterials())
})

// POST /api/materials
export const POST = withAuth(async (request: Request) => {
  const { data, errorResponse } = await parseBody(request, materialSchema)
  if (errorResponse) return errorResponse

  const material = await createMaterial(data)
  return NextResponse.json(material, { status: 201 })
}, { materials: ["write"] })
