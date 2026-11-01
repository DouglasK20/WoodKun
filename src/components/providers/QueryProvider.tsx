"use client"

import { useState } from "react"
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ApiError } from "@/utils/apiClient"

// Sessão venceu com a tela aberta: qualquer 401 da API manda para o login, lembrando de onde a pessoa estava
// (na própria tela de login o 401 é "senha errada", então lá não redireciona)
function redirectToLoginOnUnauthorized(error: Error) {
  if (!(error instanceof ApiError) || error.status !== 401) return
  if (window.location.pathname === "/login") return

  const next = window.location.pathname + window.location.search
  window.location.assign(`/login?next=${encodeURIComponent(next)}`)
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState garante um QueryClient por usuário/aba, criado uma vez só
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: redirectToLoginOnUnauthorized }),
        mutationCache: new MutationCache({ onError: redirectToLoginOnUnauthorized }),
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
