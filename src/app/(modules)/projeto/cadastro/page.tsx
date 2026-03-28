import { SetModuleBreadcrumb } from "../../_components/ModuleBreadcrumb"

const breadcrumbTrail = [
  { label: "Início", href: "/" },
  { label: "Projetos", href: "/" },
  { label: "Cadastro de projetos" },
] as const

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <SetModuleBreadcrumb items={[...breadcrumbTrail]} />
      <h1 className="text-2xl font-bold mb-4">Cadastro de Projetos</h1>
      <p className="text-muted-foreground">Página de cadastro de projetos em construção.</p>
    </div>
  )
}