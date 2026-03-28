import { SidebarProvider, SidebarInset } from "@/components/shadcn/sidebar"
import { AppSidebar } from "./_components/sidebar/AppSidebar"
import {
  ModuleBreadcrumbProvider,
  ModuleHeader,
} from "./_components/ModuleBreadcrumb"

export default function ModulesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <ModuleBreadcrumbProvider>
        <AppSidebar />
        <SidebarInset>
          <ModuleHeader />
          <main className="flex flex-col overflow-auto w-full">
            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </ModuleBreadcrumbProvider>
    </SidebarProvider>
  )
}
