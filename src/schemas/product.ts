import { z } from "zod"

export const productMaterialSchema = z.object({
  materialId: z.number().int().positive(),
  quantity: z
    .number({ error: "Informe a quantidade" })
    .positive("A quantidade deve ser maior que zero")
    .max(9_999_999, "Quantidade muito alta"),
})

// Usado no formulário (client) e na API (server)
export const productSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(255, "Máximo de 255 caracteres"),
  description: z.string().trim().max(2000, "Máximo de 2000 caracteres"),
  profitMargin: z
    .number({ error: "Informe a margem" })
    .min(0, "A margem não pode ser negativa")
    .max(999.99, "Margem muito alta"),
  materials: z
    .array(productMaterialSchema)
    .min(1, "Adicione pelo menos um material")
    .refine(
      (items) => new Set(items.map((item) => item.materialId)).size === items.length,
      "O mesmo material foi adicionado mais de uma vez"
    ),
})

export type ProductInput = z.infer<typeof productSchema>
