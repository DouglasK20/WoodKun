import Image from "next/image"
import { redirect } from "next/navigation"
import { getCompany } from "@/services/companyService"
import { getCurrentUser } from "@/services/session"
import { BrandPanel, WOOD_GRADIENT, WoodGrain } from "./_components/BrandPanel"
import { LoginForm } from "./_components/LoginForm"

type LoginPageProps = {
  // Para onde voltar depois de entrar (ex.: /login?next=/clientes)
  searchParams: Promise<{ next?: string }>
}

// Fora do grupo (modules): não tem sidebar nem exige login
export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Quem já está logado não precisa ver o login
  if (await getCurrentUser()) redirect("/")

  const { next } = await searchParams
  // Só caminhos internos ("/algo"), nunca "//site.com" ou "https://…": evita redirecionar para outro site (open redirect)
  const redirectTo = next?.startsWith("/") && !next.startsWith("//") ? next : "/"

  // Contato público da marcenaria para "Esqueceu a senha?" (só nome, telefone e e-mail; a API da empresa exige admin)
  const company = await getCompany()
  const support = { companyName: company?.name ?? null, phone: company?.phone ?? null, email: company?.email ?? null }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <BrandPanel />

      <div className="flex flex-col">
        {/* No celular o painel da esquerda some; fica uma faixa com o degradê e o logo */}
        <div className="relative flex items-center gap-3 overflow-hidden px-6 py-5 text-white lg:hidden" style={{ backgroundImage: WOOD_GRADIENT }}>
          <WoodGrain className="absolute inset-0 h-full w-full" />
          <div className="relative rounded-lg bg-white/90 p-1">
            <Image src="/assets/Logotipo-WoodKun-pdf.png" alt="" width={32} height={25} priority />
          </div>
          <span className="relative text-lg font-semibold">WoodKun</span>
        </div>

        <div className="flex flex-1 items-start justify-center px-6 py-12 lg:items-center">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
              <p className="text-muted-foreground">Entre com o seu e-mail e senha para continuar.</p>
            </div>
            <LoginForm redirectTo={redirectTo} support={support} />
          </div>
        </div>
      </div>
    </main>
  )
}
