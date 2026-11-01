"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { LoginInput } from "@/schemas/auth"
import { authClient } from "@/utils/authClient"

// O Better Auth responde com códigos e mensagens em inglês; aqui viram mensagens em português
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos",
  BANNED_USER: "Este usuário está bloqueado. Fale com o administrador.",
  INVALID_EMAIL: "E-mail inválido",
  PASSWORD_TOO_SHORT: "A senha precisa ter pelo menos 8 caracteres",
  PASSWORD_TOO_LONG: "Senha muito longa",
  USER_ALREADY_EXISTS: "Já existe um usuário com esse e-mail",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Já existe um usuário com esse e-mail",
  USER_NOT_FOUND: "Usuário não encontrado",
  YOU_CANNOT_BAN_YOURSELF: "Você não pode bloquear a si mesmo",
  YOU_CANNOT_REMOVE_YOURSELF: "Você não pode excluir a si mesmo",
}

// O client do Better Auth não lança erro: devolve { data, error }. Lançamos para o React Query tratar como falha
export function throwIfAuthError<Result extends { data: unknown; error: { code?: string; message?: string } | null }>(
  result: Result
) {
  if (result.error) {
    const message = (result.error.code && AUTH_ERROR_MESSAGES[result.error.code]) || "Não foi possível concluir. Tente novamente."
    throw new Error(message)
  }
  // Sem erro, o Better Auth sempre devolve os dados
  return result.data as NonNullable<Result["data"]>
}

export function useLogin() {
  return useMutation({
    mutationFn: async (values: LoginInput) => throwIfAuthError(await authClient.signIn.email(values)),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => throwIfAuthError(await authClient.signOut()),
    // Limpa o cache: os dados vistos por quem saiu não podem aparecer para o próximo usuário
    onSuccess: () => queryClient.clear(),
  })
}
