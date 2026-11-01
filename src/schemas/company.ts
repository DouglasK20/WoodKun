import { z } from "zod"
import { addressFields, contactFields, imageUrlSchema } from "./common"

// Usado no formulário (client) e na API (server)
export const companySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da empresa").max(255, "Máximo de 255 caracteres"),
  ...contactFields,
  ...addressFields,
  logoUrl: imageUrlSchema,
})

export type CompanyInput = z.infer<typeof companySchema>
