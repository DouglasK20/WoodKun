import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { Can } from "@/components/providers/UserProvider"
import { ProductsTable } from "./_components/ProductsTable"

// Os dados são buscados no client pela API (React Query), a página só monta a estrutura
export default function ProductsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Produtos</h1>

      <ProductsTable
        toolbarActions={
          <Can permission={{ products: ["write"] }}>
            <Button asChild>
              <Link href="/produtos/cadastro">
                <Plus />
                Novo produto
              </Link>
            </Button>
          </Can>
        }
      />
    </div>
  )
}
