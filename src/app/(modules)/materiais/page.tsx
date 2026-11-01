import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { Can } from "@/components/providers/UserProvider"
import { MaterialsTable } from "./_components/MaterialsTable"

// Os dados são buscados no client pela API (React Query), a página só monta a estrutura
export default function MaterialsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Materiais</h1>

      <MaterialsTable
        toolbarActions={
          <Can permission={{ materials: ["write"] }}>
            <Button asChild>
              <Link href="/materiais/cadastro">
                <Plus />
                Novo material
              </Link>
            </Button>
          </Can>
        }
      />
    </div>
  )
}
