import { NextResponse } from "next/server"
import { companySchema } from "@/schemas/company"
import { getCompany, saveCompany } from "@/services/companyService"
import { parseBody, withAuth } from "@/utils/api"

// GET /api/company (null enquanto não foi configurada). Só para quem edita a empresa: o PDF lê pelo service
export const GET = withAuth(async () => {
  return NextResponse.json(await getCompany())
}, { company: ["write"] })

// PUT /api/company (cria na primeira vez, atualiza nas próximas)
export const PUT = withAuth(async (request: Request) => {
  const { data, errorResponse } = await parseBody(request, companySchema)
  if (errorResponse) return errorResponse

  return NextResponse.json(await saveCompany(data))
}, { company: ["write"] })
