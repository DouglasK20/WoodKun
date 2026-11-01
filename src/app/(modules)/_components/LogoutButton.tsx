"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/shadcn/button"
import { useLogout } from "@/hooks/queries/useAuth"

export function LogoutButton() {
  const router = useRouter()
  const logout = useLogout()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="cursor-pointer"
      disabled={logout.isPending}
      onClick={() => logout.mutate(undefined, { onSuccess: () => router.replace("/login") })}
    >
      {logout.isPending ? "Saindo…" : "Sair"}
    </Button>
  )
}
