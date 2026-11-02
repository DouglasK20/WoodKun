"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Material } from "@/db/schema"
import type { MaterialInput } from "@/schemas/material"
import { apiFetch, type Json } from "@/utils/apiClient"

export type MaterialResponse = Json<Material>

// Chaves do cache. Invalidar ["materials"] atualiza a lista e todos os detalhes de uma vez
export const materialKeys = {
  all: ["materials"] as const,
  detail: (id: number) => ["materials", id] as const,
}

export function useMaterials() {
  return useQuery({
    queryKey: materialKeys.all,
    queryFn: () => apiFetch<MaterialResponse[]>("/api/materials"),
  })
}

export function useMaterial(id: number | undefined) {
  return useQuery({
    queryKey: materialKeys.detail(id!),
    queryFn: () => apiFetch<MaterialResponse>(`/api/materials/${id}`),
    // Sem id (tela de cadastro) não busca nada
    enabled: id !== undefined,
  })
}

export function useSaveMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: MaterialInput }) =>
      apiFetch<MaterialResponse>(id ? `/api/materials/${id}` : "/api/materials", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (saved) => {
      // Já deixa o registro salvo no cache: ao virar a tela de edição, ela abre sem "carregando"
      queryClient.setQueryData(materialKeys.detail(saved.id), saved)
      queryClient.invalidateQueries({ queryKey: materialKeys.all })
      // O preço dos produtos é calculado a partir dos materiais, então também fica desatualizado
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/api/materials/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.all })
      // O preço dos produtos é calculado a partir dos materiais, então também fica desatualizado
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}
