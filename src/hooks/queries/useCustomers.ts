"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Customer } from "@/db/schema"
import type { CustomerInput } from "@/schemas/customer"
import { apiFetch, type Json } from "@/utils/apiClient"

export type CustomerResponse = Json<Customer>

// Chaves do cache. Invalidar ["customers"] atualiza a lista e todos os detalhes de uma vez
export const customerKeys = {
  all: ["customers"] as const,
  detail: (id: number) => ["customers", id] as const,
}

export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.all,
    queryFn: () => apiFetch<CustomerResponse[]>("/api/customers"),
  })
}

export function useCustomer(id: number | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(id!),
    queryFn: () => apiFetch<CustomerResponse>(`/api/customers/${id}`),
    // Sem id (tela de cadastro) não busca nada
    enabled: id !== undefined,
  })
}

export function useSaveCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: CustomerInput }) =>
      apiFetch<CustomerResponse>(id ? `/api/customers/${id}` : "/api/customers", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/api/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  })
}
