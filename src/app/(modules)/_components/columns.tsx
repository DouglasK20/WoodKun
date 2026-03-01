"use client"

import { cn } from "@/utils/cn"
import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data_table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ID" />
        ),
        enableSorting: true,
        sortDescFirst: true,
    },
    {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        enableSorting: false,
        cell: ({ row }) => {
            const status = row.original.status;
            const statusColor: Record<string, string> = {
                pending: "bg-yellow-500",
                processing: "bg-blue-500",
                success: "bg-green-500",
                failed: "bg-red-500",
            }

            return <span className={cn("text-center px-2 py-1 rounded-md text-xs font-medium", statusColor[status])}>{status}</span>
        }
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        enableSorting: true,
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Amount" />
        ),
        enableSorting: true,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)

            return <div className="text-center font-medium">{formatted}</div>
        }
    },
]