import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { Can } from "@/components/providers/UserProvider"
import { QuotesTable } from "./_components/QuotesTable"

// Os dados são buscados no client pela API (React Query), a página só monta a estrutura
export default function QuotesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orçamentos</h1>

      <QuotesTable
        toolbarActions={
          <Can permission={{ quotes: ["write"] }}>
            <Button asChild>
              <Link href="/orcamentos/cadastro">
                <Plus />
                Novo orçamento
              </Link>
            </Button>
          </Can>
        }
      />
    </div>
  )
}
