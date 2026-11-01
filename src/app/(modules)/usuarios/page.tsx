import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { Can, NoPermission } from "@/components/providers/UserProvider"
import { UsersTable } from "./_components/UsersTable"

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Usuários</h1>

      <Can permission={{ user: ["list"] }} fallback={<NoPermission />}>
        <UsersTable
          toolbarActions={
            <Button asChild>
              <Link href="/usuarios/cadastro">
                <Plus />
                Novo usuário
              </Link>
            </Button>
          }
        />
      </Can>
    </div>
  )
}
