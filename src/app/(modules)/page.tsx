import { Dashboard } from "./_components/dashboard/Dashboard"

// Início = painel com os indicadores (os orçamentos ficam em /orcamentos)
export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Início</h1>
      <Dashboard />
    </div>
  )
}
