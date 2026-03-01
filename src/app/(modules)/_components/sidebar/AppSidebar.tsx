"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Package, Box } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/shadcn/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip"

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/materiais", label: "Materiais", icon: Box },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar side="left" variant="inset" collapsible="icon">
      <SidebarHeader className="flex h-16 min-h-16 shrink-0 items-center justify-start border-b border-sidebar-border px-5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 box-border">
        <Link href="/" className="flex min-w-0 flex-1 items-center justify-start group-data-[collapsible=icon]:justify-center">
          <Image
            src="/assets/Logotipo-Transparente-WoodKun.png"
            alt="WoodKun - Especialista em Madeira e Projetos"
            width={260}
            height={90}
            className="h-12 w-auto max-w-[260px] object-contain object-left group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:max-w-none group-data-[collapsible=icon]:object-center"
            priority
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-4">
          <SidebarGroupContent className="w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-3 group-data-[collapsible=icon]:[&_span]:hidden group-data-[collapsible=icon]:w-fit">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      size="lg"
                      className="[&>svg]:size-5 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!justify-center"
                    >
                      <Link href={item.href}>
                        <Icon className="size-5 shrink-0" />
                        <span className="text-base">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-row items-center justify-center border-t border-sidebar-border p-3 group-data-[collapsible=icon]:p-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="size-10 cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent side="right">Abrir/Fechar menu</TooltipContent>
        </Tooltip>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
