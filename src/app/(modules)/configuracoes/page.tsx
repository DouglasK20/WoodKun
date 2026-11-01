import { Can, NoPermission } from "@/components/providers/UserProvider"
import { CompanyForm } from "./_components/CompanyForm"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações da empresa</h1>
      <Can permission={{ company: ["write"] }} fallback={<NoPermission />}>
        <CompanyForm />
      </Can>
    </div>
  )
}
