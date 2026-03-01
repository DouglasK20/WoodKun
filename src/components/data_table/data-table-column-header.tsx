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
            className="-ml-3 h-8 hover:bg-wood-muted/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            <span>{title}</span>
            {isSorted === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
            ) : isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
        </Button>
    )
}
