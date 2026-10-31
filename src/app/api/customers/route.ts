import { NextResponse } from "next/server"
import { customerSchema } from "@/schemas/customer"
import { createCustomer, listCustomers } from "@/services/customerService"
import { parseBody } from "@/utils/api"

// GET /api/customers
export async function GET() {
  return NextResponse.json(await listCustomers())
}

// POST /api/customers
export async function POST(request: Request) {
  const { data, errorResponse } = await parseBody(request, customerSchema)
  if (errorResponse) return errorResponse

  const customer = await createCustomer(data)
  return NextResponse.json(customer, { status: 201 })
}
