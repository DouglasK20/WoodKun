"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/shadcn/input"
import { cn } from "@/utils/cn"

interface DataTableToolbarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function DataTableToolbar({
    value,
    onChange,
    placeholder = "Buscar…",
    className,
}: DataTableToolbarProps) {
    return (
        <div className={cn("relative flex items-center", className)}>
            <Search className="absolute left-3 h-4 w-4 text-wood-muted-foreground" />
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="max-w-sm pl-9 border-wood-border bg-wood-background focus-visible:ring-wood-primary"
            />
        </div>
    )
}
