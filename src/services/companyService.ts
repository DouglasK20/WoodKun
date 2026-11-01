// Dados da empresa (linha única, id = 1). Usado pela API; nunca importar em componente client
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { companySettings, type CompanySettings } from "@/db/schema"
import type { CompanyInput } from "@/schemas/company"
import { deleteImage } from "./uploadService"

const COMPANY_ID = 1

// null enquanto a empresa ainda não foi configurada
export async function getCompany(): Promise<CompanySettings | null> {
  const [company] = await db.select().from(companySettings).where(eq(companySettings.id, COMPANY_ID)).limit(1)
  return company ?? null
}

function toRow(input: CompanyInput) {
  return {
    name: input.name,
    document: input.document || null,
    phone: input.phone || null,
    email: input.email || null,
    zipCode: input.zipCode || null,
    street: input.street || null,
    number: input.number || null,
    complement: input.complement || null,
    neighborhood: input.neighborhood || null,
    city: input.city || null,
    state: input.state || null,
    logoUrl: input.logoUrl || null,
  }
}

export async function saveCompany(input: CompanyInput) {
  const existing = await getCompany()
  const row = toRow(input)

  // "Upsert": cria a linha na primeira vez e atualiza nas próximas (ON DUPLICATE KEY UPDATE do MySQL)
  await db
    .insert(companySettings)
    .values({ id: COMPANY_ID, ...row })
    .onDuplicateKeyUpdate({ set: row })

  // Trocou ou removeu o logo: o arquivo antigo não é mais usado
  if (existing && existing.logoUrl !== row.logoUrl) await deleteImage(existing.logoUrl)

  return (await getCompany())!
}
