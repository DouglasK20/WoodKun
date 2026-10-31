"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ApiError } from "@/utils/apiClient"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState garante um QueryClient por usuário/aba, criado uma vez só
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Por 30s os dados em cache são considerados frescos e não são buscados de novo
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Erros 4xx (ex.: 404) não mudam tentando de novo; só repete falhas de servidor/rede
            retry: (failureCount, error) =>
              !(error instanceof ApiError && error.status < 500) && failureCount < 3,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Painel para inspecionar o cache; só aparece em desenvolvimento */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
