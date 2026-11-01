import { NextResponse } from "next/server"
import { customerSchema } from "@/schemas/customer"
import { createCustomer, listCustomers } from "@/services/customerService"
import { parseBody, withAuth } from "@/utils/api"

// GET /api/customers
export const GET = withAuth(async () => {
  return NextResponse.json(await listCustomers())
})

// POST /api/customers
export const POST = withAuth(async (request: Request) => {
  const { data, errorResponse } = await parseBody(request, customerSchema)
  if (errorResponse) return errorResponse

  const customer = await createCustomer(data)
  return NextResponse.json(customer, { status: 201 })
}, { customers: ["write"] })
