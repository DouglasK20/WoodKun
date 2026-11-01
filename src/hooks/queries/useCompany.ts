"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CompanySettings } from "@/db/schema"
import type { CompanyInput } from "@/schemas/company"
import { apiFetch, type Json } from "@/utils/apiClient"

export type CompanyResponse = Json<CompanySettings>

export const companyKeys = {
  all: ["company"] as const,
}

// data = null enquanto a empresa não foi configurada
export function useCompany() {
  return useQuery({
    queryKey: companyKeys.all,
    queryFn: () => apiFetch<CompanyResponse | null>("/api/company"),
  })
}

export function useSaveCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: CompanyInput) =>
      apiFetch<CompanyResponse>("/api/company", { method: "PUT", body: JSON.stringify(values) }),
    // Já coloca a resposta no cache, sem precisar buscar de novo
    onSuccess: (company) => queryClient.setQueryData(companyKeys.all, company),
  })
}
