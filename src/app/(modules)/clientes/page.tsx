import { SetModuleBreadcrumb } from "../_components/ModuleBreadcrumb"

const breadcrumbTrail = [
  { label: "Início", href: "/" },
  { label: "Clientes" },
] as const

export default function ClientesPage() {
  return (
    <div className="container mx-auto p-4">
      <SetModuleBreadcrumb items={[...breadcrumbTrail]} />
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      <p className="text-muted-foreground">Página de clientes em construção.</p>
    </div>
  )
}
