import { Can, NoPermission } from "@/components/providers/UserProvider"
import { UserForm } from "../_components/UserForm"

type UserFormPageProps = {
  // /usuarios/cadastro = novo, /usuarios/cadastro?id=… = edição (ids de usuário são texto, não número)
  searchParams: Promise<{ id?: string }>
}

export default async function UserFormPage({ searchParams }: UserFormPageProps) {
  const { id } = await searchParams

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{id ? "Editar usuário" : "Novo usuário"}</h1>
      <Can permission={{ user: ["create", "set-role"] }} fallback={<NoPermission />}>
        <UserForm userId={id} />
      </Can>
    </div>
  )
}
