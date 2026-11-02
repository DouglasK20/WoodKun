import { z } from "zod"
import { addressFields, contactFields, imageUrlSchema, termsFields } from "./common"

// Usado no formulário (client) e na API (server)
export const companySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da empresa").max(255, "Máximo de 255 caracteres"),
  ...contactFields,
  ...addressFields,
  logoUrl: imageUrlSchema,
  // null = sem validade padrão (o orçamento novo vem sem data)
  defaultValidityDays: z
    .number({ error: "Informe um número de dias" })
    .int("Use um número inteiro de dias")
    .min(1, "Mínimo de 1 dia")
    .max(365, "Máximo de 365 dias")
    .nullable(),
  ...termsFields,
})

export type CompanyInput = z.infer<typeof companySchema>
