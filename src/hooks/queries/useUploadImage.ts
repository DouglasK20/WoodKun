"use client"

import { useMutation } from "@tanstack/react-query"
import { apiFetch } from "@/utils/apiClient"

// Envia o arquivo e devolve a URL onde ele ficou salvo (que depois vai no campo imageUrl do form)
export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData()
      body.append("file", file)
      return apiFetch<{ url: string }>("/api/uploads", { method: "POST", body })
    },
  })
}
