import { NextResponse } from "next/server"
import { getDashboard } from "@/services/dashboardService"
import { withAuth } from "@/utils/api"

// GET /api/dashboard: indicadores do Início (qualquer usuário logado)
export const GET = withAuth(async () => {
  return NextResponse.json(await getDashboard())
})
