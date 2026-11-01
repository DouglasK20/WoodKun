"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { QuoteInput } from "@/schemas/quote"
import type { QuoteDetail, QuoteListItem } from "@/services/quoteService"
import { apiFetch, type Json } from "@/utils/apiClient"

export type QuoteListResponse = Json<QuoteListItem>
export type QuoteResponse = Json<QuoteDetail>

// Chaves do cache. Invalidar ["quotes"] atualiza a lista e todos os detalhes de uma vez
export const quoteKeys = {
  all: ["quotes"] as const,
  detail: (id: number) => ["quotes", id] as const,
}

export function useQuotes() {
  return useQuery({
    queryKey: quoteKeys.all,
    queryFn: () => apiFetch<QuoteListResponse[]>("/api/quotes"),
  })
}

export function useQuote(id: number | undefined) {
  return useQuery({
    queryKey: quoteKeys.detail(id!),
    queryFn: () => apiFetch<QuoteResponse>(`/api/quotes/${id}`),
    // Sem id (tela de cadastro) não busca nada
    enabled: id !== undefined,
  })
}

export function useSaveQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: QuoteInput }) =>
      apiFetch<QuoteResponse>(id ? `/api/quotes/${id}` : "/api/quotes", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all })
      // Os indicadores do Início são calculados a partir dos orçamentos
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useDeleteQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/api/quotes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all })
      // Os indicadores do Início são calculados a partir dos orçamentos
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
