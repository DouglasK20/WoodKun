import { z } from "zod"
import { MEASUREMENT_UNITS, QUOTE_STATUSES } from "@/db/constants"
import { calculateItemsTotal } from "@/utils/pricing"

export const QUOTE_ITEM_TYPES = ["MATERIAL", "PRODUCT"] as const

// Cada item guarda uma cópia (descrição, unidade, preço) do material/produto no momento em que entrou no orçamento
export const quoteItemSchema = z
  .object({
    type: z.enum(QUOTE_ITEM_TYPES),
    materialId: z.number().int().positive().nullable(),
    productId: z.number().int().positive().nullable(),
    description: z.string().trim().min(1, "Informe a descrição").max(255, "Máximo de 255 caracteres"),
    measurementUnit: z.enum(MEASUREMENT_UNITS),
    quantity: z
      .number({ error: "Informe a quantidade" })
      .positive("A quantidade deve ser maior que zero")
      .max(9_999_999, "Quantidade muito alta"),
    unitPrice: z
      .number({ error: "Informe o valor" })
      .min(0, "O valor não pode ser negativo")
      .max(99_999_999.99, "Valor muito alto"),
  })
  .refine(
    (item) => (item.type === "MATERIAL" ? item.materialId !== null : item.productId !== null),
    "Item sem material ou produto"
  )

// Usado no formulário (client) e na API (server)
export const quoteSchema = z
  .object({
    customerId: z.number({ error: "Selecione o cliente" }).int().positive("Selecione o cliente"),
    title: z.string().trim().min(1, "Informe o título").max(255, "Máximo de 255 caracteres"),
    status: z.enum(QUOTE_STATUSES, { error: "Status inválido" }),
    discount: z.number({ error: "Informe o desconto (ou 0)" }).min(0, "O desconto não pode ser negativo"),
    // "" quando vazio; senão AAAA-MM-DD (formato que o DatePicker entrega)
    // Num z.union a mensagem de erro é a da própria união, não a das opções
    validUntil: z.union([z.literal(""), z.iso.date()], { error: "Data inválida" }),
    notes: z.string().trim().max(2000, "Máximo de 2000 caracteres"),
    items: z.array(quoteItemSchema).min(1, "Adicione pelo menos um item"),
  })
  .refine((quote) => quote.discount <= calculateItemsTotal(quote.items), {
    message: "O desconto não pode ser maior que o subtotal",
    path: ["discount"],
  })

export type QuoteInput = z.infer<typeof quoteSchema>
export type QuoteItemInput = z.infer<typeof quoteItemSchema>
