"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ProductInput } from "@/schemas/product"
import type { ProductDetail, ProductListItem } from "@/services/productService"
import { apiFetch, type Json } from "@/utils/apiClient"

// Tipos vindos do service (import type some no build, então não leva código do servidor para o client)
export type ProductListResponse = Json<ProductListItem>
export type ProductResponse = Json<ProductDetail>

// Chaves do cache. Invalidar ["products"] atualiza a lista e todos os detalhes de uma vez
export const productKeys = {
  all: ["products"] as const,
  detail: (id: number) => ["products", id] as const,
}

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: () => apiFetch<ProductListResponse[]>("/api/products"),
  })
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id!),
    queryFn: () => apiFetch<ProductResponse>(`/api/products/${id}`),
    // Sem id (tela de cadastro) não busca nada
    enabled: id !== undefined,
  })
}

export function useSaveProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: ProductInput }) =>
      apiFetch<ProductResponse>(id ? `/api/products/${id}` : "/api/products", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (saved) => {
      // Já deixa o registro salvo no cache: ao virar a tela de edição, ela abre sem "carregando"
      queryClient.setQueryData(productKeys.detail(saved.id), saved)
      return queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}
