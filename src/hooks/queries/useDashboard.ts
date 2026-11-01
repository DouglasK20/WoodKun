"use client"

import { useQuery } from "@tanstack/react-query"
import type { Dashboard } from "@/services/dashboardService"
import { apiFetch } from "@/utils/apiClient"

export const dashboardKeys = {
  all: ["dashboard"] as const,
}

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: () => apiFetch<Dashboard>("/api/dashboard"),
  })
}
