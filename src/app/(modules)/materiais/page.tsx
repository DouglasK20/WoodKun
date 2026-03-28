import { SetModuleBreadcrumb } from "../_components/ModuleBreadcrumb"

const breadcrumbTrail = [
  { label: "Início", href: "/" },
  { label: "Materiais" },
] as const

export default function MateriaisPage() {
  return (
    <div className="container mx-auto p-4">
      <SetModuleBreadcrumb items={[...breadcrumbTrail]} />
      <h1 className="text-2xl font-bold mb-4">Materiais</h1>
      <p className="text-muted-foreground">Página de materiais em construção.</p>
    </div>
  )
}
