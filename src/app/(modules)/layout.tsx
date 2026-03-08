import { SidebarProvider, SidebarInset } from "@/components/shadcn/sidebar"
import { AppSidebar } from "./_components/sidebar/AppSidebar"

export default function ModulesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4 transition-[height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
          <span className="font-semibold">Projetos</span>
        </header>
        <main className="flex flex-col overflow-auto w-full">
          <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
