import { z } from "zod"
import { ROLES } from "@/utils/permissions"

const password = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres").max(128, "Senha muito longa")

// Cadastro de usuário (feito pelo administrador)
export const newUserSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(255, "Máximo de 255 caracteres"),
  email: z.string().trim().min(1, "Informe o e-mail").pipe(z.email("E-mail inválido")),
  role: z.enum(ROLES, { error: "Selecione o papel" }),
  password,
})

// Edição: o papel e, opcionalmente, uma nova senha ("" = manter a atual)
export const editUserSchema = z.object({
  role: z.enum(ROLES, { error: "Selecione o papel" }),
  password: z.union([z.literal(""), password]),
})

export type NewUserInput = z.infer<typeof newUserSchema>
export type EditUserInput = z.infer<typeof editUserSchema>
