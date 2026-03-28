import { SetModuleBreadcrumb } from "../_components/ModuleBreadcrumb"

const breadcrumbTrail = [
  { label: "Início", href: "/" },
  { label: "Produtos" },
] as const

export default function ProdutosPage() {
  return (
    <div className="container mx-auto p-4">
      <SetModuleBreadcrumb items={[...breadcrumbTrail]} />
      <h1 className="text-2xl font-bold mb-4">Produtos</h1>
      <p className="text-muted-foreground">Página de produtos em construção.</p>
    </div>
  )
}
