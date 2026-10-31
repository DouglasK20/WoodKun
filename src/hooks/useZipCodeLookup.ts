"use client"

import { useMutation } from "@tanstack/react-query"
import { fetchAddressByZipCode } from "@/utils/viaCep"

// useMutation em vez de useQuery: a busca é disparada por uma ação (digitar o CEP), não ao abrir a tela
export function useZipCodeLookup() {
  return useMutation({
    mutationFn: fetchAddressByZipCode,
    retry: false,
  })
}
