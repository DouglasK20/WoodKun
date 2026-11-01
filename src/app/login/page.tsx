import Image from "next/image"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/services/session"
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center gap-2 text-center">
          <Image src="/assets/Logotipo-WoodKun-pdf.png" alt="WoodKun" width={80} height={62} priority />
          <h1 className="text-xl font-bold">Entrar no WoodKun</h1>
          <p className="text-sm text-muted-foreground">Use o e-mail e a senha da sua conta.</p>
        </div>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  )
}
