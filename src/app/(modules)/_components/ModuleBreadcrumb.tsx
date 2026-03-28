"use client"

import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import Link from "next/link"
import { Button } from "@/components/shadcn/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/shadcn/breadcrumb"

export type ModuleBreadcrumbSegment = {
  label: string
  /** Omitir no último item da trilha (página atual). */
  href?: string
}

type ModuleBreadcrumbContextValue = {
  items: ModuleBreadcrumbSegment[]
  setItems: (items: ModuleBreadcrumbSegment[]) => void
}

const ModuleBreadcrumbContext = createContext<
  ModuleBreadcrumbContextValue | undefined
>(undefined)

function useModuleBreadcrumbContext() {
  const ctx = useContext(ModuleBreadcrumbContext)
  if (!ctx) {
    throw new Error(
      "useModuleBreadcrumbContext deve ser usado dentro de ModuleBreadcrumbProvider"
    )
  }
  return ctx
}

export function ModuleBreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ModuleBreadcrumbSegment[]>([])

  const value = useMemo(
    () => ({
      items,
      setItems,
    }),
    [items]
  )

  return (
    <ModuleBreadcrumbContext.Provider value={value}>
      {children}
    </ModuleBreadcrumbContext.Provider>
  )
}

/** Defina a trilha na sua page (Server ou Client). props precisam ser serializáveis. */
export function SetModuleBreadcrumb({
  items,
}: {
  items: ModuleBreadcrumbSegment[]
}) {
  const { setItems } = useModuleBreadcrumbContext()

  useEffect(() => {
    setItems(items)
    return () => setItems([])
  }, [items, setItems])

  return null
}

export function ModuleHeader() {
  const { items } = useModuleBreadcrumbContext()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4 transition-[height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <Fragment key={`${item.label}-${index}`}>
                {index > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem>
                  {isLast || item.href == null ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <Button type="button" variant="outline" size="sm" className="cursor-pointer shrink-0">
        Sair
      </Button>
    </header>
  )
}
