import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { CustomersTable } from "./_components/CustomersTable"

// Os dados são buscados no client pela API (React Query), a página só monta a estrutura
export default function CustomersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <CustomersTable
        toolbarActions={
          <Button asChild>
            <Link href="/clientes/cadastro">
              <Plus />
              Novo cliente
            </Link>
          </Button>
        }
      />
    </div>
  )
}
