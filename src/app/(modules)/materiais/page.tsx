import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { MaterialsTable } from "./_components/MaterialsTable"

// Os dados são buscados no client pela API (React Query), a página só monta a estrutura
export default function MaterialsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Materiais</h1>

      <MaterialsTable
        toolbarActions={
          <Button asChild>
            <Link href="/materiais/cadastro">
              <Plus />
              Novo material
            </Link>
          </Button>
        }
      />
    </div>
  )
}
