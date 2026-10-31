import * as React from "react"
import { cn } from "@/utils/cn"

// <select> nativo com o mesmo visual do Input
export const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm",
        className
      )}
      {...props}
    />
  )
)
NativeSelect.displayName = "NativeSelect"
