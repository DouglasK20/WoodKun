import { z } from "zod"
import { MEASUREMENT_UNITS } from "@/db/constants"
import { imageUrlSchema } from "./common"

// Usado no formulário (client) e na API (server)
export const materialSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(255, "Máximo de 255 caracteres"),
  description: z.string().trim().max(2000, "Máximo de 2000 caracteres"),
  measurementUnit: z.enum(MEASUREMENT_UNITS, { error: "Selecione a unidade" }),
  unitPrice: z
    .number({ error: "Informe o valor" })
    .positive("O valor deve ser maior que zero")
    .max(99_999_999.99, "Valor muito alto"),
  imageUrl: imageUrlSchema,
})

export type MaterialInput = z.infer<typeof materialSchema>
