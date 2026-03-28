import { HomePage } from "./_components/HomePage"
import { SetModuleBreadcrumb } from "./_components/ModuleBreadcrumb"

const breadcrumbTrail = [
  { label: "Início", href: "/" },
  { label: "Projetos" },
] as const

export default function Page() {
  return (
    <div>
      <SetModuleBreadcrumb items={[...breadcrumbTrail]} />
      <HomePage />
    </div>
  )
}