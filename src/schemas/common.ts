import { z } from "zod"
import { BRAZILIAN_STATES } from "@/db/constants"
import { isValidDocument } from "@/utils/documents"
import { onlyDigits } from "@/utils/masks"

// Campos opcionais chegam como "" quando vazios; o service converte "" em null antes de salvar
export const optionalText = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres`)

// "" (sem imagem) ou uma URL gerada pelo nosso upload (/api/uploads/<uuid>.<ext>); nada de URLs externas
export const imageUrlSchema = z
  .string()
  .regex(/^(\/api\/uploads\/[0-9a-f-]{36}\.(jpg|png|webp))?$/, "Imagem inválida")

// Telefone, e-mail e CPF/CNPJ: usados em clientes e na empresa
export const contactFields = {
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
}

// Endereço: usado em clientes e na empresa (e pelo componente AddressFields)
export const addressFields = {
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
}

export const addressSchema = z.object(addressFields)
export type AddressInput = z.infer<typeof addressSchema>
