"use client"

import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/shadcn/button"

interface DataTableColumnHeaderProps<TData, TValue> {
    column: Column<TData, TValue>
    title: string
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <span>{title}</span>
    }

    const isSorted = column.getIsSorted()

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-left hover:bg-wood-muted/50 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            <span>{title}</span>
            {isSorted === "desc" ? (
                <ArrowDown className="h-1 w-1" />
            ) : isSorted === "asc" ? (
                <ArrowUp className="h-1 w-1" />
            ) : (
                <ArrowUpDown className="h-1 w-1 opacity-50" />
            )}
        </Button>
    )
}
