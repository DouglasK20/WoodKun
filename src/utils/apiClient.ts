// Cliente HTTP usado pelos hooks do React Query para falar com src/app/api

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors?: Record<string, string[] | undefined>
  ) {
    super(message)
  }
}

// O fetch não lança erro em respostas 4xx/5xx, então convertemos em ApiError para o React Query tratar como falha
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    // Com FormData (upload) o navegador define o Content-Type sozinho, incluindo o separador das partes
    headers: init?.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init?.headers },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.error ?? "Erro inesperado. Tente novamente.", response.status, body?.fieldErrors)
  }

  // 204 No Content não tem corpo
  return (response.status === 204 ? undefined : await response.json()) as T
}

// No JSON as datas chegam como string; este tipo reflete isso a partir do tipo do banco
export type Json<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K] extends Date | null ? string | null : T[K]
}
