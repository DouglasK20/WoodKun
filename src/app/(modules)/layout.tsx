import Link from "next/link"
import { redirect } from "next/navigation"
import { Settings } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/shadcn/sidebar"
import { Button } from "@/components/shadcn/button"
import { UserProvider } from "@/components/providers/UserProvider"
import { getCurrentUser } from "@/services/session"
import { hasPermission } from "@/utils/permissions"
import { LogoutButton } from "./_components/LogoutButton"
import { AppSidebar } from "./_components/sidebar/AppSidebar"

export default async function ModulesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Todas as telas do sistema passam por aqui: sem sessão válida, vai para o login
  // (exceção à regra "dados só pela API": a checagem precisa rodar no servidor, antes da página aparecer)
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const currentUser = { id: user.id, name: user.name, email: user.email, role: user.role ?? null }

  return (
    <UserProvider user={currentUser}>
      {/* Layout de aplicativo: tudo com a altura da tela e só o conteúdo rola (sidebar e cabeçalho ficam parados) */}
      <SidebarProvider className="h-svh overflow-hidden">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-end gap-2 border-b border-border px-4 transition-[height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
            <span className="mr-2 hidden text-sm text-muted-foreground sm:inline">Olá, {user.name.split(" ")[0]}</span>
            {hasPermission(user.role, { company: ["write"] }) && (
              <Button variant="outline" size="icon" className="size-9" asChild title="Configurações">
                <Link href="/configuracoes" aria-label="Configurações">
                  <Settings />
                </Link>
              </Button>
            )}
            <LogoutButton />
          </header>
          {/* div, não main: o SidebarInset já é o <main>. min-h-0 deixa um filho de flex encolher e rolar */}
          <div className="min-h-0 w-full flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  )
}
