import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { Can } from "@/components/providers/UserProvider"
import { QuotesTable } from "./orcamentos/_components/QuotesTable"

// Início = listagem de orçamentos. Os dados são buscados no client pela API (React Query)
export default function HomePage() {
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
