import { NextResponse } from "next/server"
import { saveImage } from "@/services/uploadService"
import { getCurrentUser } from "@/services/session"
import { fieldError, forbidden, withAuth } from "@/utils/api"
import { hasPermission } from "@/utils/permissions"

// POST /api/uploads (multipart/form-data, campo "file")
export const POST = withAuth(async (request: Request) => {
  // Imagens existem em materiais, produtos e no logo da empresa: basta poder editar um deles
  const role = (await getCurrentUser())?.role
  const canUpload = (["materials", "products", "company"] as const).some((resource) =>
    hasPermission(role, { [resource]: ["write"] })
  )
  if (!canUpload) return forbidden()

  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")
  if (!(file instanceof File)) return fieldError("file", "Nenhuma imagem enviada")

  const result = await saveImage(file)
  if ("error" in result) return fieldError("file", result.error)

  return NextResponse.json(result, { status: 201 })
})
