import { z } from "zod"
import { addressFields, contactFields, optionalText } from "./common"

// Usado no formulário (client) e na API (server)
export const customerSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(255, "Máximo de 255 caracteres"),
  ...contactFields,
  ...addressFields,
  notes: optionalText(2000),
})

export type CustomerInput = z.infer<typeof customerSchema>
