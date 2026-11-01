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
      <SidebarProvider>
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
          <main className="flex flex-col overflow-auto w-full">
            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  )
}
