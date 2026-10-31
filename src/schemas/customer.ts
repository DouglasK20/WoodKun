import { z } from "zod"
import { BRAZILIAN_STATES } from "@/db/constants"
import { isValidDocument } from "@/utils/documents"
import { onlyDigits } from "@/utils/masks"

// Campos opcionais chegam como "" quando vazios; o service converte "" em null antes de salvar
const optionalText = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres`)

// Usado no formulário (client) e na API (server)
export const customerSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(255, "Máximo de 255 caracteres"),
  phone: optionalText(20).refine(
    (value) => value === "" || [10, 11].includes(onlyDigits(value).length),
    "Telefone inválido"
  ),
  email: optionalText(255).refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "E-mail inválido"
  ),
  document: optionalText(18).refine(
    (value) => value === "" || isValidDocument(value),
    "CPF ou CNPJ inválido"
  ),
  zipCode: optionalText(9).refine(
    (value) => value === "" || onlyDigits(value).length === 8,
    "CEP inválido"
  ),
  street: optionalText(255),
  number: optionalText(20),
  complement: optionalText(100),
  neighborhood: optionalText(100),
  city: optionalText(100),
  state: z.union([z.literal(""), z.enum(BRAZILIAN_STATES)], { error: "UF inválida" }),
  notes: optionalText(2000),
})

export type CustomerInput = z.infer<typeof customerSchema>
